import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock all external dependencies
const { mockPrisma, mockStripe } = vi.hoisted(() => ({
  mockPrisma: {
    product: { findUnique: vi.fn() },
    order: { create: vi.fn(), update: vi.fn() },
    coupon: { findUnique: vi.fn(), update: vi.fn() },
  },
  mockStripe: {
    paymentIntents: { create: vi.fn() },
    accounts: { retrieve: vi.fn() },
  },
}));

vi.mock("@/lib/prisma", () => ({ default: mockPrisma }));
vi.mock("@/lib/stripe", () => ({ stripe: mockStripe }));
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn(() => ({ allowed: true, remaining: 19, resetAt: Date.now() + 900000 })),
  getClientIp: vi.fn(() => "127.0.0.1"),
}));

import { POST } from "../../stripe/payment-intent/route";

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest("https://test.com/api/stripe/payment-intent", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

const mockProduct = {
  id: "prod_1",
  name: "Test Product",
  price: 5000,
  currency: "usd",
  active: true,
  pricingType: "fixed",
  minimumPrice: null,
  bumpEnabled: false,
  bumpPrice: null,
  user: {
    id: "user_1",
    stripeAccountId: "acct_123",
    stripeConnected: true,
  },
};

describe("POST /api/stripe/payment-intent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
    mockPrisma.order.create.mockResolvedValue({ id: "order_1", amount: 5000, currency: "usd" });
    mockPrisma.order.update.mockResolvedValue({});
    mockStripe.paymentIntents.create.mockResolvedValue({
      id: "pi_123",
      client_secret: "pi_123_secret",
    });
    mockStripe.accounts.retrieve.mockResolvedValue({ charges_enabled: true });
  });

  it("returns 400 if productId missing", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Product ID");
  });

  it("returns 400 for invalid email", async () => {
    const res = await POST(makeRequest({ productId: "prod_1", customerEmail: "bad-email" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("email");
  });

  it("returns 404 if product not found", async () => {
    mockPrisma.product.findUnique.mockResolvedValue(null);
    const res = await POST(makeRequest({ productId: "prod_missing" }));
    expect(res.status).toBe(404);
  });

  it("returns 404 if product is inactive", async () => {
    mockPrisma.product.findUnique.mockResolvedValue({ ...mockProduct, active: false });
    const res = await POST(makeRequest({ productId: "prod_1" }));
    expect(res.status).toBe(404);
  });

  it("creates payment intent successfully", async () => {
    const res = await POST(makeRequest({
      productId: "prod_1",
      customerEmail: "buyer@test.com",
      customerName: "Test Buyer",
    }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.clientSecret).toBe("pi_123_secret");
    expect(body.data.orderId).toBe("order_1");
  });

  it("creates order with 0% platform fee", async () => {
    await POST(makeRequest({ productId: "prod_1" }));
    expect(mockPrisma.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ platformFee: 0 }),
      })
    );
  });

  it("applies coupon discount", async () => {
    mockPrisma.coupon.findUnique.mockResolvedValue({
      id: "coupon_1",
      code: "SAVE20",
      discount: 0.2,
      active: true,
      userId: "user_1",
      expiresAt: null,
      maxUses: 0,
      usedCount: 0,
    });

    await POST(makeRequest({
      productId: "prod_1",
      couponCode: "save20",
    }));

    // 5000 * 0.2 = 1000 discount, total = 4000
    expect(mockPrisma.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ amount: 4000 }),
      })
    );
    expect(mockPrisma.coupon.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { usedCount: { increment: 1 } },
      })
    );
  });

  it("returns 400 for expired coupon", async () => {
    mockPrisma.coupon.findUnique.mockResolvedValue({
      id: "coupon_1",
      code: "EXPIRED",
      discount: 0.2,
      active: true,
      userId: "user_1",
      expiresAt: new Date("2020-01-01"),
      maxUses: 0,
      usedCount: 0,
    });

    const res = await POST(makeRequest({
      productId: "prod_1",
      couponCode: "EXPIRED",
    }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("expired");
  });

  it("returns 400 for maxed out coupon", async () => {
    mockPrisma.coupon.findUnique.mockResolvedValue({
      id: "coupon_1",
      code: "MAXED",
      discount: 0.2,
      active: true,
      userId: "user_1",
      expiresAt: null,
      maxUses: 5,
      usedCount: 5,
    });

    const res = await POST(makeRequest({
      productId: "prod_1",
      couponCode: "MAXED",
    }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("limit");
  });

  it("enforces minimum amount of 50 cents", async () => {
    mockPrisma.product.findUnique.mockResolvedValue({ ...mockProduct, price: 30 });
    mockPrisma.coupon.findUnique.mockResolvedValue({
      id: "coupon_1",
      code: "BIG",
      discount: 0.9,
      active: true,
      userId: "user_1",
      expiresAt: null,
      maxUses: 0,
      usedCount: 0,
    });

    await POST(makeRequest({ productId: "prod_1", couponCode: "BIG" }));

    expect(mockPrisma.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ amount: 50 }),
      })
    );
  });

  it("adds bump price when enabled", async () => {
    mockPrisma.product.findUnique.mockResolvedValue({
      ...mockProduct,
      bumpEnabled: true,
      bumpPrice: 1000,
    });

    await POST(makeRequest({
      productId: "prod_1",
      includeBump: true,
    }));

    // 5000 + 1000 = 6000
    expect(mockPrisma.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ amount: 6000 }),
      })
    );
  });

  it("validates custom price for pay-what-you-want", async () => {
    mockPrisma.product.findUnique.mockResolvedValue({
      ...mockProduct,
      pricingType: "pay_what_you_want",
      minimumPrice: 2000,
    });

    const res = await POST(makeRequest({
      productId: "prod_1",
      customPrice: 1000,
    }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("at least");
  });

  it("sets transfer_data for connected Stripe accounts", async () => {
    await POST(makeRequest({ productId: "prod_1" }));

    expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({
        transfer_data: { destination: "acct_123" },
      })
    );
  });

  it("skips transfer_data if account not charges-enabled", async () => {
    mockStripe.accounts.retrieve.mockResolvedValue({ charges_enabled: false });

    await POST(makeRequest({ productId: "prod_1" }));

    const callArgs = mockStripe.paymentIntents.create.mock.calls[0][0];
    expect(callArgs.transfer_data).toBeUndefined();
  });
});
