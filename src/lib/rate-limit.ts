/**
 * Rate limiter with Redis (Upstash) support and in-memory fallback.
 *
 * When UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set,
 * uses Upstash Redis for distributed rate limiting across serverless instances.
 * Otherwise, falls back to in-memory rate limiting (dev/testing only).
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// --- Redis setup ---

const isRedisConfigured =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

let redis: Redis | null = null;

if (isRedisConfigured) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

// Cache Ratelimit instances to avoid re-creation
const ratelimitCache = new Map<string, Ratelimit>();

function getRedisRatelimit(maxRequests: number, windowSeconds: number): Ratelimit {
  const cacheKey = `${maxRequests}:${windowSeconds}`;
  let rl = ratelimitCache.get(cacheKey);
  if (!rl) {
    rl = new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(maxRequests, `${windowSeconds} s`),
      analytics: true,
      prefix: "embpay:rl",
    });
    ratelimitCache.set(cacheKey, rl);
  }
  return rl;
}

// --- In-memory fallback ---

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of memoryStore.entries()) {
      if (entry.resetAt < now) {
        memoryStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

// --- Public API ---

interface RateLimitOptions {
  /** Maximum requests allowed in the window */
  maxRequests: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Synchronous rate limit check (in-memory only).
 * Kept for backward compatibility with existing callers.
 */
export function checkRateLimit(
  key: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || entry.resetAt < now) {
    const resetAt = now + options.windowSeconds * 1000;
    memoryStore.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: options.maxRequests - 1, resetAt };
  }

  if (entry.count >= options.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: options.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Async rate limit check — uses Redis when configured, in-memory fallback otherwise.
 * Preferred for production use in API routes.
 */
export async function checkRateLimitAsync(
  key: string,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  if (!isRedisConfigured || !redis) {
    return checkRateLimit(key, options);
  }

  try {
    const rl = getRedisRatelimit(options.maxRequests, options.windowSeconds);
    const result = await rl.limit(key);

    return {
      allowed: result.success,
      remaining: result.remaining,
      resetAt: result.reset,
    };
  } catch {
    // Redis failed — fall back to in-memory
    console.warn("Redis rate limit failed, using in-memory fallback");
    return checkRateLimit(key, options);
  }
}

/**
 * Get client IP from request headers (handles proxies).
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
