import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, email, domain } = body;

    if (!productId || !email) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get product
    const product = await prisma.product.findUnique({
      where: { id: productId },
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

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(product.price * 100),
      currency: product.currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        productId: product.id,
        email: email,
      },
    });

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
      },
    });

    return NextResponse.json({
      success: true,
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      order_id: order.id,
    });
  } catch (error: any) {
    console.error("Create payment intent error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Payment intent creation failed" },
      { status: 500 }
    );
  }
}
