import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { mockSignUp } = vi.hoisted(() => ({
  mockSignUp: vi.fn(),
}));

vi.mock("@/lib/supabase-server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      signUp: mockSignUp,
    },
  })),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn(() => ({ allowed: true, remaining: 4, resetAt: Date.now() + 900000 })),
  getClientIp: vi.fn(() => "127.0.0.1"),
}));

vi.mock("@/lib/errors", () => ({
  handleApiError: vi.fn((error: unknown) => {
    const { NextResponse } = require("next/server");
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }),
}));

import { POST } from "../../auth/register/route";

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest("https://test.com/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 if email missing", async () => {
    const res = await POST(makeRequest({ password: "12345678" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Email and password");
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

  it("returns 400 if password too short", async () => {
    const res = await POST(makeRequest({ email: "test@test.com", password: "short" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("8 and 128");
  });

  it("returns 400 if password too long", async () => {
    const res = await POST(makeRequest({
      email: "test@test.com",
      password: "a".repeat(129),
    }));
    expect(res.status).toBe(400);
  });

  it("returns 400 if name too long", async () => {
    const res = await POST(makeRequest({
      email: "test@test.com",
      password: "12345678",
      name: "a".repeat(201),
    }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("200");
  });

  it("returns 201 on successful registration", async () => {
    mockSignUp.mockResolvedValue({
      data: {
        user: {
          id: "user_1",
          email: "test@test.com",
          user_metadata: { name: "Test User" },
        },
        session: {
          access_token: "token_123",
          expires_at: 9999999999,
        },
      },
      error: null,
    });

    const res = await POST(makeRequest({
      email: "test@test.com",
      password: "securepass123",
      name: "Test User",
    }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.user.email).toBe("test@test.com");
    expect(body.data.session.access_token).toBe("token_123");
  });

  it("lowercases and trims email", async () => {
    mockSignUp.mockResolvedValue({
      data: {
        user: { id: "u1", email: "test@test.com", user_metadata: {} },
        session: null,
      },
      error: null,
    });

    await POST(makeRequest({
      email: "TEST@Test.COM",
      password: "securepass123",
    }));

    expect(mockSignUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "test@test.com",
      })
    );
  });

  it("returns 409 if email already registered", async () => {
    mockSignUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: "User already registered" },
    });

    const res = await POST(makeRequest({
      email: "existing@test.com",
      password: "securepass123",
    }));
    expect(res.status).toBe(409);
  });
});
