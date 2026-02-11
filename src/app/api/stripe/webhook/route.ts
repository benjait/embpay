import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { sendOrderConfirmation, sendRefundNotification } from "@/lib/email";
import Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

async function logWebhookEvent(
  eventId: string,
  eventType: string,
  payload: string,
  processed: boolean,
  error?: string
) {
  try {
    await prisma.webhookLog.upsert({
      where: { eventId },
      create: {
        eventId,
        eventType,
        payload,
        processed,
        error: error || null,
      },
      update: {
        processed,
        error: error || null,
      },
    });
  } catch (e) {
    console.error("Failed to log webhook event:", e);
  }
}

export async function POST(request: NextRequest) {
  let event: Stripe.Event;
  let rawBody: string;

  try {
    rawBody = await request.text();
    const signature = request.headers.get("stripe-signature");

    // Verify webhook signature — ALWAYS required
    if (!webhookSecret || webhookSecret === "whsec_placeholder") {
      console.error("Webhook rejected: STRIPE_WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { success: false, error: "Webhook not configured" },
        { status: 500 }
      );
    }

    if (!signature) {
      console.error("Webhook rejected: missing stripe-signature header");
      return NextResponse.json(
        { success: false, error: "Missing signature" },
        { status: 400 }
      );
    }

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Signature verified successfully — event is set above
  } catch (error) {
    console.error("Webhook body parse error:", error);
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }

  // Check for duplicate events (idempotency)
  const existing = await prisma.webhookLog.findUnique({
    where: { eventId: event.id },
  });
  if (existing?.processed) {
    return NextResponse.json({ success: true, received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      // === Payment Intent Succeeded ===
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.orderId;

        let order;
        if (orderId) {
          order = await prisma.order.update({
            where: { id: orderId },
            data: {
              status: "completed",
              stripePaymentId: paymentIntent.latest_charge
                ? String(paymentIntent.latest_charge)
                : null,
            },
            include: { product: true },
          });
        } else {
          // Fallback: find by paymentIntentId
          const orders = await prisma.order.findMany({
            where: { stripePaymentIntentId: paymentIntent.id },
            include: { product: true },
          });
          
          if (orders.length > 0) {
            order = orders[0];
            await prisma.order.updateMany({
              where: { stripePaymentIntentId: paymentIntent.id },
              data: {
                status: "completed",
                stripePaymentId: paymentIntent.latest_charge
                  ? String(paymentIntent.latest_charge)
                  : null,
              },
            });
          }
        }

        // Send confirmation email
        if (order) {
          await sendOrderConfirmation({
            orderId: order.id,
            customerName: order.customerName || 'Customer',
            customerEmail: order.customerEmail,
            productName: order.product.name,
            amount: order.amount,
            date: order.createdAt.toISOString(),
            downloadUrl: order.product.downloadUrl || undefined,
          });
        }
        break;
      }

      // === Payment Intent Failed ===
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.orderId;

        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: { status: "failed" },
          });
        } else {
          await prisma.order.updateMany({
            where: { stripePaymentIntentId: paymentIntent.id },
            data: { status: "failed" },
          });
        }
        break;
      }

      // === Charge Refunded ===
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent?.id;

        // Calculate refund amount from the charge
        const refundAmount = charge.amount_refunded; // in cents

        let orders: any[] = [];
        if (paymentIntentId) {
          // Determine if full or partial refund
          const isFullRefund = charge.amount_refunded === charge.amount;
          const newStatus = isFullRefund ? "refunded" : "partially_refunded";

          orders = await prisma.order.findMany({
            where: {
              OR: [
                { stripePaymentIntentId: paymentIntentId },
                { stripePaymentId: charge.id },
              ],
            },
            include: { product: true },
          });

          await prisma.order.updateMany({
            where: {
              OR: [
                { stripePaymentIntentId: paymentIntentId },
                { stripePaymentId: charge.id },
              ],
            },
            data: { status: newStatus },
          });
        } else if (charge.id) {
          // Fallback: match by charge ID
          orders = await prisma.order.findMany({
            where: { stripePaymentId: charge.id },
            include: { product: true },
          });

          await prisma.order.updateMany({
            where: { stripePaymentId: charge.id },
            data: { status: "refunded" },
          });
        }

        // Send refund notification email
        for (const order of orders) {
          await sendRefundNotification({
            orderId: order.id,
            customerName: order.customerName || 'Customer',
            customerEmail: order.customerEmail,
            productName: order.product.name,
            amount: refundAmount / 100, // Convert cents to dollars
            date: new Date().toISOString(),
          });
        }
        break;
      }

      // === Checkout Session Completed (keep existing) ===
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;

        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: "completed",
              stripePaymentId:
                typeof session.payment_intent === "string"
                  ? session.payment_intent
                  : session.payment_intent?.id || null,
              // Save customer email from session if available
              ...(session.customer_details?.email
                ? { customerEmail: session.customer_details.email }
                : {}),
            },
          });
        }
        break;
      }

      // === Checkout Session Expired ===
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;

        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: { status: "failed" },
          });
        }
        break;
      }

      default:
        // Unhandled event type — still log it
        await logWebhookEvent(event.id, event.type, rawBody, true);
        return NextResponse.json({ success: true, received: true });
    }

    // Log successful processing
    await logWebhookEvent(event.id, event.type, rawBody, true);
    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`Webhook processing error for ${event.type}:`, error);

    // Log failed processing
    await logWebhookEvent(event.id, event.type, rawBody, false, errorMessage);

    return NextResponse.json(
      { success: false, error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
