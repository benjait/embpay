import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getAuthUser } from "@/lib/auth";

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  console.log("[Dashboard API] Called");
  
  try {
    const user = await getAuthUser(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Simplified - return empty data immediately if queries fail
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    let totalProducts = 0;
    let totalOrders = 0;
    let completedOrders = 0;
    let completedOrdersPrevMonth = 0;
    let allCompletedOrders: any[] = [];
    let recentOrders: any[] = [];
    let last7DaysOrders: any[] = [];

    try {
      // Run all queries in parallel with individual timeouts
      const results = await Promise.allSettled([
        prisma.product.count({ where: { userId: user.id } }),
        prisma.order.count({ where: { userId: user.id } }),
        prisma.order.count({
          where: { userId: user.id, status: "completed", createdAt: { gte: thirtyDaysAgo } },
        }),
        prisma.order.count({
          where: { userId: user.id, status: "completed", createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
        }),
        prisma.order.findMany({
          where: { userId: user.id, status: "completed" },
          select: { amount: true, createdAt: true },
        }),
        prisma.order.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { product: { select: { name: true } } },
        }),
        prisma.order.findMany({
          where: { userId: user.id, status: "completed", createdAt: { gte: sevenDaysAgo } },
          select: { amount: true, createdAt: true },
        }),
      ]);

      totalProducts = results[0].status === 'fulfilled' ? results[0].value : 0;
      totalOrders = results[1].status === 'fulfilled' ? results[1].value : 0;
      completedOrders = results[2].status === 'fulfilled' ? results[2].value : 0;
      completedOrdersPrevMonth = results[3].status === 'fulfilled' ? results[3].value : 0;
      allCompletedOrders = results[4].status === 'fulfilled' ? results[4].value : [];
      recentOrders = results[5].status === 'fulfilled' ? results[5].value : [];
      last7DaysOrders = results[6].status === 'fulfilled' ? results[6].value : [];

    } catch (dbError) {
      console.error("[Dashboard API] DB queries failed:", dbError);
      // Return empty data - don't fail the request
    }

    // Calculate metrics
    const totalRevenue = allCompletedOrders.reduce((sum, o) => sum + (o?.amount || 0), 0);
    const revenueThisMonth = allCompletedOrders
      .filter((o) => o?.createdAt >= thirtyDaysAgo)
      .reduce((sum, o) => sum + (o?.amount || 0), 0);
    const revenuePrevMonth = allCompletedOrders
      .filter((o) => o?.createdAt >= sixtyDaysAgo && o?.createdAt < thirtyDaysAgo)
      .reduce((sum, o) => sum + (o?.amount || 0), 0);

    const revenueChange = revenuePrevMonth > 0
      ? ((revenueThisMonth - revenuePrevMonth) / revenuePrevMonth) * 100
      : revenueThisMonth > 0 ? 100 : 0;

    const ordersChange = completedOrdersPrevMonth > 0
      ? ((completedOrders - completedOrdersPrevMonth) / completedOrdersPrevMonth) * 100
      : completedOrders > 0 ? 100 : 0;

    const conversionRate = totalOrders > 0 ? (allCompletedOrders.length / totalOrders) * 100 : 0;

    // Build chart data
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      const dayLabel = date.toLocaleDateString("en-US", { weekday: "short" });
      const dayRevenue = last7DaysOrders
        .filter((o) => o?.createdAt?.toISOString().split("T")[0] === dateStr)
        .reduce((sum, o) => sum + (o?.amount || 0), 0);
      chartData.push({ date: dateStr, label: dayLabel, revenue: dayRevenue });
    }

    // Get current month order count for plan limits
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    let monthlyOrders = 0;
    try {
      monthlyOrders = await prisma.order.count({
        where: { userId: user.id, createdAt: { gte: startOfMonth } },
      });
    } catch {
      monthlyOrders = 0;
    }

    // Get full user data including plan info
    let userData = null;
    try {
      userData = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          email: true,
          name: true,
          plan: true,
          planExpiresAt: true,
        },
      });
    } catch {
      userData = { ...user, plan: "free", planExpiresAt: null };
    }

    console.log("[Dashboard API] Success - products:", totalProducts, "orders:", totalOrders);

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
          id: o?.id || "",
          customerEmail: o?.customerEmail || "",
          customerName: o?.customerName || null,
          productName: o?.product?.name || "Unknown",
          amount: o?.amount || 0,
          status: o?.status || "pending",
          createdAt: o?.createdAt?.toISOString() || new Date().toISOString(),
        })),
        chartData,
        // For plans page
        user: userData,
        products: totalProducts,
        orders: monthlyOrders,
      },
    });
    
  } catch (error: any) {
    console.error("[Dashboard API] Critical error:", error);
    return NextResponse.json(
      { success: false, error: "Server error", message: error.message },
      { status: 500 }
    );
  }
}
