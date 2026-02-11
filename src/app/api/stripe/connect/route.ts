import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { createConnectAccount, stripe, PLATFORM_URL } from "@/lib/stripe";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isRefresh = searchParams.get("refresh");

    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.redirect(`${PLATFORM_URL}/auth/login`);
    }

    // If refresh and already has account, create new onboarding link
    if (isRefresh && user.stripeAccountId) {
      const accountLink = await stripe.accountLinks.create({
        account: user.stripeAccountId,
        refresh_url: `${PLATFORM_URL}/api/stripe/connect?refresh=true`,
        return_url: `${PLATFORM_URL}/api/stripe/callback?account_id=${user.stripeAccountId}&user_id=${user.id}`,
        type: "account_onboarding",
      });
      return NextResponse.redirect(accountLink.url);
    }

    // Already connected
    if (user.stripeConnected && user.stripeAccountId) {
      return NextResponse.redirect(
        `${PLATFORM_URL}/dashboard/settings?info=already_connected`
      );
    }

    // Create Standard Connect account (Account Links flow)
    // Note: For OAuth flow (connect existing accounts), configure OAuth in Stripe Dashboard
    const { accountId, onboardingUrl } = await createConnectAccount(
      user.id,
      user.email
    );

    // Save account ID immediately (before onboarding completes)
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeAccountId: accountId },
    });

    return NextResponse.redirect(onboardingUrl);
  } catch (error) {
    console.error("Stripe connect error:", error);
    return NextResponse.redirect(
      `${PLATFORM_URL}/dashboard/settings?error=connect_failed`
    );
  }
}
