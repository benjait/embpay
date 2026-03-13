import { describe, it, expect } from "vitest";
import {
  isValidEmail,
  isValidString,
  isPositiveNumber,
  isNonNegativeNumber,
  sanitizeString,
  isValidUrl,
  sanitizePagination,
} from "../validation";

describe("isValidEmail", () => {
  it("accepts valid emails", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("test.user+tag@domain.co")).toBe(true);
    expect(isValidEmail("a@b.c")).toBe(true);
  });

  it("rejects invalid emails", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("@domain.com")).toBe(false);
    expect(isValidEmail("user@")).toBe(false);
    expect(isValidEmail("user @domain.com")).toBe(false);
  });

  it("rejects emails longer than 254 characters", () => {
    const longEmail = "a".repeat(250) + "@b.co";
    expect(isValidEmail(longEmail)).toBe(false);
  });

  it("rejects non-string inputs", () => {
    expect(isValidEmail(null as any)).toBe(false);
    expect(isValidEmail(undefined as any)).toBe(false);
    expect(isValidEmail(123 as any)).toBe(false);
  });
});

describe("isValidString", () => {
  it("accepts valid strings", () => {
    expect(isValidString("hello")).toBe(true);
    expect(isValidString("a", { minLength: 1 })).toBe(true);
  });

  it("rejects non-strings", () => {
    expect(isValidString(123)).toBe(false);
    expect(isValidString(null)).toBe(false);
    expect(isValidString(undefined)).toBe(false);
    expect(isValidString({})).toBe(false);
  });

  it("respects minLength", () => {
    expect(isValidString("ab", { minLength: 3 })).toBe(false);
    expect(isValidString("abc", { minLength: 3 })).toBe(true);
  });

  it("respects maxLength", () => {
    expect(isValidString("abcdef", { maxLength: 5 })).toBe(false);
    expect(isValidString("abcde", { maxLength: 5 })).toBe(true);
  });

  it("trims before checking length", () => {
    expect(isValidString("  ab  ", { minLength: 3 })).toBe(false);
    expect(isValidString("  abc  ", { minLength: 3 })).toBe(true);
  });

  it("uses defaults when no options provided", () => {
    expect(isValidString("")).toBe(true); // minLength default is 0
    expect(isValidString("a".repeat(10001))).toBe(false); // maxLength default is 10000
  });
});

describe("isPositiveNumber", () => {
  it("accepts positive numbers", () => {
    expect(isPositiveNumber(1)).toBe(true);
    expect(isPositiveNumber(0.5)).toBe(true);
    expect(isPositiveNumber(999999)).toBe(true);
  });

  it("rejects zero and negative numbers", () => {
    expect(isPositiveNumber(0)).toBe(false);
    expect(isPositiveNumber(-1)).toBe(false);
    expect(isPositiveNumber(-0.5)).toBe(false);
  });

  it("rejects non-numbers", () => {
    expect(isPositiveNumber("5")).toBe(false);
    expect(isPositiveNumber(null)).toBe(false);
    expect(isPositiveNumber(NaN)).toBe(false);
    expect(isPositiveNumber(Infinity)).toBe(false);
  });
});

describe("isNonNegativeNumber", () => {
  it("accepts zero and positive numbers", () => {
    expect(isNonNegativeNumber(0)).toBe(true);
    expect(isNonNegativeNumber(1)).toBe(true);
    expect(isNonNegativeNumber(0.001)).toBe(true);
  });

  it("rejects negative numbers", () => {
    expect(isNonNegativeNumber(-1)).toBe(false);
    expect(isNonNegativeNumber(-0.001)).toBe(false);
  });

  it("rejects non-numbers", () => {
    expect(isNonNegativeNumber("0")).toBe(false);
    expect(isNonNegativeNumber(NaN)).toBe(false);
    expect(isNonNegativeNumber(Infinity)).toBe(false);
  });
});

describe("sanitizeString", () => {
  it("trims whitespace", () => {
    expect(sanitizeString("  hello  ")).toBe("hello");
  });

  it("truncates to maxLength", () => {
    expect(sanitizeString("abcdefgh", 5)).toBe("abcde");
  });

  it("returns empty string for non-string input", () => {
    expect(sanitizeString(123 as any)).toBe("");
    expect(sanitizeString(null as any)).toBe("");
  });

  it("uses default maxLength of 10000", () => {
    const longString = "a".repeat(15000);
    expect(sanitizeString(longString).length).toBe(10000);
  });
});

describe("isValidUrl", () => {
  it("accepts http and https URLs", () => {
    expect(isValidUrl("https://example.com")).toBe(true);
    expect(isValidUrl("http://example.com")).toBe(true);
    expect(isValidUrl("https://sub.domain.com/path?q=1")).toBe(true);
  });

  it("rejects non-http protocols", () => {
    expect(isValidUrl("ftp://example.com")).toBe(false);
    expect(isValidUrl("javascript:alert(1)")).toBe(false);
    expect(isValidUrl("data:text/html,<h1>Hi</h1>")).toBe(false);
  });

  it("rejects invalid URLs", () => {
    expect(isValidUrl("")).toBe(false);
    expect(isValidUrl("not a url")).toBe(false);
    expect(isValidUrl(null as any)).toBe(false);
  });
});

describe("sanitizePagination", () => {
  it("returns defaults when no input", () => {
    expect(sanitizePagination(null, null)).toEqual({ page: 1, limit: 20 });
  });

  it("parses valid page and limit", () => {
    expect(sanitizePagination("3", "50")).toEqual({ page: 3, limit: 50 });
  });

  it("clamps page to minimum 1", () => {
    expect(sanitizePagination("0", "20")).toEqual({ page: 1, limit: 20 });
    expect(sanitizePagination("-5", "20")).toEqual({ page: 1, limit: 20 });
  });

  it("clamps limit to maxLimit", () => {
    expect(sanitizePagination("1", "200")).toEqual({ page: 1, limit: 100 });
    expect(sanitizePagination("1", "200", 50)).toEqual({ page: 1, limit: 50 });
  });

  it("handles NaN values", () => {
    expect(sanitizePagination("abc", "xyz")).toEqual({ page: 1, limit: 20 });
  });

  it("handles zero limit", () => {
    expect(sanitizePagination("1", "0")).toEqual({ page: 1, limit: 20 });
  });
});
