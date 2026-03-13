import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { mockPrisma, mockUser } = vi.hoisted(() => ({
  mockPrisma: {
    product: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
  mockUser: {
    id: "user_1",
    email: "merchant@test.com",
    name: "Merchant",
    businessName: "Test Co",
    stripeAccountId: "acct_123",
    stripeConnected: true,
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

import { GET, POST } from "../../products/route";
import { getAuthUser } from "@/lib/auth";

function makeRequest(method: string, body?: Record<string, unknown>) {
  const opts: RequestInit = { method, headers: { "Content-Type": "application/json" } };
  if (body) opts.body = JSON.stringify(body);
  return new NextRequest("https://test.com/api/products", opts);
}

describe("GET /api/products", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 if not authenticated", async () => {
    vi.mocked(getAuthUser).mockResolvedValueOnce(null);
    const res = await GET(makeRequest("GET"));
    expect(res.status).toBe(401);
  });

  it("returns user products", async () => {
    const products = [
      { id: "p1", name: "Product 1", price: 1000, _count: { orders: 5 } },
      { id: "p2", name: "Product 2", price: 2000, _count: { orders: 10 } },
    ];
    mockPrisma.product.findMany.mockResolvedValue(products);

    const res = await GET(makeRequest("GET"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(2);
  });
});

describe("POST /api/products", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 if not authenticated", async () => {
    vi.mocked(getAuthUser).mockResolvedValueOnce(null);
    const res = await POST(makeRequest("POST", { name: "Test", price: 1000 }));
    expect(res.status).toBe(401);
  });

  it("returns 400 if name missing", async () => {
    const res = await POST(makeRequest("POST", { price: 1000 }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Name");
  });

  it("returns 400 if price not positive", async () => {
    const res = await POST(makeRequest("POST", { name: "Test", price: -100 }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("positive");
  });

  it("returns 400 if price exceeds maximum", async () => {
    const res = await POST(makeRequest("POST", { name: "Test", price: 100000000 }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("maximum");
  });

  it("returns 400 for invalid image URL", async () => {
    const res = await POST(makeRequest("POST", {
      name: "Test",
      price: 1000,
      imageUrl: "ftp://bad.url",
    }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("image URL");
  });

  it("returns 400 for invalid delivery URL", async () => {
    const res = await POST(makeRequest("POST", {
      name: "Test",
      price: 1000,
      deliveryUrl: "not-a-url",
    }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid type", async () => {
    const res = await POST(makeRequest("POST", {
      name: "Test",
      price: 1000,
      type: "invalid_type",
    }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("one_time");
  });

  it("returns 400 for invalid interval", async () => {
    const res = await POST(makeRequest("POST", {
      name: "Test",
      price: 1000,
      interval: "week",
    }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for too long description", async () => {
    const res = await POST(makeRequest("POST", {
      name: "Test",
      price: 1000,
      description: "a".repeat(5001),
    }));
    expect(res.status).toBe(400);
  });

  it("creates product successfully with defaults", async () => {
    const createdProduct = {
      id: "prod_new",
      name: "New Product",
      price: 2999,
      currency: "usd",
      type: "one_time",
    };
    mockPrisma.product.create.mockResolvedValue(createdProduct);

    const res = await POST(makeRequest("POST", {
      name: "New Product",
      price: 2999,
    }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.name).toBe("New Product");
  });

  it("creates product with all optional fields", async () => {
    mockPrisma.product.create.mockResolvedValue({ id: "prod_full" });

    const res = await POST(makeRequest("POST", {
      name: "Full Product",
      price: 5000,
      description: "A great product",
      currency: "eur",
      imageUrl: "https://img.test/pic.jpg",
      type: "subscription",
      interval: "month",
      deliveryType: "download",
      deliveryUrl: "https://dl.test/file.zip",
      pricingType: "pay_what_you_want",
      minimumPrice: 1000,
      trialEnabled: true,
      trialDays: 7,
      bumpEnabled: true,
      bumpPrice: 500,
    }));
    expect(res.status).toBe(201);
  });
});
