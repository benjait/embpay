import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { isValidEmail } from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * WooCommerce Payment Intent API
 * 
 * Allows WordPress/WooCommerce sites to create Stripe Payment Intents
 * via EmbPay platform using API key authentication.
 * 
 * Usage:
 * POST /api/woocommerce/payment-intent
 * Headers: { "x-embpay-api-key": "embpay_xxxxx" }
 * Body: { amount, currency, customerEmail, customerName, orderNumber }
 */

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`wc-payment:${ip}`, {
      maxRequests: 30,
      windowSeconds: 60,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests" },
        { status: 429 }
      );
    }

    // API Key authentication
    const apiKey = request.headers.get("x-embpay-api-key");
    
    if (!apiKey || !apiKey.startsWith("embpay_")) {
      return NextResponse.json(
        { success: false, error: "Invalid API key" },
        { status: 401 }
      );
    }

    // For now, accept any key starting with embpay_
    // TODO: Validate against database when API key system is implemented
    
    const body = await request.json();
    const { 
      amount, 
      currency = "usd", 
      customerEmail, 
      customerName,
      orderNumber,
      metadata = {}
    } = body;

    // Validate amount
    if (!amount || typeof amount !== "number" || amount < 50) {
      return NextResponse.json(
        { success: false, error: "Amount must be at least $0.50 (50 cents)" },
        { status: 400 }
      );
    }

    // Validate email
    if (customerEmail && !isValidEmail(customerEmail)) {
      return NextResponse.json(
        { success: false, error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Validate currency
    const validCurrencies = ["usd", "eur", "gbp", "cad", "aud"];
    if (!validCurrencies.includes(currency.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: `Unsupported currency: ${currency}` },
        { status: 400 }
      );
    }

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount in cents
      currency: currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      receipt_email: customerEmail || undefined,
      description: orderNumber ? `WooCommerce Order #${orderNumber}` : "WordPress/WooCommerce Purchase",
      metadata: {
        source: "woocommerce",
        order_number: orderNumber || "",
        customer_name: customerName || "",
        api_key: apiKey.substring(0, 15) + "...", // Store partial key for tracking
        ...metadata
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      },
    });

  } catch (error) {
    console.error("WooCommerce payment intent error:", error);

    // Handle Stripe errors
    if (error instanceof Error && "type" in error) {
      const stripeError = error as Error & { type?: string };
      
      switch (stripeError.type) {
        case "StripeCardError":
          return NextResponse.json(
            { success: false, error: stripeError.message || "Card error" },
            { status: 400 }
          );
        case "StripeInvalidRequestError":
          return NextResponse.json(
            { success: false, error: "Invalid payment request" },
            { status: 400 }
          );
        case "StripeAuthenticationError":
          return NextResponse.json(
            { success: false, error: "Stripe authentication failed. Please contact support." },
            { status: 500 }
          );
        default:
          break;
      }
    }

    return NextResponse.json(
      { success: false, error: "Payment creation failed. Please try again." },
      { status: 500 }
    );
  }
}

// OPTIONS handler for CORS (if needed)
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-embpay-api-key",
    },
  });
}
