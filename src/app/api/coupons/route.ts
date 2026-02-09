import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";

// GET — List user's coupons (authenticated)
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const coupons = await prisma.coupon.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    // Enrich with computed status
    const enriched = coupons.map((c) => {
      let status: "active" | "expired" | "maxed" = "active";
      if (!c.active) status = "expired";
      else if (c.expiresAt && new Date(c.expiresAt) < new Date()) status = "expired";
      else if (c.maxUses > 0 && c.usedCount >= c.maxUses) status = "maxed";

      return { ...c, status };
    });

    return NextResponse.json({ success: true, data: enriched });
  } catch (error) {
    return handleApiError(error, "Get coupons");
  }
}

// POST — Create a new coupon (authenticated)
// The `discount` field is a decimal fraction: 0.2 = 20% off, 0.5 = 50% off
// The frontend should send the value already as a decimal (e.g. user enters "20" → frontend sends 0.2)
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
    const { code, discount, maxUses, expiresAt } = body;

    // Validation
    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json(
        { success: false, error: "Coupon code is required" },
        { status: 400 }
      );
    }

    if (discount === undefined || discount === null || typeof discount !== "number") {
      return NextResponse.json(
        { success: false, error: "Discount is required and must be a number (e.g. 0.2 for 20% off)" },
        { status: 400 }
      );
    }

    if (discount <= 0 || discount > 1) {
      return NextResponse.json(
        { success: false, error: "Discount must be between 0 and 1 (e.g. 0.2 for 20% off)" },
        { status: 400 }
      );
    }

    const normalizedCode = code.toUpperCase().trim();

    // Check for duplicate code
    const existing = await prisma.coupon.findUnique({
      where: { code: normalizedCode },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "A coupon with this code already exists" },
        { status: 409 }
      );
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: normalizedCode,
        discount, // Store directly as decimal: 0.2 = 20%
        maxUses: maxUses && typeof maxUses === "number" && maxUses > 0 ? maxUses : 0,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        userId: user.id,
      },
    });

    return NextResponse.json(
      { success: true, data: coupon },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, "Create coupon");
  }
}

// DELETE — Deactivate a coupon (authenticated, soft delete)
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
        { success: false, error: "Coupon ID is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const existing = await prisma.coupon.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Coupon not found" },
        { status: 404 }
      );
    }

    // Soft delete: deactivate instead of removing
    await prisma.coupon.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json({ success: true, data: { id, active: false } });
  } catch (error) {
    return handleApiError(error, "Delete coupon");
  }
}
