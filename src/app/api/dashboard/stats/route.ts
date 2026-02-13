import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Use singleton
import { getAuthUser } from "@/lib/auth";

// Force dynamic to ensure we check auth, but we can cache manually
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Dates for filtering
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // ⚡ Execute all DB queries in parallel for maximum speed
    const [
      totalStats,
      thisMonthStats,
      lastMonthStats,
      recentOrders,
      productsCount,
      chartDataRaw
    ] = await Promise.all([
      // 1. Total Revenue & Orders (Lifetime)
      prisma.order.aggregate({
        where: { userId: user.id, status: "completed" },
        _sum: { amount: true },
        _count: { id: true },
      }),

      // 2. This Month Revenue & Orders
      prisma.order.aggregate({
        where: { 
          userId: user.id, 
          status: "completed",
          createdAt: { gte: startOfThisMonth }
        },
        _sum: { amount: true },
        _count: { id: true },
      }),

      // 3. Last Month Revenue & Orders (for comparison)
      prisma.order.aggregate({
        where: { 
          userId: user.id, 
          status: "completed",
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }
        },
        _sum: { amount: true },
        _count: { id: true },
      }),

      // 4. Recent 5 Orders (for table)
      prisma.order.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { product: { select: { name: true } } },
      }),

      // 5. Total Products
      prisma.product.count({ where: { userId: user.id } }),

      // 6. Last 7 Days Revenue (for chart) - optimized to minimal fetch
      prisma.order.findMany({
        where: { 
          userId: user.id, 
          status: "completed", 
          createdAt: { gte: sevenDaysAgo } 
        },
        select: { amount: true, createdAt: true },
      }),
    ]);

    // Process Data
    const totalRevenue = totalStats._sum.amount || 0;
    const totalOrders = totalStats._count.id || 0;
    
    const thisMonthRevenue = thisMonthStats._sum.amount || 0;
    const lastMonthRevenue = lastMonthStats._sum.amount || 0;
    
    // Calculate percentage change
    const revenueChange = lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : thisMonthRevenue > 0 ? 100 : 0;

    // Calculate Conversion Rate (Completed / Total Orders) - Approx
    // Need total attempted orders count for accuracy
    const totalAttempts = await prisma.order.count({ where: { userId: user.id } });
    const conversionRate = totalAttempts > 0 
      ? (totalOrders / totalAttempts) * 100 
      : 0;

    // Format Chart Data
    const chartDataMap = new Map<string, number>();
    // Initialize last 7 days with 0
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      chartDataMap.set(d.toISOString().split('T')[0], 0);
    }
    // Fill with actual data
    chartDataRaw.forEach(order => {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      if (chartDataMap.has(dateKey)) {
        chartDataMap.set(dateKey, (chartDataMap.get(dateKey) || 0) + (order.amount || 0));
      }
    });

    const chartData = Array.from(chartDataMap.entries()).map(([date, amount]) => ({
      date,
      label: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      revenue: amount / 100 // Convert cents to dollars
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue: totalRevenue / 100,
        totalOrders: totalOrders, // Total completed
        totalProducts: productsCount,
        conversionRate: Math.round(conversionRate * 10) / 10,
        revenueChange: Math.round(revenueChange * 10) / 10,
        recentOrders: recentOrders.map(o => ({
          id: o.id,
          customerEmail: o.customerEmail,
          productName: o.product?.name || "Unknown",
          amount: o.amount / 100,
          status: o.status,
          createdAt: o.createdAt.toISOString(),
        })),
        chartData,
        // Helper for plans
        orders: thisMonthStats._count.id,
      }
    }, {
      headers: {
        // Cache for 60 seconds to make navigation instant
        'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=300'
      }
    });

  } catch (error: any) {
    console.error("[Dashboard API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}
