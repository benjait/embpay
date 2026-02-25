import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";

// GET — Auth/WordPress: fetch order details by ID
// Used by WordPress plugin to display thank you page
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

    // Get API key from Authorization header (for WordPress plugin)
    const authHeader = request.headers.get("authorization");
    let isValidRequest = false;
    let merchantId = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const apiKey = authHeader.substring(7);
      
      // Find merchant by API key
      const merchant = await prisma.user.findFirst({
        where: { licenseKey: apiKey },
        select: { id: true },
      });

      if (merchant) {
        isValidRequest = true;
        merchantId = merchant.id;
      }
    }

    // Also allow authenticated users (merchant viewing their own orders)
    const authUser = await getAuthUser(request);
    if (authUser) {
      isValidRequest = true;
      merchantId = authUser.id;
    }

    if (!isValidRequest) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch order
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
            deliveryType: true,
            deliveryUrl: true,
            deliveryInstructions: true,
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

    // If merchant is logged in, verify they own this order
    if (authUser && order.userId !== authUser.id) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Return order details
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        amount: order.amount,
        currency: order.currency,
        customerEmail: order.customerEmail,
        customerName: order.customerName,
        paidAt: order.paidAt,
        createdAt: order.createdAt,
        receiptUrl: order.receiptUrl,
        stripePaymentIntentId: order.stripePaymentIntentId,
        stripeChargeId: order.stripeChargeId,
        refundAmount: order.refundAmount,
        metadata: order.metadata,
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

// PUT — Auth: update order (for webhooks or manual updates)
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

    // Verify ownership
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

    // Update allowed fields
    const { status, metadata, receiptUrl } = body;

    const order = await prisma.order.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(metadata && { metadata: { ...metadata } }),
        ...(receiptUrl && { receiptUrl }),
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
