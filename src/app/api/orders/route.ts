import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { sanitizePagination } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const { page, limit } = sanitizePagination(
      searchParams.get("page"),
      searchParams.get("limit"),
      100
    );
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.slice(0, 200); // Limit search string length

    const where: Record<string, unknown> = { userId: user.id };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { customerEmail: { contains: search } },
        { customerName: { contains: search } },
        { id: { contains: search } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          product: {
            select: { id: true, name: true, price: true, imageUrl: true },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    return handleApiError(error, "Get orders");
  }
}

// SECURITY: Order creation is handled internally by the payment-intent flow.
// This endpoint should NOT allow arbitrary order creation from unauthenticated users
// as it would let attackers set arbitrary amounts and platformFees.
export async function POST(request: NextRequest) {
  try {
    // Require authentication — only internal/admin use
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      productId,
      customerEmail,
      customerName,
      stripeSessionId,
      includedBump,
    } = body;

    if (!productId || !customerEmail) {
      return NextResponse.json(
        { success: false, error: "Product ID and customer email are required" },
        { status: 400 }
      );
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return NextResponse.json(
        { success: false, error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Look up product and verify ownership
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Only the product owner can create manual orders
    if (product.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // SECURITY: Derive amount from product — never trust client-provided amount
    let amount = product.price;
    if (includedBump && product.bumpEnabled && product.bumpPrice) {
      amount += product.bumpPrice;
    }

    const commissionRate = user.commissionRate || 0.03;
    const platformFee = Math.round(amount * commissionRate);

    const order = await prisma.order.create({
      data: {
        amount,
        currency: product.currency || "usd",
        customerEmail: customerEmail.trim().toLowerCase(),
        customerName: customerName?.trim() || null,
        stripeSessionId: stripeSessionId || null,
        includedBump: includedBump || false,
        platformFee,
        productId,
        userId: user.id,
      },
    });

    return NextResponse.json(
      { success: true, data: order },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, "Create order");
  }
}
