import { NextRequest, NextResponse } from "next/server";
import { getAdminUser, unauthorized } from "@/lib/admin";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const admin = await getAdminUser(request);
  if (!admin) return unauthorized();

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const actionFilter = searchParams.get("action") || "";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (actionFilter) {
      where.action = actionFilter;
    }

    // Fetch audit logs
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.auditLog.count({ where }),
    ]);

    const data = logs.map(log => ({
      id: log.id,
      timestamp: log.createdAt,
      adminEmail: log.adminEmail,
      action: log.action,
      targetType: log.targetType,
      targetId: log.targetId,
      details: log.details,
      ipAddress: log.ipAddress,
    }));

    return NextResponse.json({
      success: true,
      data: {
        logs: data,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[Admin Audit] GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}
