import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { isValidString, isPositiveNumber, isValidUrl, sanitizeString } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const products = await prisma.product.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { orders: true } },
      },
    });

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    return handleApiError(error, "Get products");
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
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
      bumpEnabled,
      bumpProduct,
      bumpPrice,
    } = body;

    // Validation
    if (!isValidString(name, { minLength: 1, maxLength: 500 })) {
      return NextResponse.json(
        { success: false, error: "Name is required (max 500 characters)" },
        { status: 400 }
      );
    }

    if (!isPositiveNumber(price)) {
      return NextResponse.json(
        { success: false, error: "Price must be a positive number" },
        { status: 400 }
      );
    }

    // Cap price at a reasonable maximum (in cents): $999,999.99
    if (price > 99999999) {
      return NextResponse.json(
        { success: false, error: "Price exceeds maximum allowed" },
        { status: 400 }
      );
    }

    if (description && !isValidString(description, { maxLength: 5000 })) {
      return NextResponse.json(
        { success: false, error: "Description must be 5000 characters or less" },
        { status: 400 }
      );
    }

    if (imageUrl && !isValidUrl(imageUrl)) {
      return NextResponse.json(
        { success: false, error: "Invalid image URL" },
        { status: 400 }
      );
    }

    if (deliveryUrl && !isValidUrl(deliveryUrl)) {
      return NextResponse.json(
        { success: false, error: "Invalid delivery URL" },
        { status: 400 }
      );
    }

    const validTypes = ["one_time", "subscription"];
    if (type && !validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: "Type must be 'one_time' or 'subscription'" },
        { status: 400 }
      );
    }

    const validIntervals = ["month", "year"];
    if (interval && !validIntervals.includes(interval)) {
      return NextResponse.json(
        { success: false, error: "Interval must be 'month' or 'year'" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name: sanitizeString(name, 500),
        description: description ? sanitizeString(description, 5000) : null,
        price,
        currency: currency || "usd",
        imageUrl: imageUrl || null,
        type: type || "one_time",
        interval: interval || null,
        deliveryType: deliveryType || "none",
        deliveryUrl: deliveryUrl || null,
        deliveryInstructions: deliveryInstructions ? sanitizeString(deliveryInstructions, 5000) : null,
        bumpEnabled: bumpEnabled || false,
        bumpProduct: bumpProduct ? sanitizeString(bumpProduct, 500) : null,
        bumpPrice: bumpPrice || null,
        userId: user.id,
      },
    });

    return NextResponse.json(
      { success: true, data: product },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, "Create product");
  }
}
