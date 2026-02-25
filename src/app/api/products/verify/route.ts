import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/errors";

// GET — Public: verify product exists and is available
// Used by WordPress plugin to validate product before displaying
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Product ID required" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            businessName: true,
            name: true,
            stripeConnected: true,
            stripeAccountId: true,
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

    if (!product.active) {
      return NextResponse.json(
        { success: false, error: "Product is no longer available" },
        { status: 410 }
      );
    }

    if (!product.user.stripeConnected || !product.user.stripeAccountId) {
      return NextResponse.json(
        { success: false, error: "Merchant payment not configured" },
        { status: 400 }
      );
    }

    // Return sanitized product data
    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        currency: product.currency,
        imageUrl: product.imageUrl,
        type: product.type,
        interval: product.interval,
        deliveryType: product.deliveryType,
        deliveryUrl: product.deliveryUrl,
        deliveryInstructions: product.deliveryInstructions,
        bumpEnabled: product.bumpEnabled,
        bumpPrice: product.bumpPrice,
        merchant: {
          id: product.user.id,
          businessName: product.user.businessName,
          name: product.user.name,
          stripeConnected: product.user.stripeConnected,
          stripeAccountId: product.user.stripeAccountId,
        },
      },
    });
  } catch (error) {
    return handleApiError(error, "Verify product");
  }
}
