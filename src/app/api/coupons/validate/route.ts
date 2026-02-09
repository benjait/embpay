import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/errors";

// POST — Validate a coupon code (public endpoint, needed by checkout)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, productId } = body;

    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json(
        { success: false, error: "Coupon code is required" },
        { status: 400 }
      );
    }

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    const normalizedCode = code.toUpperCase().trim();

    // Look up the coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code: normalizedCode },
    });

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: "Invalid coupon code" },
        { status: 404 }
      );
    }

    // Check if coupon is active
    if (!coupon.active) {
      return NextResponse.json(
        { success: false, error: "This coupon is no longer active" },
        { status: 400 }
      );
    }

    // Check expiry
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json(
        { success: false, error: "This coupon has expired" },
        { status: 400 }
      );
    }

    // Check usage limit
    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json(
        { success: false, error: "This coupon has reached its usage limit" },
        { status: 400 }
      );
    }

    // Verify the coupon belongs to the product's owner
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { userId: true, price: true, active: true },
    });

    if (!product || !product.active) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    if (coupon.userId !== product.userId) {
      return NextResponse.json(
        { success: false, error: "This coupon is not valid for this product" },
        { status: 400 }
      );
    }

    // Calculate discount amount in cents
    const discountAmount = Math.round(product.price * coupon.discount);

    return NextResponse.json({
      success: true,
      data: {
        code: coupon.code,
        discountPercent: coupon.discount,
        discount: discountAmount,
        message: `${Math.round(coupon.discount * 100)}% off applied!`,
      },
    });
  } catch (error) {
    return handleApiError(error, "Validate coupon");
  }
}
