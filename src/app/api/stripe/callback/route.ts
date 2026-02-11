import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkAccountStatus, stripe, PLATFORM_URL } from "@/lib/stripe";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Check if this is OAuth callback (has 'code' parameter)
    const oauthCode = searchParams.get("code");
    const stateParam = searchParams.get("state");
    
    if (oauthCode && stateParam) {
      // OAuth flow
      const state = JSON.parse(stateParam);
      const { userId, email } = state;
      
      // Exchange authorization code for access token
      const response = await stripe.oauth.token({
        grant_type: "authorization_code",
        code: oauthCode,
      });
      
      const accountId = response.stripe_user_id;
      
      // Save connected account
      await prisma.user.update({
        where: { id: userId },
        data: {
          stripeAccountId: accountId,
          stripeConnected: true,
        },
      });
      
      return NextResponse.redirect(
        `${PLATFORM_URL}/dashboard/settings?success=stripe_connected`
      );
    }
    
    // Legacy account link flow (fallback)
    const accountId = searchParams.get("account_id");
    const userId = searchParams.get("user_id");

    if (!accountId || !userId) {
      return NextResponse.redirect(
        `${PLATFORM_URL}/dashboard/settings?error=missing_params`
      );
    }

    // SECURITY: Verify that the user_id actually owns this stripeAccountId
    // This prevents an attacker from connecting someone else's Stripe account
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, stripeAccountId: true },
    });

    if (!user || (user.stripeAccountId && user.stripeAccountId !== accountId)) {
      console.error(
        `Stripe callback: user ${userId} stripeAccountId mismatch. ` +
        `Expected ${user?.stripeAccountId}, got ${accountId}`
      );
      return NextResponse.redirect(
        `${PLATFORM_URL}/dashboard/settings?error=account_mismatch`
      );
    }

    // Verify the account status with Stripe
    const status = await checkAccountStatus(accountId);

    if (status.detailsSubmitted) {
      // Mark user as connected — only update IF accountId matches
      await prisma.user.update({
        where: { id: userId, stripeAccountId: accountId },
        data: {
          stripeConnected: true,
        },
      });

      return NextResponse.redirect(
        `${PLATFORM_URL}/dashboard/settings?success=stripe_connected`
      );
    } else {
      // Onboarding not complete — they may have left early
      return NextResponse.redirect(
        `${PLATFORM_URL}/dashboard/settings?error=onboarding_incomplete`
      );
    }
  } catch (error) {
    console.error("Stripe callback error:", error);
    return NextResponse.redirect(
      `${PLATFORM_URL}/dashboard/settings?error=callback_failed`
    );
  }
}
