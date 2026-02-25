import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover" as any,
});

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Missing API key" },
        { status: 401 }
      );
    }

    const apiKey = authHeader.substring(7);

    // Validate API key
    const keyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKey, active: true },
      include: {
        user: {
          select: {
            id: true,
            stripeAccountId: true,
            stripeConnected: true,
            suspended: true,
            plan: true,
          },
        },
      },
    });

    if (!keyRecord || !keyRecord.user) {
      return NextResponse.json(
        { success: false, error: "Invalid API key" },
        { status: 401 }
      );
    }

    const merchant = keyRecord.user;

    if (merchant.suspended) {
      return NextResponse.json(
        { success: false, error: "Account suspended" },
        { status: 403 }
      );
    }

    // Update API key lastUsed
    await prisma.apiKey.update({
      where: { id: keyRecord.id },
      data: { lastUsed: new Date() },
    });

    const body = await req.json();
    const { productId, email, customerName, wcProductId, wcOrderId } = body;

    if (!productId || !email) {
      return NextResponse.json(
        { success: false, error: "Missing productId or email" },
        { status: 400 }
      );
    }

    // Get product
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        userId: merchant.id,
        active: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found or not yours" },
        { status: 404 }
      );
    }

    const amount = Math.round(product.price * 100); // cents

    // Build PaymentIntent options
    const piOptions: Stripe.PaymentIntentCreateParams = {
      amount,
      currency: product.currency || "usd",
      automatic_payment_methods: { enabled: true },
      receipt_email: email,
      metadata: {
        productId: product.id,
        productName: product.name,
        merchantId: merchant.id,
        customerEmail: email,
        customerName: customerName || "",
        wcProductId: wcProductId || "",
        wcOrderId: wcOrderId || "",
        source: "wordpress_plugin",
      },
    };

    // If merchant has connected Stripe account, route payment to them
    if (merchant.stripeConnected && merchant.stripeAccountId) {
      const commission = Math.round(amount * 0.03); // 3% EmbPay fee
      piOptions.application_fee_amount = commission;
      piOptions.transfer_data = {
        destination: merchant.stripeAccountId,
      };
    }

    const paymentIntent = await stripe.paymentIntents.create(piOptions);

    // Create pending order in EmbPay DB
    const order = await prisma.order.create({
      data: {
        productId: product.id,
        userId: merchant.id,
        amount: product.price,
        currency: product.currency || "usd",
        status: "pending",
        customerEmail: email,
        customerName: customerName || null,
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    return NextResponse.json({
      success: true,
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      order_id: order.id,
      publishable_key: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      amount: product.price,
      currency: product.currency || "usd",
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
      },
    });
  } catch (error: any) {
    console.error("Create payment intent error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Payment intent creation failed" },
      { status: 500 }
    );
  }
}
