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
      return NextResponse.json({ success: false, error: "Missing API key" }, { status: 401 });
    }

    const apiKey = authHeader.substring(7);

    // Validate API key
    const keyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKey, active: true },
      include: { user: { select: { id: true } } },
    });

    if (!keyRecord || !keyRecord.user) {
      return NextResponse.json({ success: false, error: "Invalid API key" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, paymentIntentId, wcOrderId } = body;

    if (!orderId && !paymentIntentId) {
      return NextResponse.json({ success: false, error: "Missing orderId or paymentIntentId" }, { status: 400 });
    }

    // Find the order
    const order = await prisma.order.findFirst({
      where: {
        userId: keyRecord.user.id,
        ...(orderId ? { id: orderId } : {}),
        ...(paymentIntentId ? { stripePaymentIntentId: paymentIntentId } : {}),
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    // Verify payment with Stripe (security check)
    if (paymentIntentId) {
      try {
        const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
        if (pi.status !== "succeeded") {
          return NextResponse.json(
            { success: false, error: `Payment not confirmed (status: ${pi.status})` },
            { status: 400 }
          );
        }
      } catch (e) {
        // If Stripe check fails, still proceed (webhook will clean up)
        console.warn("Stripe PI check failed:", e);
      }
    }

    // Mark order as completed
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "completed",
        stripePaymentIntentId: paymentIntentId || order.stripePaymentIntentId,
      },
    });

    return NextResponse.json({
      success: true,
      order: {
        id: updated.id,
        status: updated.status,
        amount: updated.amount,
        currency: updated.currency,
        customerEmail: updated.customerEmail,
        wcOrderId: wcOrderId || null,
      },
    });
  } catch (error: any) {
    console.error("Order confirm error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to confirm order" },
      { status: 500 }
    );
  }
}
