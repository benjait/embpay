import { NextRequest, NextResponse } from "next/server";
import { getAdminUser, getSuperAdmin, unauthorized, logAdminAction } from "@/lib/admin";
import prisma from "@/lib/prisma";

/**
 * GET /api/admin/users — List all users with stats
 */
export async function GET(request: NextRequest) {
  const admin = await getAdminUser(request);
  if (!admin) return unauthorized();

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const plan = searchParams.get("plan") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { businessName: { contains: search, mode: "insensitive" } },
      ];
    }
    if (plan) {
      where.plan = plan;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          businessName: true,
          stripeConnected: true,
          role: true,
          plan: true,
          suspended: true,
          createdAt: true,
          _count: {
            select: {
              products: true,
              orders: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    // Get revenue per user
    const userIds = users.map(u => u.id);
    const revenues = await prisma.order.groupBy({
      by: ["userId"],
      where: { userId: { in: userIds }, status: "completed" },
      _sum: { amount: true },
    });
    const revenueMap = new Map(revenues.map(r => [r.userId, r._sum.amount || 0]));

    return NextResponse.json({
      success: true,
      data: {
        users: users.map(u => ({
          id: u.id,
          email: u.email,
          name: u.name,
          businessName: u.businessName,
          stripeConnected: u.stripeConnected,
          role: u.role,
          plan: u.plan,
          suspended: u.suspended,
          products: u._count.products,
          orders: u._count.orders,
          revenue: Math.round((revenueMap.get(u.id) || 0) * 100) / 100,
          createdAt: u.createdAt.toISOString(),
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("[Admin Users] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/users — Update user (suspend, change role, change plan)
 */
export async function PATCH(request: NextRequest) {
  const admin = await getAdminUser(request);
  if (!admin) return unauthorized();

  try {
    const body = await request.json();
    const { userId, action, value } = body;

    if (!userId || !action) {
      return NextResponse.json({ success: false, error: "Missing userId or action" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Only superadmin can change roles
    if (action === "role" && admin.role !== "superadmin") {
      return NextResponse.json({ success: false, error: "Superadmin required for role changes" }, { status: 403 });
    }

    let updateData: any = {};
    let auditAction = "";

    switch (action) {
      case "suspend":
        updateData = { suspended: true, suspendedReason: value || "Suspended by admin" };
        auditAction = "user.suspend";
        break;
      case "unsuspend":
        updateData = { suspended: false, suspendedReason: null };
        auditAction = "user.unsuspend";
        break;
      case "role":
        if (!["merchant", "admin", "superadmin"].includes(value)) {
          return NextResponse.json({ success: false, error: "Invalid role" }, { status: 400 });
        }
        updateData = { role: value };
        auditAction = "user.role_change";
        break;
      case "plan":
        if (!["free", "pro", "scale"].includes(value)) {
          return NextResponse.json({ success: false, error: "Invalid plan" }, { status: 400 });
        }
        updateData = { plan: value };
        auditAction = "user.plan_change";
        break;
      default:
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    }

    await prisma.user.update({ where: { id: userId }, data: updateData });

    // Log audit
    await logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email,
      action: auditAction,
      targetType: "user",
      targetId: userId,
      details: { action, value, previousPlan: user.plan, previousRole: user.role },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Admin Users PATCH] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
