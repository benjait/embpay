import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { mockPrisma, mockStripe } = vi.hoisted(() => {
  process.env.STRIPE_SECRET_KEY = "sk_test_mock";
  const ms = {
    paymentIntents: { retrieve: vi.fn() },
  };
  return {
    mockPrisma: {
      order: {
        findFirst: vi.fn(),
        update: vi.fn(),
      },
      apiKey: {
        findUnique: vi.fn(),
      },
    },
    mockStripe: ms,
  };
});

vi.mock("@/lib/prisma", () => ({ default: mockPrisma }));
vi.mock("stripe", () => {
  return {
    default: class Stripe {
      constructor() {
        return mockStripe;
      }
    },
  };
});

import { POST } from "../../orders/confirm/route";

function makeRequest(body: Record<string, unknown>, apiKey = "embp_live_sk_test123") {
  return new NextRequest("https://test.com/api/orders/confirm", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
  });
}

describe("POST /api/orders/confirm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.apiKey.findUnique.mockResolvedValue({
      id: "key_1",
      key: "embp_live_sk_test123",
      active: true,
      user: { id: "user_1" },
    });
  });

  it("returns 401 if no Authorization header", async () => {
    const req = new NextRequest("https://test.com/api/orders/confirm", {
      method: "POST",
      body: JSON.stringify({ orderId: "o1" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 401 for invalid API key", async () => {
    mockPrisma.apiKey.findUnique.mockResolvedValue(null);
    const res = await POST(makeRequest({ orderId: "o1" }, "bad_key"));
    expect(res.status).toBe(401);
  });

  it("returns 400 if neither orderId nor paymentIntentId provided", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it("returns 404 if order not found", async () => {
    mockPrisma.order.findFirst.mockResolvedValue(null);
    const res = await POST(makeRequest({ orderId: "nonexistent" }));
    expect(res.status).toBe(404);
  });

  it("confirms order by orderId", async () => {
    mockPrisma.order.findFirst.mockResolvedValue({
      id: "order_1",
      status: "pending",
      stripePaymentIntentId: null,
    });
    mockPrisma.order.update.mockResolvedValue({
      id: "order_1",
      status: "completed",
      amount: 5000,
      currency: "usd",
      customerEmail: "buyer@test.com",
    });

    const res = await POST(makeRequest({ orderId: "order_1" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.order.status).toBe("completed");
  });

  it("confirms order by paymentIntentId with Stripe verification", async () => {
    mockPrisma.order.findFirst.mockResolvedValue({
      id: "order_2",
      status: "pending",
      stripePaymentIntentId: "pi_verify",
    });
    mockStripe.paymentIntents.retrieve.mockResolvedValue({ status: "succeeded" });
    mockPrisma.order.update.mockResolvedValue({
      id: "order_2",
      status: "completed",
      amount: 3000,
      currency: "usd",
      customerEmail: "buyer2@test.com",
    });

    const res = await POST(makeRequest({ paymentIntentId: "pi_verify" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it("returns 400 if Stripe payment not succeeded", async () => {
    mockPrisma.order.findFirst.mockResolvedValue({
      id: "order_3",
      status: "pending",
    });
    mockStripe.paymentIntents.retrieve.mockResolvedValue({ status: "requires_payment_method" });

    const res = await POST(makeRequest({ paymentIntentId: "pi_fail" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("not confirmed");
  });
});
