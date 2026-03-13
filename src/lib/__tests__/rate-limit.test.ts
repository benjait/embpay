import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, getClientIp } from "../rate-limit";

describe("checkRateLimit", () => {
  it("allows first request", () => {
    const result = checkRateLimit(`test-${Date.now()}`, {
      maxRequests: 5,
      windowSeconds: 60,
    });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("tracks remaining requests", () => {
    const key = `track-${Date.now()}`;
    const opts = { maxRequests: 3, windowSeconds: 60 };

    const r1 = checkRateLimit(key, opts);
    expect(r1.remaining).toBe(2);

    const r2 = checkRateLimit(key, opts);
    expect(r2.remaining).toBe(1);

    const r3 = checkRateLimit(key, opts);
    expect(r3.remaining).toBe(0);
  });

  it("blocks after max requests", () => {
    const key = `block-${Date.now()}`;
    const opts = { maxRequests: 2, windowSeconds: 60 };

    checkRateLimit(key, opts);
    checkRateLimit(key, opts);
    const r3 = checkRateLimit(key, opts);

    expect(r3.allowed).toBe(false);
    expect(r3.remaining).toBe(0);
  });

  it("returns resetAt timestamp", () => {
    const key = `reset-${Date.now()}`;
    const result = checkRateLimit(key, {
      maxRequests: 5,
      windowSeconds: 120,
    });
    expect(result.resetAt).toBeGreaterThan(Date.now());
    expect(result.resetAt).toBeLessThanOrEqual(Date.now() + 120_000 + 100);
  });

  it("uses separate counters for different keys", () => {
    const now = Date.now();
    const opts = { maxRequests: 1, windowSeconds: 60 };

    checkRateLimit(`a-${now}`, opts);
    const rB = checkRateLimit(`b-${now}`, opts);

    expect(rB.allowed).toBe(true);
  });
});

describe("getClientIp", () => {
  it("reads x-forwarded-for header", () => {
    const req = new Request("https://test.com", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(getClientIp(req)).toBe("1.2.3.4");
  });

  it("reads x-real-ip header as fallback", () => {
    const req = new Request("https://test.com", {
      headers: { "x-real-ip": "9.8.7.6" },
    });
    expect(getClientIp(req)).toBe("9.8.7.6");
  });

  it("returns 'unknown' when no IP headers", () => {
    const req = new Request("https://test.com");
    expect(getClientIp(req)).toBe("unknown");
  });
});
