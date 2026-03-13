import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { mockSignIn } = vi.hoisted(() => ({
  mockSignIn: vi.fn(),
}));

vi.mock("@/lib/supabase-server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      signInWithPassword: mockSignIn,
    },
  })),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn(() => ({ allowed: true, remaining: 9, resetAt: Date.now() + 900000 })),
  getClientIp: vi.fn(() => "127.0.0.1"),
}));

vi.mock("@/lib/errors", () => ({
  handleApiError: vi.fn((error: unknown) => {
    const { NextResponse } = require("next/server");
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }),
}));

import { POST } from "../../auth/login/route";

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest("https://test.com/api/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 if email missing", async () => {
    const res = await POST(makeRequest({ password: "12345678" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 if password missing", async () => {
    const res = await POST(makeRequest({ email: "test@test.com" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid email format", async () => {
    const res = await POST(makeRequest({ email: "bad", password: "12345678" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("email");
  });

  it("returns 400 if password too long", async () => {
    const res = await POST(makeRequest({
      email: "test@test.com",
      password: "a".repeat(129),
    }));
    expect(res.status).toBe(400);
  });

  it("returns 401 for invalid credentials", async () => {
    mockSignIn.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: "Invalid login credentials" },
    });

    const res = await POST(makeRequest({
      email: "test@test.com",
      password: "wrongpass123",
    }));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Invalid email or password");
  });

  it("returns 200 on successful login", async () => {
    mockSignIn.mockResolvedValue({
      data: {
        user: {
          id: "user_1",
          email: "test@test.com",
          user_metadata: {
            name: "Test User",
            businessName: "Test Co",
            stripeConnected: true,
          },
        },
        session: {
          access_token: "token_abc",
          expires_at: 9999999999,
        },
      },
      error: null,
    });

    const res = await POST(makeRequest({
      email: "test@test.com",
      password: "correctpass",
    }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.user.id).toBe("user_1");
    expect(body.data.user.stripeConnected).toBe(true);
    expect(body.data.session.access_token).toBe("token_abc");
  });

  it("lowercases and trims email", async () => {
    mockSignIn.mockResolvedValue({
      data: {
        user: { id: "u1", email: "test@test.com", user_metadata: {} },
        session: { access_token: "t", expires_at: 0 },
      },
      error: null,
    });

    await POST(makeRequest({
      email: "TEST@Test.COM",
      password: "securepass",
    }));

    expect(mockSignIn).toHaveBeenCalledWith({
      email: "test@test.com",
      password: "securepass",
    });
  });
});
