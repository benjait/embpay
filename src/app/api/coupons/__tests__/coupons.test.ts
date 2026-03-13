import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { mockPrisma, mockUser } = vi.hoisted(() => ({
  mockPrisma: {
    coupon: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    product: {
      findUnique: vi.fn(),
    },
  },
  mockUser: {
    id: "user_1",
    email: "merchant@test.com",
    name: "Merchant",
    businessName: null,
    stripeAccountId: null,
    stripeConnected: false,
    commissionRate: 0.03,
    createdAt: new Date(),
  },
}));

vi.mock("@/lib/prisma", () => ({ default: mockPrisma }));
vi.mock("@/lib/auth", () => ({
  getAuthUser: vi.fn(() => mockUser),
}));
vi.mock("@/lib/errors", () => ({
  handleApiError: vi.fn((error: unknown) => {
    const { NextResponse } = require("next/server");
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }),
}));

import { GET, POST, DELETE } from "../../coupons/route";
import { POST as VALIDATE } from "../../coupons/validate/route";
import { getAuthUser } from "@/lib/auth";

function makeRequest(method: string, body?: Record<string, unknown>, params?: string) {
  const url = params
    ? `https://test.com/api/coupons?${params}`
    : "https://test.com/api/coupons";
  const opts: RequestInit = { method, headers: { "Content-Type": "application/json" } };
  if (body) opts.body = JSON.stringify(body);
  return new NextRequest(url, opts);
}

function makeValidateRequest(body: Record<string, unknown>) {
  return new NextRequest("https://test.com/api/coupons/validate", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("GET /api/coupons", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 if not authenticated", async () => {
    vi.mocked(getAuthUser).mockResolvedValueOnce(null);
    const res = await GET(makeRequest("GET"));
    expect(res.status).toBe(401);
  });

  it("returns enriched coupons with computed status", async () => {
    mockPrisma.coupon.findMany.mockResolvedValue([
      { id: "c1", code: "ACTIVE", active: true, expiresAt: null, maxUses: 0, usedCount: 0 },
      { id: "c2", code: "EXPIRED", active: true, expiresAt: new Date("2020-01-01"), maxUses: 0, usedCount: 0 },
      { id: "c3", code: "MAXED", active: true, expiresAt: null, maxUses: 5, usedCount: 5 },
      { id: "c4", code: "INACTIVE", active: false, expiresAt: null, maxUses: 0, usedCount: 0 },
    ]);

    const res = await GET(makeRequest("GET"));
    const body = await res.json();
    expect(body.data[0].status).toBe("active");
    expect(body.data[1].status).toBe("expired");
    expect(body.data[2].status).toBe("maxed");
    expect(body.data[3].status).toBe("expired"); // inactive = expired status
  });
});

describe("POST /api/coupons", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 if code missing", async () => {
    const res = await POST(makeRequest("POST", { discount: 0.2 }));
    expect(res.status).toBe(400);
  });

  it("returns 400 if discount missing", async () => {
    const res = await POST(makeRequest("POST", { code: "TEST" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 if discount out of range", async () => {
    let res = await POST(makeRequest("POST", { code: "TEST", discount: 0 }));
    expect(res.status).toBe(400);

    res = await POST(makeRequest("POST", { code: "TEST", discount: 1.5 }));
    expect(res.status).toBe(400);

    res = await POST(makeRequest("POST", { code: "TEST", discount: -0.1 }));
    expect(res.status).toBe(400);
  });

  it("returns 409 for duplicate code", async () => {
    mockPrisma.coupon.findUnique.mockResolvedValue({ id: "existing" });
    const res = await POST(makeRequest("POST", { code: "DUP", discount: 0.1 }));
    expect(res.status).toBe(409);
  });

  it("normalizes code to uppercase", async () => {
    mockPrisma.coupon.findUnique.mockResolvedValue(null);
    mockPrisma.coupon.create.mockResolvedValue({ id: "c1", code: "SAVE20" });

    await POST(makeRequest("POST", { code: "  save20  ", discount: 0.2 }));

    expect(mockPrisma.coupon.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ code: "SAVE20" }),
      })
    );
  });

  it("creates coupon successfully", async () => {
    mockPrisma.coupon.findUnique.mockResolvedValue(null);
    mockPrisma.coupon.create.mockResolvedValue({
      id: "c_new",
      code: "NEW20",
      discount: 0.2,
    });

    const res = await POST(makeRequest("POST", {
      code: "NEW20",
      discount: 0.2,
      maxUses: 100,
    }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});

describe("DELETE /api/coupons", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 if no id provided", async () => {
    const res = await DELETE(makeRequest("DELETE"));
    expect(res.status).toBe(400);
  });

  it("returns 404 if coupon not found", async () => {
    mockPrisma.coupon.findFirst.mockResolvedValue(null);
    const res = await DELETE(makeRequest("DELETE", undefined, "id=nonexistent"));
    expect(res.status).toBe(404);
  });

  it("soft deletes coupon", async () => {
    mockPrisma.coupon.findFirst.mockResolvedValue({ id: "c1", userId: "user_1" });
    mockPrisma.coupon.update.mockResolvedValue({ id: "c1", active: false });

    const res = await DELETE(makeRequest("DELETE", undefined, "id=c1"));
    expect(res.status).toBe(200);
    expect(mockPrisma.coupon.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { active: false },
      })
    );
  });
});

