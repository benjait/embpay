import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getConnectOAuthUrl, stripe, PLATFORM_URL } from "@/lib/stripe";

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

    // Generate OAuth link - allows user to connect existing account OR create new one
    const oauthUrl = getConnectOAuthUrl(user.id, user.email);
    return NextResponse.redirect(oauthUrl);
  } catch (error) {
    console.error("Stripe connect error:", error);
    return NextResponse.redirect(
      `${PLATFORM_URL}/dashboard/settings?error=connect_failed`
    );
  }
}
