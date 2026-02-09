import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { isValidString, isPositiveNumber, sanitizeString } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const plans = await prisma.plan.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { subscriptions: true } },
      },
    });

    return NextResponse.json({ success: true, data: plans });
  } catch (error) {
    return handleApiError(error, "Get plans");
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
    const { name, price, interval, features, stripePriceId } = body;

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

    if (price > 99999999) {
      return NextResponse.json(
        { success: false, error: "Price exceeds maximum allowed" },
        { status: 400 }
      );
    }

    if (interval && !["month", "year"].includes(interval)) {
      return NextResponse.json(
        { success: false, error: "Interval must be 'month' or 'year'" },
        { status: 400 }
      );
    }

    const plan = await prisma.plan.create({
      data: {
        name: sanitizeString(name, 500),
        price,
        interval: interval || "month",
        features: features ? JSON.stringify(features) : null,
        stripePriceId: stripePriceId || null,
        userId: user.id,
      },
    });

    return NextResponse.json(
      { success: true, data: plan },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, "Create plan");
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, name, price, interval, features, stripePriceId, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Plan ID is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const existing = await prisma.plan.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Plan not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (price !== undefined) updateData.price = price;
    if (interval !== undefined) updateData.interval = interval;
    if (features !== undefined) updateData.features = features ? JSON.stringify(features) : null;
    if (stripePriceId !== undefined) updateData.stripePriceId = stripePriceId;
    if (isActive !== undefined) updateData.isActive = isActive;

    const plan = await prisma.plan.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: plan });
  } catch (error) {
    return handleApiError(error, "Update plan");
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Plan ID is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const existing = await prisma.plan.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Plan not found" },
        { status: 404 }
      );
    }

    // Check for active subscriptions
    const activeSubscriptions = await prisma.subscription.count({
      where: { planId: id, status: "active" },
    });

    if (activeSubscriptions > 0) {
      return NextResponse.json(
        { success: false, error: "Cannot delete plan with active subscriptions. Deactivate it instead." },
        { status: 400 }
      );
    }

    await prisma.plan.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, "Delete plan");
  }
}
