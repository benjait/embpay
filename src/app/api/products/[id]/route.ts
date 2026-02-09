import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { isValidString, isPositiveNumber, isValidUrl, sanitizeString } from "@/lib/validation";

// GET — Public: fetch product by ID (for checkout pages)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            businessName: true,
            name: true,
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

    if (!product.active) {
      return NextResponse.json(
        { success: false, error: "This product is no longer available" },
        { status: 410 }
      );
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    return handleApiError(error, "Get product");
  }
}

// PUT — Auth required: update product
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

    // Verify ownership
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing || existing.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      price,
      currency,
      imageUrl,
      type,
      interval,
      deliveryType,
      deliveryUrl,
      deliveryInstructions,
      active,
      bumpEnabled,
      bumpProduct,
      bumpPrice,
    } = body;

    // Validate fields if provided
    if (name !== undefined && !isValidString(name, { minLength: 1, maxLength: 500 })) {
      return NextResponse.json(
        { success: false, error: "Name must be 1-500 characters" },
        { status: 400 }
      );
    }

    if (price !== undefined && !isPositiveNumber(price)) {
      return NextResponse.json(
        { success: false, error: "Price must be a positive number" },
        { status: 400 }
      );
    }

    if (price !== undefined && price > 99999999) {
      return NextResponse.json(
        { success: false, error: "Price exceeds maximum allowed" },
        { status: 400 }
      );
    }

    if (imageUrl !== undefined && imageUrl !== null && imageUrl !== "" && !isValidUrl(imageUrl)) {
      return NextResponse.json(
        { success: false, error: "Invalid image URL" },
        { status: 400 }
      );
    }

    if (deliveryUrl !== undefined && deliveryUrl !== null && deliveryUrl !== "" && !isValidUrl(deliveryUrl)) {
      return NextResponse.json(
        { success: false, error: "Invalid delivery URL" },
        { status: 400 }
      );
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: sanitizeString(name, 500) }),
        ...(description !== undefined && {
          description: description ? sanitizeString(description, 5000) : null,
        }),
        ...(price !== undefined && { price }),
        ...(currency !== undefined && { currency }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(type !== undefined && { type }),
        ...(interval !== undefined && { interval }),
        ...(deliveryType !== undefined && { deliveryType }),
        ...(deliveryUrl !== undefined && { deliveryUrl }),
        ...(deliveryInstructions !== undefined && {
          deliveryInstructions: deliveryInstructions ? sanitizeString(deliveryInstructions, 5000) : null,
        }),
        ...(active !== undefined && { active }),
        ...(bumpEnabled !== undefined && { bumpEnabled }),
        ...(bumpProduct !== undefined && { bumpProduct: bumpProduct ? sanitizeString(bumpProduct, 500) : null }),
        ...(bumpPrice !== undefined && { bumpPrice }),
      },
    });

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    return handleApiError(error, "Update product");
  }
}

// DELETE — Auth required: soft-delete product (set active=false)
export async function DELETE(
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

    // Verify ownership
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing || existing.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    if (!existing.active) {
      return NextResponse.json(
        { success: false, error: "Product is already deactivated" },
        { status: 400 }
      );
    }

    // Soft delete: set active=false instead of removing from DB
    const product = await prisma.product.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json({ success: true, data: { id: product.id, active: false, deleted: true } });
  } catch (error) {
    return handleApiError(error, "Delete product");
  }
}
