/**
 * Input validation helpers for EmbPay API routes.
 * Use these to sanitize and validate user input before processing.
 */

export type ValidationError = {
  field: string;
  message: string;
};

export type ValidationResult =
  | { valid: true }
  | { valid: false; errors: ValidationError[] };

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  // RFC 5322 simplified — covers 99.9% of real emails
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return emailRegex.test(email.trim()) && email.length <= 254;
}

/**
 * Validate string length within bounds
 */
export function isValidStringLength(
  value: string,
  min: number = 1,
  max: number = 1000
): boolean {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  return trimmed.length >= min && trimmed.length <= max;
}

/**
 * Validate a number is within a range
 */
export function isValidNumberRange(
  value: number,
  min: number = 0,
  max: number = Number.MAX_SAFE_INTEGER
): boolean {
  if (typeof value !== "number" || !isFinite(value)) return false;
  return value >= min && value <= max;
}

/**
 * Validate a positive integer (for amounts in cents)
 */
export function isValidAmount(value: number): boolean {
  return (
    typeof value === "number" &&
    isFinite(value) &&
    Number.isInteger(value) &&
    value > 0 &&
    value <= 99999999 // $999,999.99 max
  );
}

/**
 * Validate a price (can be in cents, must be positive)
 */
export function isValidPrice(value: number): boolean {
  return (
    typeof value === "number" &&
    isFinite(value) &&
    value > 0 &&
    value <= 99999999
  );
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): {
  valid: boolean;
  message?: string;
} {
  if (!password || typeof password !== "string") {
    return { valid: false, message: "Password is required" };
  }
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters" };
  }
  if (password.length > 128) {
    return { valid: false, message: "Password must be 128 characters or fewer" };
  }
  return { valid: true };
}

/**
 * Sanitize a string — trim and remove null bytes
 */
export function sanitizeString(value: string): string {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\0/g, "");
}

/**
 * Validate a URL format
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * Validate a currency code (ISO 4217)
 */
export function isValidCurrency(currency: string): boolean {
  const validCurrencies = [
    "usd", "eur", "gbp", "cad", "aud", "jpy", "chf", "sek",
    "nok", "dkk", "pln", "czk", "huf", "ron", "bgn", "hrk",
    "brl", "mxn", "sgd", "hkd", "nzd", "inr",
  ];
  return validCurrencies.includes(currency?.toLowerCase());
}

/**
 * Validate an object against a schema of required/optional fields
 */
export function validateFields(
  data: Record<string, unknown>,
  rules: {
    field: string;
    required?: boolean;
    type?: "string" | "number" | "boolean" | "email";
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  }[]
): ValidationResult {
  const errors: ValidationError[] = [];

  for (const rule of rules) {
    const value = data[rule.field];

    // Required check
    if (rule.required && (value === undefined || value === null || value === "")) {
      errors.push({ field: rule.field, message: `${rule.field} is required` });
      continue;
    }

    // Skip optional missing fields
    if (value === undefined || value === null) continue;

    // Type checks
    if (rule.type === "email") {
      if (!isValidEmail(String(value))) {
        errors.push({ field: rule.field, message: `${rule.field} must be a valid email` });
      }
    } else if (rule.type === "string") {
      if (typeof value !== "string") {
        errors.push({ field: rule.field, message: `${rule.field} must be a string` });
      } else {
        if (rule.minLength !== undefined && value.trim().length < rule.minLength) {
          errors.push({
            field: rule.field,
            message: `${rule.field} must be at least ${rule.minLength} characters`,
          });
        }
        if (rule.maxLength !== undefined && value.trim().length > rule.maxLength) {
          errors.push({
            field: rule.field,
            message: `${rule.field} must be at most ${rule.maxLength} characters`,
          });
        }
      }
    } else if (rule.type === "number") {
      if (typeof value !== "number" || !isFinite(value)) {
        errors.push({ field: rule.field, message: `${rule.field} must be a number` });
      } else {
        if (rule.min !== undefined && value < rule.min) {
          errors.push({
            field: rule.field,
            message: `${rule.field} must be at least ${rule.min}`,
          });
        }
        if (rule.max !== undefined && value > rule.max) {
          errors.push({
            field: rule.field,
            message: `${rule.field} must be at most ${rule.max}`,
          });
        }
      }
    } else if (rule.type === "boolean") {
      if (typeof value !== "boolean") {
        errors.push({ field: rule.field, message: `${rule.field} must be a boolean` });
      }
    }
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}
