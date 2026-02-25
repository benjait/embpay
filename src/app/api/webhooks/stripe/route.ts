import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    console.log(`Webhook received: ${event.type}`);

    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object);
        break;
      case "account.updated":
        await handleAccountUpdated(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: error.message || "Webhook handler failed" },
      { status: 400 }
    );
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: any) {
  const { id } = paymentIntent;

  const order = await prisma.order.findFirst({
    where: { stripePaymentIntentId: id },
  });

  if (!order) {
    console.error(`Order not found for payment intent: ${id}`);
    return;
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { status: "completed" },
  });

  console.log(`Order ${order.id} marked as completed`);
}

async function handlePaymentIntentFailed(paymentIntent: any) {
  const { id } = paymentIntent;

  await prisma.order.updateMany({
    where: {
      stripePaymentIntentId: id,
      status: "pending",
    },
    data: { status: "failed" },
  });
}

async function handleAccountUpdated(account: any) {
  const { id, charges_enabled } = account;

  await prisma.user.updateMany({
    where: { stripeAccountId: id },
    data: { stripeConnected: charges_enabled },
  });
}
