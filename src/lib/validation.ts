/**
 * Input validation utilities for API routes.
 */

export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  if (email.length > 254) return false; // RFC 5321
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidString(
  value: unknown,
  options: { minLength?: number; maxLength?: number } = {}
): value is string {
  if (typeof value !== "string") return false;
  const { minLength = 0, maxLength = 10000 } = options;
  const trimmed = value.trim();
  return trimmed.length >= minLength && trimmed.length <= maxLength;
}

export function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && isFinite(value) && value > 0;
}

export function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === "number" && isFinite(value) && value >= 0;
}

export function sanitizeString(value: string, maxLength: number = 10000): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

/**
 * Validate and sanitize URL - only allow http/https schemes.
 */
export function isValidUrl(value: string): boolean {
  if (!value || typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Validate pagination parameters.
 */
export function sanitizePagination(
  page: string | null,
  limit: string | null,
  maxLimit: number = 100
): { page: number; limit: number } {
  let p = parseInt(page || "1", 10);
  let l = parseInt(limit || "20", 10);
  if (isNaN(p) || p < 1) p = 1;
  if (isNaN(l) || l < 1) l = 20;
  if (l > maxLimit) l = maxLimit;
  return { page: p, limit: l };
}
