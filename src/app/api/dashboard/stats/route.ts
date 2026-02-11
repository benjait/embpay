import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getAuthUser } from "@/lib/auth";

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  console.log("[Dashboard API] Called at:", new Date().toISOString());
  
  try {
    const user = await getAuthUser(request);
    console.log("[Dashboard API] User:", user?.id || "null");
    
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

    // Run queries in parallel with timeout
    const timeoutMs = 8000; // 8 second timeout per query
    
    const runWithTimeout = async (promise: Promise<any>, name: string) => {
      try {
        const result = await Promise.race([
          promise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`${name} timeout`)), timeoutMs)
          )
        ]);
        console.log(`[Dashboard API] ${name} success`);
        return result;
      } catch (e: any) {
        console.error(`[Dashboard API] ${name} error:`, e.message);
        return null;
      }
    };

    // Run all queries in parallel
    const [
      totalProducts,
      totalOrders,
      completedOrders,
      completedOrdersPrevMonth,
      allCompletedOrders,
      recentOrders,
      last7DaysOrders,
    ] = await Promise.all([
      runWithTimeout(
        prisma.product.count({ where: { userId: user.id } }),
        "products count"
      ),
      runWithTimeout(
        prisma.order.count({ where: { userId: user.id } }),
        "orders count"
      ),
      runWithTimeout(
        prisma.order.count({
          where: { userId: user.id, status: "completed", createdAt: { gte: thirtyDaysAgo } },
        }),
        "completed orders"
      ),
      runWithTimeout(
        prisma.order.count({
          where: { userId: user.id, status: "completed", createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
        }),
        "prev month orders"
      ),
      runWithTimeout(
        prisma.order.findMany({
          where: { userId: user.id, status: "completed" },
          select: { amount: true, createdAt: true },
        }),
        "all completed orders"
      ),
      runWithTimeout(
        prisma.order.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { product: { select: { name: true } } },
        }),
        "recent orders"
      ),
      runWithTimeout(
        prisma.order.findMany({
          where: { userId: user.id, status: "completed", createdAt: { gte: sevenDaysAgo } },
          select: { amount: true, createdAt: true },
        }),
        "last 7 days orders"
      ),
    ]);

    // Use defaults if queries failed
    const safeProducts = totalProducts ?? 0;
    const safeOrders = totalOrders ?? 0;
    const safeCompleted = completedOrders ?? 0;
    const safeCompletedPrev = completedOrdersPrevMonth ?? 0;
    const safeAllCompleted = allCompletedOrders ?? [];
    const safeRecent = recentOrders ?? [];
    const safeLast7 = last7DaysOrders ?? [];

    console.log("[Dashboard API] Queries completed:", {
      products: safeProducts,
      orders: safeOrders,
      completed: safeCompleted,
    });

    // Calculate metrics
    const totalRevenue = safeAllCompleted.reduce((sum: number, o: any) => sum + (o?.amount || 0), 0);
    const revenueThisMonth = safeAllCompleted
      .filter((o: any) => o?.createdAt >= thirtyDaysAgo)
      .reduce((sum: number, o: any) => sum + (o?.amount || 0), 0);
    const revenuePrevMonth = safeAllCompleted
      .filter((o: any) => o?.createdAt >= sixtyDaysAgo && o?.createdAt < thirtyDaysAgo)
      .reduce((sum: number, o: any) => sum + (o?.amount || 0), 0);

    const revenueChange = revenuePrevMonth > 0
      ? ((revenueThisMonth - revenuePrevMonth) / revenuePrevMonth) * 100
      : revenueThisMonth > 0 ? 100 : 0;

    const ordersChange = safeCompletedPrev > 0
      ? ((safeCompleted - safeCompletedPrev) / safeCompletedPrev) * 100
      : safeCompleted > 0 ? 100 : 0;

    const conversionRate = safeOrders > 0 ? (safeAllCompleted.length / safeOrders) * 100 : 0;

    // Build chart data
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      const dayLabel = date.toLocaleDateString("en-US", { weekday: "short" });
      const dayRevenue = safeLast7
        .filter((o: any) => o?.createdAt?.toISOString().split("T")[0] === dateStr)
        .reduce((sum: number, o: any) => sum + (o?.amount || 0), 0);
      chartData.push({ date: dateStr, label: dayLabel, revenue: dayRevenue });
    }

    const response = {
      success: true,
      data: {
        totalRevenue,
        totalOrders: safeOrders,
        totalProducts: safeProducts,
        conversionRate: Math.round(conversionRate * 100) / 100,
        revenueChange: Math.round(revenueChange * 10) / 10,
        ordersChange: Math.round(ordersChange * 10) / 10,
        recentOrders: safeRecent.map((o: any) => ({
          id: o?.id || "",
          customerEmail: o?.customerEmail || "",
          customerName: o?.customerName || null,
          productName: o?.product?.name || "Unknown",
          amount: o?.amount || 0,
          status: o?.status || "pending",
          createdAt: o?.createdAt?.toISOString() || new Date().toISOString(),
        })),
        chartData,
      },
    };
    
    console.log("[Dashboard API] Response ready, totalRevenue:", totalRevenue);
    return NextResponse.json(response);
    
  } catch (error: any) {
    console.error("[Dashboard API] Critical error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Dashboard error",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
