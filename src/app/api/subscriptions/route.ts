import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { isValidEmail } from "@/lib/validation";

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
    const planId = searchParams.get("planId");
    const status = searchParams.get("status");

    // Build filter: only show subscriptions for this user's plans
    const where: Record<string, unknown> = {
      plan: { userId: user.id },
    };

    if (planId) where.planId = planId;
    if (status) where.status = status;

    const subscriptions = await prisma.subscription.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        plan: {
          select: {
            id: true,
            name: true,
            price: true,
            interval: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: subscriptions });
  } catch (error) {
    return handleApiError(error, "Get subscriptions");
  }
}

// POST — Authenticated: manually create a subscription (plan owner only)
// Normal subscriptions should be created via Stripe webhook events.
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
    const { customerEmail, planId, stripeSubscriptionId } = body;

    if (!customerEmail || !planId) {
      return NextResponse.json(
        { success: false, error: "Customer email and plan ID are required" },
        { status: 400 }
      );
    }

    if (!isValidEmail(customerEmail)) {
      return NextResponse.json(
        { success: false, error: "Invalid email address" },
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

    // Verify the plan exists, is active, and belongs to the authenticated user
    const plan = await prisma.plan.findFirst({
      where: { id: planId, isActive: true, userId: user.id },
    });

    if (!plan) {
      return NextResponse.json(
        { success: false, error: "Plan not found or inactive" },
        { status: 404 }
      );
    }

    // Calculate period end (1 month or 1 year from now)
    const now = new Date();
    const currentPeriodEnd = new Date(now);
    if (plan.interval === "year") {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    } else {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    }

    const subscription = await prisma.subscription.create({
      data: {
        customerEmail: customerEmail.trim().toLowerCase(),
        planId,
        stripeSubscriptionId: stripeSubscriptionId || null,
        status: "active",
        currentPeriodEnd,
      },
      include: {
        plan: {
          select: {
            id: true,
            name: true,
            price: true,
            interval: true,
          },
        },
      },
    });

    return NextResponse.json(
      { success: true, data: subscription },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, "Create subscription");
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
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "Subscription ID and status are required" },
        { status: 400 }
      );
    }

    if (!["active", "canceled", "past_due"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    // Verify ownership through plan
    const existing = await prisma.subscription.findFirst({
      where: { id, plan: { userId: user.id } },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Subscription not found" },
        { status: 404 }
      );
    }

    const subscription = await prisma.subscription.update({
      where: { id },
      data: { status },
      include: {
        plan: {
          select: {
            id: true,
            name: true,
            price: true,
            interval: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: subscription });
  } catch (error) {
    return handleApiError(error, "Update subscription");
  }
}
