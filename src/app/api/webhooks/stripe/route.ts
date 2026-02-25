import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { handleApiError } from "@/lib/errors";

// POST — Stripe Webhook: handle payment events
export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("stripe-signature") || "";

    // Verify webhook signature
    let event;
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
      if (!webhookSecret) {
        console.error("Stripe webhook secret not configured");
        return NextResponse.json(
          { error: "Webhook secret not configured" },
          { status: 500 }
        );
      }
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object);
        break;

      case "charge.refunded":
        await handleChargeRefunded(event.data.object);
        break;

      case "account.updated":
        await handleAccountUpdated(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return handleApiError(error, "Stripe webhook");
  }
}

/**
 * Handle payment_intent.succeeded
 */
async function handlePaymentIntentSucceeded(paymentIntent: any) {
  const { id, metadata, amount, currency, charges } = paymentIntent;

  console.log(`Payment succeeded: ${id}`);

  // Find order by payment intent ID
  const order = await prisma.order.findFirst({
    where: {
      stripePaymentIntentId: id,
    },
    include: {
      product: true,
      user: true,
    },
  });

  if (!order) {
    console.error(`Order not found for payment intent: ${id}`);
    return;
  }

  if (order.status === "completed") {
    console.log(`Order ${order.id} already completed`);
    return;
  }

  // Get charge details
  const charge = charges?.data?.[0];
  const receiptUrl = charge?.receipt_url || null;

  // Update order status
  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "completed",
      paidAt: new Date(),
      stripeChargeId: charge?.id || null,
      receiptUrl: receiptUrl,
    },
  });

  // Send email notification (async)
  await sendOrderConfirmation(order);

  // Handle digital delivery (async)
  if (order.product?.deliveryType === "digital" || order.product?.deliveryType === "redirect") {
    await handleDigitalDelivery(order);
  }

  console.log(`Order ${order.id} marked as completed`);
}

/**
 * Handle payment_intent.payment_failed
 */
async function handlePaymentIntentFailed(paymentIntent: any) {
  const { id, last_payment_error } = paymentIntent;

  console.log(`Payment failed: ${id}`, last_payment_error);

  await prisma.order.updateMany({
    where: {
      stripePaymentIntentId: id,
      status: "pending",
    },
    data: {
      status: "failed",
      failedAt: new Date(),
      metadata: {
        failure_message: last_payment_error?.message,
      },
    },
  });
}

/**
 * Handle charge.refunded
 */
async function handleChargeRefunded(charge: any) {
  const { id, payment_intent, amount_refunded } = charge;

  console.log(`Charge refunded: ${id}, amount: ${amount_refunded}`);

  await prisma.order.updateMany({
    where: {
      stripeChargeId: id,
    },
    data: {
      status: "refunded",
      refundedAt: new Date(),
      refundAmount: amount_refunded / 100, // Convert from cents
    },
  });
}

/**
 * Handle account.updated (for Stripe Connect)
 */
async function handleAccountUpdated(account: any) {
  const { id, charges_enabled, payouts_enabled, requirements } = account;

  console.log(`Account updated: ${id}, charges_enabled: ${charges_enabled}`);

  // Update user's Stripe connection status
  await prisma.user.updateMany({
    where: {
      stripeAccountId: id,
    },
    data: {
      stripeConnected: charges_enabled,
      stripeChargesEnabled: charges_enabled,
      stripePayoutsEnabled: payouts_enabled,
    },
  });
}

/**
 * Send order confirmation email
 */
async function sendOrderConfirmation(order: any): Promise<void> {
  try {
    // TODO: Implement email sending (SendGrid, Resend, etc.)
    console.log(`Sending confirmation email for order ${order.id} to ${order.customerEmail}`);
    
    // Placeholder for email service
    // await emailService.send({
    //   to: order.customerEmail,
    //   subject: `Your order confirmation: ${order.product?.name}`,
    //   template: 'order-confirmation',
    //   data: {
    //     order,
    //     product: order.product,
    //   },
    // });
  } catch (error) {
    console.error(`Failed to send email for order ${order.id}:`, error);
  }
}

/**
 * Handle digital delivery
 */
async function handleDigitalDelivery(order: any): Promise<void> {
  try {
    const { product } = order;
    
    if (!product) return;

    console.log(`Processing digital delivery for order ${order.id}`);

    // Delivery method based on product type
    switch (product.deliveryType) {
      case "redirect":
        // Customer will be redirected to deliveryUrl after payment
        console.log(`Redirect delivery: ${product.deliveryUrl}`);
        break;

      case "digital":
        // Send email with download link or access instructions
        console.log(`Digital delivery: ${product.deliveryInstructions || product.deliveryUrl}`);
        
        // TODO: Send email with access instructions
        // await emailService.send({
        //   to: order.customerEmail,
        //   subject: `Your download: ${product.name}`,
        //   template: 'digital-delivery',
        //   data: {
        //     order,
        //     product,
        //     downloadUrl: product.deliveryUrl,
        //   },
        // });
        break;

      default:
        console.log(`No automated delivery for type: ${product.deliveryType}`);
    }
  } catch (error) {
    console.error(`Digital delivery failed for order ${order.id}:`, error);
  }
}
