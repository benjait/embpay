import { NextRequest, NextResponse } from "next/server";
import { getAdminUser, unauthorized, logAdminAction } from "@/lib/admin";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const admin = await getAdminUser(request);
  if (!admin) return unauthorized();

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "25");
    const search = searchParams.get("search") || "";
    const statusFilter = searchParams.get("status") || "";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { key: { contains: search, mode: "insensitive" } },
        { customerEmail: { contains: search, mode: "insensitive" } },
        { product: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (statusFilter) {
      where.status = statusFilter;
    }

    // Fetch licenses with product and merchant details
    const [licenses, total] = await Promise.all([
      prisma.licenseKey.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          product: {
            select: { name: true },
          },
          user: {
            select: { email: true, businessName: true },
          },
          activations: {
            where: { isActive: true },
            select: { id: true },
          },
        },
      }),
      prisma.licenseKey.count({ where }),
    ]);

    const data = licenses.map(license => ({
      id: license.id,
      key: license.key,
      customerEmail: license.customerEmail,
      customerName: license.customerName,
      product: license.product.name,
      merchant: license.user.businessName || license.user.email,
      status: license.status,
      currentActivations: license.activations.length,
      maxActivations: license.maxActivations,
      expiresAt: license.expiresAt,
      createdAt: license.createdAt,
      revokedReason: license.revokedReason,
    }));

    return NextResponse.json({
      success: true,
      data: {
        licenses: data,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[Admin Licenses] GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch licenses" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const admin = await getAdminUser(request);
  if (!admin) return unauthorized();

  try {
    const body = await request.json();
    const { licenseId, action, reason } = body;

    if (!licenseId || !action) {
      return NextResponse.json(
        { success: false, error: "Missing licenseId or action" },
        { status: 400 }
      );
    }

    const license = await prisma.licenseKey.findUnique({
      where: { id: licenseId },
      select: { id: true, key: true, status: true, customerEmail: true },
    });

    if (!license) {
      return NextResponse.json(
        { success: false, error: "License not found" },
        { status: 404 }
      );
    }

    let updateData: any = {};
    let actionLog = "";

    if (action === "revoke") {
      updateData = {
        status: "revoked",
        revokedAt: new Date(),
        revokedReason: reason || "Revoked by admin",
      };
      actionLog = "license.revoke";
    } else if (action === "suspend") {
      updateData = {
        status: "suspended",
        revokedReason: reason || "Suspended by admin",
      };
      actionLog = "license.suspend";
    } else if (action === "reactivate") {
      updateData = {
        status: "active",
        revokedAt: null,
        revokedReason: null,
      };
      actionLog = "license.reactivate";
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid action" },
        { status: 400 }
      );
    }

    await prisma.licenseKey.update({
      where: { id: licenseId },
      data: updateData,
    });

    // Log the action
    await logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email,
      action: actionLog,
      targetType: "license",
      targetId: licenseId,
      details: { key: license.key, customerEmail: license.customerEmail, reason },
      ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin Licenses] PATCH error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update license" },
      { status: 500 }
    );
  }
}
