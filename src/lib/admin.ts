import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export type AdminRole = "admin" | "superadmin";

/**
 * Get authenticated admin user. Returns null if not admin.
 */
export async function getAdminUser(request: NextRequest) {
  const authUser = await getAuthUser(request);
  if (!authUser) return null;

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
    return null;
  }

  return user;
}

/**
 * Check if user is superadmin (highest level).
 */
export async function getSuperAdmin(request: NextRequest) {
  const user = await getAdminUser(request);
  if (!user || user.role !== "superadmin") return null;
  return user;
}

/**
 * Unauthorized JSON response.
 */
export function unauthorized() {
  return NextResponse.json(
    { success: false, error: "Unauthorized — admin access required" },
    { status: 403 }
  );
}

/**
 * Log admin action for audit trail.
 */
export async function logAdminAction(params: {
  adminId: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  details?: any;
  ipAddress?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        adminId: params.adminId,
        adminEmail: params.adminEmail,
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId,
        details: params.details ? JSON.stringify(params.details) : null,
        ipAddress: params.ipAddress || null,
      },
    });
  } catch (error) {
    console.error("[AuditLog] Failed to log:", error);
  }
}

/**
 * Plan limits for the freemium model.
 */
export const PLAN_LIMITS = {
  free: {
    maxProducts: 10,
    maxOrdersPerMonth: 100,
    licenseKeys: false,
    apiAccess: false,
    whiteLabel: false,
    prioritySupport: false,
  },
  pro: {
    maxProducts: Infinity,
    maxOrdersPerMonth: Infinity,
    licenseKeys: true,
    apiAccess: false,
    whiteLabel: false,
    prioritySupport: false,
  },
  scale: {
    maxProducts: Infinity,
    maxOrdersPerMonth: Infinity,
    licenseKeys: true,
    apiAccess: true,
    whiteLabel: true,
    prioritySupport: true,
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

/**
 * Check if a merchant has reached their plan limits.
 */
export async function checkPlanLimit(
  userId: string,
  check: "products" | "orders"
): Promise<{ allowed: boolean; limit: number; current: number; plan: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });

  const plan = (user?.plan || "free") as PlanType;
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

  if (check === "products") {
    const count = await prisma.product.count({ where: { userId } });
    return {
      allowed: count < limits.maxProducts,
      limit: limits.maxProducts,
      current: count,
      plan,
    };
  }

  if (check === "orders") {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const count = await prisma.order.count({
      where: { userId, createdAt: { gte: startOfMonth } },
    });
    return {
      allowed: count < limits.maxOrdersPerMonth,
      limit: limits.maxOrdersPerMonth,
      current: count,
      plan,
    };
  }

  return { allowed: true, limit: Infinity, current: 0, plan };
}
