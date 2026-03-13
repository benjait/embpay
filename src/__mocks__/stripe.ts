import { vi } from "vitest";

export const stripe = {
  paymentIntents: {
    create: vi.fn(),
    retrieve: vi.fn(),
  },
  accounts: {
    retrieve: vi.fn(),
    create: vi.fn(),
  },
  accountLinks: {
    create: vi.fn(),
  },
  webhooks: {
    constructEvent: vi.fn(),
  },
};

export const isStripeConfigured = true;
export const PLATFORM_URL = "https://embpay.test";
export const STRIPE_PUBLISHABLE_KEY = "pk_test_mock";
