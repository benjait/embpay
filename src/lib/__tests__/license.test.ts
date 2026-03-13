import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateLicenseKey, isValidKeyFormat } from "../license";

vi.mock("@/lib/prisma", () => ({
  default: {
    product: { findUnique: vi.fn() },
    licenseKey: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    licenseActivation: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
  },
}));

describe("generateLicenseKey", () => {
  it("generates key with default EMBP prefix", () => {
    const key = generateLicenseKey();
    expect(key).toMatch(/^EMBP-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  });

  it("generates key with custom prefix", () => {
    const key = generateLicenseKey("MYAPP");
    expect(key.startsWith("MYAPP-")).toBe(true);
  });

  it("generates unique keys", () => {
    const keys = new Set<string>();
    for (let i = 0; i < 100; i++) {
      keys.add(generateLicenseKey());
    }
    expect(keys.size).toBe(100);
  });

  it("uses only allowed characters (no 0/O/1/I/L)", () => {
    for (let i = 0; i < 50; i++) {
      const key = generateLicenseKey();
      const groups = key.split("-").slice(1); // remove prefix
      for (const group of groups) {
        expect(group).not.toMatch(/[0OIL1]/);
      }
    }
  });

  it("generates 4 groups of 4 characters", () => {
    const key = generateLicenseKey();
    const parts = key.split("-");
    expect(parts.length).toBe(5); // prefix + 4 groups
    for (let i = 1; i < 5; i++) {
      expect(parts[i].length).toBe(4);
    }
  });
});

describe("isValidKeyFormat", () => {
  it("accepts valid key formats", () => {
    expect(isValidKeyFormat("EMBP-ABCD-EFGH-JKMN-PQRS")).toBe(true);
    expect(isValidKeyFormat("AB-ABCD-2345-6789-ABCD")).toBe(true);
    expect(isValidKeyFormat("MYPREFIX-AAAA-BBBB-CCCC-DDDD")).toBe(true);
  });

  it("rejects keys with invalid characters", () => {
    expect(isValidKeyFormat("EMBP-ABC0-EFGH-JKMN-PQRS")).toBe(false); // 0
    expect(isValidKeyFormat("EMBP-ABC1-EFGH-JKMN-PQRS")).toBe(false); // 1
  });

  it("rejects keys with wrong structure", () => {
    expect(isValidKeyFormat("EMBP-ABC-EFGH-JKMN-PQRS")).toBe(false); // 3 chars group
    expect(isValidKeyFormat("EMBP-ABCDE-EFGH-JKMN-PQRS")).toBe(false); // 5 chars group
    expect(isValidKeyFormat("E-ABCD-EFGH-JKMN-PQRS")).toBe(false); // 1 char prefix
    expect(isValidKeyFormat("TOOLONGPREFIX-ABCD-EFGH-JKMN-PQRS")).toBe(false); // 13 char prefix
  });

  it("rejects empty and invalid inputs", () => {
    expect(isValidKeyFormat("")).toBe(false);
    expect(isValidKeyFormat("not-a-key")).toBe(false);
    expect(isValidKeyFormat("EMBP")).toBe(false);
  });

  it("validates generated keys", () => {
    for (let i = 0; i < 20; i++) {
      const key = generateLicenseKey();
      expect(isValidKeyFormat(key)).toBe(true);
    }
  });
});