describe("POST /api/coupons/validate", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 if code missing", async () => {
    const res = await VALIDATE(makeValidateRequest({ productId: "p1" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 if productId missing", async () => {
    const res = await VALIDATE(makeValidateRequest({ code: "SAVE" }));
    expect(res.status).toBe(400);
  });

  it("returns 404 for unknown coupon", async () => {
    mockPrisma.coupon.findUnique.mockResolvedValue(null);
    const res = await VALIDATE(makeValidateRequest({ code: "FAKE", productId: "p1" }));
    expect(res.status).toBe(404);
  });

  it("returns 400 for inactive coupon", async () => {
    mockPrisma.coupon.findUnique.mockResolvedValue({
      id: "c1",
      code: "OFF",
      active: false,
      userId: "user_1",
    });
    const res = await VALIDATE(makeValidateRequest({ code: "OFF", productId: "p1" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for expired coupon", async () => {
    mockPrisma.coupon.findUnique.mockResolvedValue({
      id: "c1",
      code: "OLD",
      active: true,
      expiresAt: new Date("2020-01-01"),
      maxUses: 0,
      usedCount: 0,
      userId: "user_1",
    });
    const res = await VALIDATE(makeValidateRequest({ code: "OLD", productId: "p1" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 if usage limit reached", async () => {
    mockPrisma.coupon.findUnique.mockResolvedValue({
      id: "c1",
      code: "FULL",
      active: true,
      expiresAt: null,
      maxUses: 10,
      usedCount: 10,
      userId: "user_1",
    });
    const res = await VALIDATE(makeValidateRequest({ code: "FULL", productId: "p1" }));
    expect(res.status).toBe(400);
  });

  it("returns 404 if product not found", async () => {
    mockPrisma.coupon.findUnique.mockResolvedValue({
      id: "c1",
      code: "VALID",
      active: true,
      expiresAt: null,
      maxUses: 0,
      usedCount: 0,
      userId: "user_1",
    });
    mockPrisma.product.findUnique.mockResolvedValue(null);

    const res = await VALIDATE(makeValidateRequest({ code: "VALID", productId: "p1" }));
    expect(res.status).toBe(404);
  });

  it("returns 400 if coupon belongs to different merchant", async () => {
    mockPrisma.coupon.findUnique.mockResolvedValue({
      id: "c1",
      code: "WRONG",
      active: true,
      expiresAt: null,
      maxUses: 0,
      usedCount: 0,
      userId: "user_other",
    });
    mockPrisma.product.findUnique.mockResolvedValue({
      userId: "user_1",
      price: 5000,
      active: true,
    });

    const res = await VALIDATE(makeValidateRequest({ code: "WRONG", productId: "p1" }));
    expect(res.status).toBe(400);
  });

  it("validates coupon successfully and returns discount", async () => {
    mockPrisma.coupon.findUnique.mockResolvedValue({
      id: "c1",
      code: "SAVE25",
      discount: 0.25,
      active: true,
      expiresAt: null,
      maxUses: 0,
      usedCount: 0,
      userId: "user_1",
    });
    mockPrisma.product.findUnique.mockResolvedValue({
      userId: "user_1",
      price: 10000,
      active: true,
    });

    const res = await VALIDATE(makeValidateRequest({ code: "save25", productId: "p1" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.discount).toBe(2500); // 10000 * 0.25
    expect(body.data.discountPercent).toBe(0.25);
    expect(body.data.message).toContain("25%");
  });
});
