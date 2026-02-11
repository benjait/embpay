import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

const PLAN_PRICES = {
  pro: {
    amount: 2900, // $29.00 in cents
    name: "EmbPay Pro",
    description: "Unlimited products & orders, license keys, priority support",
  },
  scale: {
    amount: 7900, // $79.00 in cents
    name: "EmbPay Scale",
    description: "Everything in Pro + API access, white-label, dedicated support",
  },
} as const;

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { plan } = body;

    // Validate plan
    if (!plan || !["pro", "scale"].includes(plan)) {
      return NextResponse.json(
        { success: false, error: "Invalid plan. Must be 'pro' or 'scale'" },
        { status: 400 }
      );
    }

    const planConfig = PLAN_PRICES[plan as keyof typeof PLAN_PRICES];

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: planConfig.name,
              description: planConfig.description,
            },
            unit_amount: planConfig.amount,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3800"}/dashboard/plans?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3800"}/dashboard/plans`,
      customer_email: user.email,
      client_reference_id: user.id,
      metadata: {
        userId: user.id,
        plan: plan,
        userEmail: user.email,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          plan: plan,
          userEmail: user.email,
        },
      },
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("[Subscription Checkout] Error:", error);
    return handleApiError(error, "Create subscription checkout");
  }
}
