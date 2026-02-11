import { NextRequest, NextResponse } from "next/server";
import { getAdminUser, unauthorized } from "@/lib/admin";
import prisma from "@/lib/prisma";

/**
 * GET /api/admin/transactions — All transactions across all merchants
 */
export async function GET(request: NextRequest) {
  const admin = await getAdminUser(request);
  if (!admin) return unauthorized();

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "25");
    const offset = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { customerEmail: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
        { id: { contains: search } },
      ];
    }
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
        include: {
          product: { select: { name: true } },
          user: { select: { email: true, businessName: true } },
          licenseKey: { select: { key: true, status: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    // Revenue summary
    const [totalRevenue, todayRevenue] = await Promise.all([
      prisma.order.aggregate({
        where: { status: "completed" },
        _sum: { amount: true },
      }),
      prisma.order.aggregate({
        where: {
          status: "completed",
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
        _sum: { amount: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        transactions: orders.map(o => ({
          id: o.id,
          amount: o.amount,
          currency: o.currency,
          status: o.status,
          customerEmail: o.customerEmail,
          customerName: o.customerName,
          product: o.product.name,
          merchant: o.user.businessName || o.user.email,
          merchantEmail: o.user.email,
          licenseKey: o.licenseKey?.key || null,
          licenseStatus: o.licenseKey?.status || null,
          platformFee: o.platformFee,
          stripePaymentId: o.stripePaymentId,
          createdAt: o.createdAt.toISOString(),
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
        summary: {
          totalRevenue: totalRevenue._sum.amount || 0,
          todayRevenue: todayRevenue._sum.amount || 0,
        },
      },
    });
  } catch (error: any) {
    console.error("[Admin Transactions] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
