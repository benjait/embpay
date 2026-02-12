import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { isValidEmail, sanitizeString } from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 20 payment intents per 15 minutes per IP
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`payment:${ip}`, {
      maxRequests: 20,
      windowSeconds: 15 * 60,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { productId, customerEmail, customerName, couponCode, includeBump, customPrice } = body;

    if (!productId || typeof productId !== "string") {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Validate customer email if provided
    if (customerEmail && !isValidEmail(customerEmail)) {
      return NextResponse.json(
        { success: false, error: "Invalid email address" },
        { status: 400 }
      );
    }

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

    if (!product || !product.active) {
      return NextResponse.json(
        { success: false, error: "Product not found or inactive" },
        { status: 404 }
      );
    }

    let totalAmount = customPrice || product.price;
    
    // Validate custom price for Pay What You Want
    if (customPrice && product.pricingType === "pay_what_you_want" && product.minimumPrice) {
      if (customPrice < product.minimumPrice) {
        return NextResponse.json(
          { success: false, error: `Price must be at least ${product.minimumPrice}` },
          { status: 400 }
        );
      }
    }
    
    let bumpAmount = 0;

    if (includeBump && product.bumpEnabled && product.bumpPrice) {
      bumpAmount = product.bumpPrice;
      totalAmount += bumpAmount;
    }

    let discountAmount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase().trim() },
      });

      if (coupon && coupon.active && coupon.userId === product.user.id) {
        if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
          return NextResponse.json(
            { success: false, error: "Coupon has expired" },
            { status: 400 }
          );
        }

        if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
          return NextResponse.json(
            { success: false, error: "Coupon usage limit reached" },
            { status: 400 }
          );
        }

        discountAmount = Math.round(totalAmount * coupon.discount);
        totalAmount -= discountAmount;

        await prisma.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }
    }

    if (totalAmount < 50) {
      totalAmount = 50;
    }

    // Create order - NO platform fee (0% EmbPay)
    const order = await prisma.order.create({
      data: {
        amount: totalAmount,
        currency: product.currency,
        customerEmail: customerEmail ? sanitizeString(customerEmail, 254) : "unknown@checkout.com",
        customerName: customerName ? sanitizeString(customerName, 200) : null,
        includedBump: includeBump || false,
        platformFee: 0, // 0% EmbPay fee
        productId: product.id,
        userId: product.user.id,
      },
    });

    // Create PaymentIntent - direct to merchant, NO application fee
    const paymentIntentData: any = {
      amount: totalAmount,
      currency: product.currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        orderId: order.id,
        productId: product.id,
        userId: product.user.id,
        includedBump: String(includeBump || false),
        customPrice: customPrice ? String(customPrice) : undefined,
      },
    };

    // If merchant has Stripe Connect, transfer 100% to them
    if (product.user.stripeConnected && product.user.stripeAccountId) {
      try {
        const account = await stripe.accounts.retrieve(product.user.stripeAccountId);
        if (account.charges_enabled) {
          // NO application_fee_amount - merchant gets 100%
          paymentIntentData.transfer_data = {
            destination: product.user.stripeAccountId,
          };
        }
      } catch (e) {
        console.warn("Connected account not ready, using direct payment");
      }
    }

    if (customerEmail) {
      paymentIntentData.receipt_email = customerEmail;
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);

    await prisma.order.update({
      where: { id: order.id },
      data: { stripePaymentIntentId: paymentIntent.id },
    });

    return NextResponse.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        orderId: order.id,
        amount: totalAmount,
        currency: product.currency,
      },
    });
  } catch (error) {
    console.error("Create payment intent error:", error);

    // Handle Stripe-specific errors
    if (error instanceof Error && "type" in error) {
      const stripeError = error as Error & { type?: string; code?: string };
      switch (stripeError.type) {
        case "StripeCardError":
          return NextResponse.json(
            { success: false, error: stripeError.message || "Card error" },
            { status: 400 }
          );
        case "StripeInvalidRequestError":
          return NextResponse.json(
            { success: false, error: "Invalid payment request. Please try again." },
            { status: 400 }
          );
        case "StripeAuthenticationError":
          return NextResponse.json(
            { success: false, error: "Payment system configuration error" },
            { status: 500 }
          );
        case "StripeRateLimitError":
          return NextResponse.json(
            { success: false, error: "Too many requests. Please try again in a moment." },
            { status: 429 }
          );
        default:
          break;
      }
    }

    // Handle Prisma errors
    if (error instanceof Error && error.name?.startsWith("PrismaClient")) {
      return NextResponse.json(
        { success: false, error: "Failed to create order record" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to create payment. Please try again." },
      { status: 500 }
    );
  }
}
