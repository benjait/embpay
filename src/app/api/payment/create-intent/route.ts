import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { handleApiError } from "@/lib/errors";

// POST — Public: create payment intent for a product
// Used by WordPress plugin to initialize Stripe payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      product_id,
      email,
      stripe_account_id,
      domain,
      metadata = {},
    } = body;

    // Validate required fields
    if (!product_id || !email || !stripe_account_id) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Fetch product
    const product = await prisma.product.findUnique({
      where: { id: product_id },
      include: {
        user: {
          select: {
            id: true,
            stripeAccountId: true,
            stripeConnected: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    if (!product.active) {
      return NextResponse.json(
        { success: false, error: "Product is no longer available" },
        { status: 410 }
      );
    }

    // Verify stripe_account_id matches the merchant
    if (product.user.stripeAccountId !== stripe_account_id) {
      return NextResponse.json(
        { success: false, error: "Invalid Stripe account" },
        { status: 403 }
      );
    }

    if (!product.user.stripeConnected) {
      return NextResponse.json(
        { success: false, error: "Merchant payment not configured" },
        { status: 400 }
      );
    }

    // Calculate amounts (in cents)
    const amount = Math.round(product.price * 100);
    
    // Application fee: 0% (SaaS model - subscription only)
    // If you want to charge a fee, set it here (e.g., 2% = amount * 0.02)
    const applicationFeeAmount = 0;

    // Create payment intent with Stripe Connect
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount,
        currency: product.currency.toLowerCase(),
        automatic_payment_methods: { enabled: true },
        metadata: {
          product_id: product.id,
          product_name: product.name,
          customer_email: email,
          merchant_id: product.user.id,
          domain: domain || "unknown",
          ...metadata,
        },
        receipt_email: email,
        // Transfer to connected account (merchant)
        transfer_data: {
          destination: stripe_account_id,
        },
        application_fee_amount: applicationFeeAmount,
      },
      {
        // Use the connected account for this request
        stripeAccount: stripe_account_id,
      }
    );

    // Create order record
    const order = await prisma.order.create({
      data: {
        productId: product.id,
        userId: product.user.id,
        amount: product.price,
        currency: product.currency,
        status: "pending",
        customerEmail: email,
        stripePaymentIntentId: paymentIntent.id,
        metadata: {
          domain: domain || "unknown",
          created_via: "wordpress_plugin",
        },
      },
    });

    return NextResponse.json({
      success: true,
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      order_id: order.id,
      amount: product.price,
      currency: product.currency,
      redirect_url: `${domain || ""}/thank-you?order=${order.id}`,
    });
  } catch (error) {
    return handleApiError(error, "Create payment intent");
  }
}
