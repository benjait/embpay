import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";

type RouteParams = { params: Promise<{ orderId: string }> };

// Semi-public endpoint to fetch order details (for success page)
// Only exposes delivery info for completed orders
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        userId: true,
        amount: true,
        currency: true,
        status: true,
        customerEmail: true,
        customerName: true,
        includedBump: true,
        createdAt: true,
        updatedAt: true,
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            imageUrl: true,
            deliveryType: true,
            deliveryUrl: true,
            deliveryInstructions: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Check if the requester is the order owner (authenticated)
    const user = await getAuthUser(request);
    const isOwner = user && order.userId === user.id;

    // SECURITY: Only expose delivery info for completed orders
    // Strip sensitive delivery URLs for non-completed orders to prevent
    // access before payment is confirmed.
    const safeProduct = { ...order.product };
    if (order.status !== "completed") {
      safeProduct.deliveryUrl = null;
      safeProduct.deliveryInstructions = null;
    }

    // SECURITY: Mask customer email for non-owners
    const safeEmail = isOwner
      ? order.customerEmail
      : order.customerEmail.replace(
          /^(.{2})(.*)(@.*)$/,
          (_: string, start: string, middle: string, domain: string) =>
            start + "*".repeat(Math.min(middle.length, 6)) + domain
        );

    // Never expose platformFee or stripePaymentIntentId to public
    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        status: order.status,
        customerEmail: safeEmail,
        customerName: order.customerName,
        includedBump: order.includedBump,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        product: safeProduct,
      },
    });
  } catch (error) {
    return handleApiError(error, "Get order");
  }
}

// Authenticated endpoint to update order status
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { orderId } = await params;
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Verify the order belongs to this user
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, userId: true, status: true },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    if (existingOrder.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, customerEmail, customerName } = body;

    // Validate status transitions
    const validStatuses = [
      "pending",
      "completed",
      "failed",
      "refunded",
      "partially_refunded",
    ];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Build update data — only include fields that were provided
    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (customerEmail !== undefined) updateData.customerEmail = customerEmail;
    if (customerName !== undefined) updateData.customerName = customerName;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields to update" },
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            imageUrl: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: updatedOrder });
  } catch (error) {
    return handleApiError(error, "Update order");
  }
}
