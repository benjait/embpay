import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Order ID required" },
        { status: 400 }
      );
    }

    const authUser = await getAuthUser(request);

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            currency: true,
            imageUrl: true,
          },
        },
        user: {
          select: {
            id: true,
            businessName: true,
            name: true,
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

    if (authUser && order.userId !== authUser.id) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        amount: order.amount,
        currency: order.currency,
        customerEmail: order.customerEmail,
        customerName: order.customerName,
        createdAt: order.createdAt,
        stripePaymentIntentId: order.stripePaymentIntentId,
        stripePaymentId: order.stripePaymentId,
        product: order.product,
        merchant: {
          id: order.user.id,
          name: order.user.name,
          businessName: order.user.businessName,
        },
      },
    });
  } catch (error) {
    return handleApiError(error, "Get order details");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.order.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing || existing.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const { status } = body;

    const order = await prisma.order.update({
      where: { id },
      data: {
        ...(status && { status }),
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    return handleApiError(error, "Update order");
  }
}
