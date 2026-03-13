import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { mockPrisma, mockStripe } = vi.hoisted(() => {
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret";
  return {
    mockPrisma: {
      webhookLog: { findUnique: vi.fn(), upsert: vi.fn() },
      order: { update: vi.fn(), findMany: vi.fn(), updateMany: vi.fn() },
    },
    mockStripe: {
      webhooks: { constructEvent: vi.fn() },
    },
  };
});

vi.mock("@/lib/prisma", () => ({ default: mockPrisma }));
vi.mock("@/lib/stripe", () => ({ stripe: mockStripe }));
vi.mock("@/lib/email", () => ({
  sendOrderConfirmation: vi.fn(),
  sendRefundNotification: vi.fn(),
}));

import { POST } from "../../stripe/webhook/route";

function makeWebhookRequest(body: string, signature = "sig_valid") {
  return new NextRequest("https://test.com/api/stripe/webhook", {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/json",
      "stripe-signature": signature,
    },
  });
}

describe("POST /api/stripe/webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.webhookLog.findUnique.mockResolvedValue(null);
    mockPrisma.webhookLog.upsert.mockResolvedValue({});
  });

  it("returns 400 if missing signature header", async () => {
    const req = new NextRequest("https://test.com/api/stripe/webhook", {
      method: "POST",
      body: "{}",
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("signature");
  });

  it("returns 400 for invalid signature", async () => {
    mockStripe.webhooks.constructEvent.mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    const res = await POST(makeWebhookRequest("{}", "bad_sig"));
    expect(res.status).toBe(400);
  });

  it("skips duplicate events", async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      id: "evt_dup",
      type: "payment_intent.succeeded",
      data: { object: {} },
    });
    mockPrisma.webhookLog.findUnique.mockResolvedValue({
      eventId: "evt_dup",
      processed: true,
    });

    const res = await POST(makeWebhookRequest("{}"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.duplicate).toBe(true);
  });

  it("handles payment_intent.succeeded - updates order", async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      id: "evt_success",
      type: "payment_intent.succeeded",
      data: {
        object: {
          id: "pi_123",
          metadata: { orderId: "order_1" },
          latest_charge: "ch_123",
        },
      },
    });

    mockPrisma.order.update.mockResolvedValue({
      id: "order_1",
      customerName: "Test",
      customerEmail: "test@test.com",
      amount: 5000,
      createdAt: new Date(),
      product: { name: "Test Product", downloadUrl: null },
    });

    const res = await POST(makeWebhookRequest("{}"));
    expect(res.status).toBe(200);
    expect(mockPrisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "order_1" },
        data: expect.objectContaining({ status: "completed" }),
      })
    );
  });

  it("handles payment_intent.succeeded - fallback lookup by PI id", async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      id: "evt_no_meta",
      type: "payment_intent.succeeded",
      data: {
        object: {
          id: "pi_456",
          metadata: {},
          latest_charge: "ch_456",
        },
      },
    });

    mockPrisma.order.findMany.mockResolvedValue([
      {
        id: "order_2",
        customerName: "Fallback",
        customerEmail: "fb@test.com",
        amount: 3000,
        createdAt: new Date(),
        product: { name: "Fallback Product", downloadUrl: null },
      },
    ]);
    mockPrisma.order.updateMany.mockResolvedValue({});

    const res = await POST(makeWebhookRequest("{}"));
    expect(res.status).toBe(200);
    expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { stripePaymentIntentId: "pi_456" },
      })
    );
  });

  it("handles payment_intent.payment_failed", async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      id: "evt_fail",
      type: "payment_intent.payment_failed",
      data: {
        object: {
          id: "pi_fail",
          metadata: { orderId: "order_fail" },
        },
      },
    });
    mockPrisma.order.update.mockResolvedValue({});

    const res = await POST(makeWebhookRequest("{}"));
    expect(res.status).toBe(200);
    expect(mockPrisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: "failed" },
      })
    );
  });

  it("handles charge.refunded - full refund", async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      id: "evt_refund",
      type: "charge.refunded",
      data: {
        object: {
          id: "ch_refund",
          payment_intent: "pi_refund",
          amount: 5000,
          amount_refunded: 5000,
        },
      },
    });

    mockPrisma.order.findMany.mockResolvedValue([
      {
        id: "order_refund",
        customerName: "Refund User",
        customerEmail: "refund@test.com",
        product: { name: "Refund Product" },
      },
    ]);
    mockPrisma.order.updateMany.mockResolvedValue({});

    const res = await POST(makeWebhookRequest("{}"));
    expect(res.status).toBe(200);
    expect(mockPrisma.order.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: "refunded" },
      })
    );
  });

  it("handles charge.refunded - partial refund", async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      id: "evt_partial",
      type: "charge.refunded",
      data: {
        object: {
          id: "ch_partial",
          payment_intent: "pi_partial",
          amount: 5000,
          amount_refunded: 2000,
        },
      },
    });

    mockPrisma.order.findMany.mockResolvedValue([]);
    mockPrisma.order.updateMany.mockResolvedValue({});

    const res = await POST(makeWebhookRequest("{}"));
    expect(res.status).toBe(200);
    expect(mockPrisma.order.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: "partially_refunded" },
      })
    );
  });

  it("handles checkout.session.completed", async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      id: "evt_checkout",
      type: "checkout.session.completed",
      data: {
        object: {
          metadata: { orderId: "order_cs" },
          payment_intent: "pi_cs",
          customer_details: { email: "checkout@test.com" },
        },
      },
    });
    mockPrisma.order.update.mockResolvedValue({});

    const res = await POST(makeWebhookRequest("{}"));
    expect(res.status).toBe(200);
    expect(mockPrisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "order_cs" },
        data: expect.objectContaining({
          status: "completed",
          customerEmail: "checkout@test.com",
        }),
      })
    );
  });

  it("handles checkout.session.expired", async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      id: "evt_expired",
      type: "checkout.session.expired",
      data: {
        object: {
          metadata: { orderId: "order_exp" },
        },
      },
    });
    mockPrisma.order.update.mockResolvedValue({});

    const res = await POST(makeWebhookRequest("{}"));
    expect(res.status).toBe(200);
    expect(mockPrisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: "failed" },
      })
    );
  });

  it("logs unhandled event types", async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      id: "evt_unknown",
      type: "some.other.event",
      data: { object: {} },
    });

    const res = await POST(makeWebhookRequest("{}"));
    expect(res.status).toBe(200);
    expect(mockPrisma.webhookLog.upsert).toHaveBeenCalled();
  });
});
