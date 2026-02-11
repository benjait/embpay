import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";
import { logAdminAction } from "@/lib/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { success: false, error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
  } catch (err) {
    console.error("[Subscription Webhook] Signature verification failed:", err);
    return NextResponse.json(
      { success: false, error: "Invalid signature" },
      { status: 400 }
    );
  }

  console.log(`[Subscription Webhook] Received event: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Only handle subscription checkouts
        if (session.mode !== "subscription") {
          console.log("[Subscription Webhook] Skipping non-subscription checkout");
          break;
        }

        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;

        if (!userId || !plan) {
          console.error("[Subscription Webhook] Missing metadata:", { userId, plan });
          break;
        }

        // Calculate plan expiry (1 month from now)
        const planExpiresAt = new Date();
        planExpiresAt.setMonth(planExpiresAt.getMonth() + 1);

        // Update user's plan
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            plan: plan,
            planExpiresAt: planExpiresAt,
          },
        });

        // Log to audit trail
        await logAdminAction({
          adminId: "system",
          adminEmail: "system@embpay.com",
          action: "subscription.activated",
          targetType: "user",
          targetId: userId,
          details: {
            plan: plan,
            expiresAt: planExpiresAt.toISOString(),
            subscriptionId: session.subscription,
            amount: session.amount_total ? session.amount_total / 100 : 0,
          },
        });

        console.log(`[Subscription Webhook] User ${userId} upgraded to ${plan}`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        const plan = subscription.metadata?.plan;

        if (!userId) {
          console.error("[Subscription Webhook] Missing userId in subscription metadata");
          break;
        }

        // Update plan expiry based on current_period_end
        const planExpiresAt = new Date(subscription.current_period_end * 1000);

        await prisma.user.update({
          where: { id: userId },
          data: {
            planExpiresAt: planExpiresAt,
          },
        });

        await logAdminAction({
          adminId: "system",
          adminEmail: "system@embpay.com",
          action: "subscription.updated",
          targetType: "user",
          targetId: userId,
          details: {
            plan: plan,
            status: subscription.status,
            expiresAt: planExpiresAt.toISOString(),
          },
        });

        console.log(`[Subscription Webhook] Subscription updated for user ${userId}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (!userId) {
          console.error("[Subscription Webhook] Missing userId in subscription metadata");
          break;
        }

        // Downgrade to free plan
        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: "free",
            planExpiresAt: null,
          },
        });

        await logAdminAction({
          adminId: "system",
          adminEmail: "system@embpay.com",
          action: "subscription.cancelled",
          targetType: "user",
          targetId: userId,
          details: {
            previousPlan: subscription.metadata?.plan,
            cancelledAt: new Date().toISOString(),
          },
        });

        console.log(`[Subscription Webhook] User ${userId} downgraded to free`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscription = invoice.subscription;

        if (typeof subscription === "string") {
          // Fetch subscription to get metadata
          const sub = await stripe.subscriptions.retrieve(subscription);
          const userId = sub.metadata?.userId;

          if (userId) {
            await logAdminAction({
              adminId: "system",
              adminEmail: "system@embpay.com",
              action: "subscription.payment_failed",
              targetType: "user",
              targetId: userId,
              details: {
                invoiceId: invoice.id,
                amount: invoice.amount_due / 100,
                attemptCount: invoice.attempt_count,
              },
            });

            console.log(`[Subscription Webhook] Payment failed for user ${userId}`);
          }
        }
        break;
      }

      default:
        console.log(`[Subscription Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    console.error("[Subscription Webhook] Error processing event:", error);
    return NextResponse.json(
      { success: false, error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
