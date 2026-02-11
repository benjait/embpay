import Stripe from "stripe";

const stripeKey = process.env.STRIPE_SECRET_KEY || "";
const isConfigured =
  stripeKey.startsWith("sk_test_") || stripeKey.startsWith("sk_live_");

export const stripe = isConfigured
  ? new Stripe(stripeKey)
  : (null as unknown as Stripe);

export const isStripeConfigured = isConfigured;

export const PLATFORM_URL =
  process.env.PLATFORM_URL || "https://embpay.course.cheap";

// NO COMMISSION - EmbPay is SaaS only, 0% transaction fees
export const STRIPE_PUBLISHABLE_KEY =
  process.env.STRIPE_PUBLISHABLE_KEY || "";

/**
 * Generate Stripe Connect OAuth link (Standard type)
 * Allows merchant to connect existing account OR create new one
 * Merchant keeps 100% of payments (Stripe fees only: 2.9% + 30¢)
 */
export function getConnectOAuthUrl(userId: string, email: string): string {
  const clientId = process.env.STRIPE_CONNECT_CLIENT_ID || "";
  
  const params = new URLSearchParams({
    client_id: clientId,
    state: JSON.stringify({ userId, email }),
    scope: "read_write",
    redirect_uri: `${PLATFORM_URL}/api/stripe/callback`,
    "stripe_user[email]": email,
    "stripe_user[business_type]": "individual",
  });

  return `https://connect.stripe.com/oauth/authorize?${params.toString()}`;
}

/**
 * Legacy: Create a Standard connected account directly (for migration)
 * Merchant keeps 100% of payments (Stripe fees only: 2.9% + 30¢)
 * @deprecated Use getConnectOAuthUrl() instead for better UX
 */
export async function createConnectAccount(
  userId: string,
  email: string
): Promise<{ accountId: string; onboardingUrl: string }> {
  // Create a Standard connected account
  const account = await stripe.accounts.create({
    type: "standard",
    email,
    metadata: { userId },
  });

  // Create an Account Link for onboarding
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${PLATFORM_URL}/api/stripe/connect?refresh=true&userId=${userId}`,
    return_url: `${PLATFORM_URL}/api/stripe/callback?account_id=${account.id}&user_id=${userId}`,
    type: "account_onboarding",
  });

  return {
    accountId: account.id,
    onboardingUrl: accountLink.url,
  };
}

/**
 * Check if a connected account has completed onboarding
 */
export async function checkAccountStatus(
  accountId: string
): Promise<{ chargesEnabled: boolean; detailsSubmitted: boolean }> {
  const account = await stripe.accounts.retrieve(accountId);
  return {
    chargesEnabled: account.charges_enabled,
    detailsSubmitted: account.details_submitted,
  };
}

// Note: Checkout Sessions (redirect flow) removed in favor of
// embedded PaymentIntent + Stripe Elements flow.
// See: /api/stripe/payment-intent/route.ts
// Merchant receives 100% of payment - 0% EmbPay fee
