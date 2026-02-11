import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getAuthUser } from "@/lib/auth";

// Create Prisma client with error handling
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const prisma = globalForPrisma.prisma || new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
  log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function GET(request: NextRequest) {
  try {
    // Test database connection first
    await prisma.$connect();
    
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Run queries with individual error handling
    let totalProducts = 0;
    let totalOrders = 0;
    let completedOrders = 0;
    let completedOrdersPrevMonth = 0;
    let allCompletedOrders: any[] = [];
    let recentOrders: any[] = [];
    let last7DaysOrders: any[] = [];

    try {
      totalProducts = await prisma.product.count({
        where: { userId: user.id },
      });
    } catch (e) {
      console.error("Error counting products:", e);
    }

    try {
      totalOrders = await prisma.order.count({
        where: { userId: user.id },
      });
    } catch (e) {
      console.error("Error counting orders:", e);
    }

    try {
      completedOrders = await prisma.order.count({
        where: {
          userId: user.id,
          status: "completed",
          createdAt: { gte: thirtyDaysAgo },
        },
      });
    } catch (e) {
      console.error("Error counting completed orders:", e);
    }

    try {
      completedOrdersPrevMonth = await prisma.order.count({
        where: {
          userId: user.id,
          status: "completed",
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
      });
    } catch (e) {
      console.error("Error counting prev month orders:", e);
    }

    try {
      allCompletedOrders = await prisma.order.findMany({
        where: {
          userId: user.id,
          status: "completed",
        },
        select: { amount: true, createdAt: true },
      });
    } catch (e) {
      console.error("Error fetching completed orders:", e);
    }

    try {
      recentOrders = await prisma.order.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          product: {
            select: { name: true },
          },
        },
      });
    } catch (e) {
      console.error("Error fetching recent orders:", e);
    }

    try {
      last7DaysOrders = await prisma.order.findMany({
        where: {
          userId: user.id,
          status: "completed",
          createdAt: { gte: sevenDaysAgo },
        },
        select: { amount: true, createdAt: true },
      });
    } catch (e) {
      console.error("Error fetching last 7 days orders:", e);
    }

    // Calculate metrics
    const totalRevenue = allCompletedOrders.reduce(
      (sum, o) => sum + (o.amount || 0),
      0
    );

    const revenueThisMonth = allCompletedOrders
      .filter((o) => o.createdAt >= thirtyDaysAgo)
      .reduce((sum, o) => sum + (o.amount || 0), 0);

    const revenuePrevMonth = allCompletedOrders
      .filter((o) => o.createdAt >= sixtyDaysAgo && o.createdAt < thirtyDaysAgo)
      .reduce((sum, o) => sum + (o.amount || 0), 0);

    const revenueChange =
      revenuePrevMonth > 0
        ? ((revenueThisMonth - revenuePrevMonth) / revenuePrevMonth) * 100
        : revenueThisMonth > 0
          ? 100
          : 0;

    const ordersChange =
      completedOrdersPrevMonth > 0
        ? ((completedOrders - completedOrdersPrevMonth) / completedOrdersPrevMonth) * 100
        : completedOrders > 0
          ? 100
          : 0;

    const conversionRate = totalOrders > 0 ? (allCompletedOrders.length / totalOrders) * 100 : 0;

    // Build chart data
    const chartData: { date: string; label: string; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      const dayLabel = date.toLocaleDateString("en-US", { weekday: "short" });

      const dayRevenue = last7DaysOrders
        .filter((o) => o.createdAt.toISOString().split("T")[0] === dateStr)
        .reduce((sum, o) => sum + (o.amount || 0), 0);

      chartData.push({ date: dateStr, label: dayLabel, revenue: dayRevenue });
    }

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        totalProducts,
        conversionRate: Math.round(conversionRate * 100) / 100,
        revenueChange: Math.round(revenueChange * 10) / 10,
        ordersChange: Math.round(ordersChange * 10) / 10,
        recentOrders: recentOrders.map((o) => ({
          id: o.id,
          customerEmail: o.customerEmail,
          customerName: o.customerName,
          productName: o.product?.name || "Unknown",
          amount: o.amount,
          status: o.status,
          createdAt: o.createdAt.toISOString(),
        })),
        chartData,
      },
    });
  } catch (error: any) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Database error occurred",
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
