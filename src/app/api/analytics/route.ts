import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "7d";

    // Calculate date ranges
    const now = new Date();
    let daysBack = 7;
    if (range === "30d") daysBack = 30;
    if (range === "90d") daysBack = 90;

    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    const previousStartDate = new Date(startDate.getTime() - daysBack * 24 * 60 * 60 * 1000);

    // Fetch orders for current period
    const orders = await prisma.order.findMany({
      where: {
        userId: user.id,
        status: "completed",
        createdAt: { gte: startDate },
      },
      include: { product: { select: { name: true } } },
      orderBy: { createdAt: "asc" },
    });

    // Fetch orders for previous period (for comparison)
    const previousOrders = await prisma.order.findMany({
      where: {
        userId: user.id,
        status: "completed",
        createdAt: { gte: previousStartDate, lt: startDate },
      },
      select: { amount: true },
    });

    // Calculate metrics
    const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0);
    const totalOrders = orders.length;
    
    const previousRevenue = previousOrders.reduce((sum, o) => sum + o.amount, 0);
    const previousOrderCount = previousOrders.length;

    const revenueChange = previousRevenue > 0
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
      : totalRevenue > 0 ? 100 : 0;

    const ordersChange = previousOrderCount > 0
      ? ((totalOrders - previousOrderCount) / previousOrderCount) * 100
      : totalOrders > 0 ? 100 : 0;

    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get total orders (including pending) for conversion rate
    const allOrders = await prisma.order.count({
      where: { userId: user.id, createdAt: { gte: startDate } },
    });
    const conversionRate = allOrders > 0 ? (totalOrders / allOrders) * 100 : 0;

    // Build chart data
    const chartData = [];
    const ordersByDate: Record<string, { revenue: number; orders: number }> = {};

    for (const order of orders) {
      const dateStr = order.createdAt.toISOString().split("T")[0];
      if (!ordersByDate[dateStr]) {
        ordersByDate[dateStr] = { revenue: 0, orders: 0 };
      }
      ordersByDate[dateStr].revenue += order.amount;
      ordersByDate[dateStr].orders += 1;
    }

    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      const dayLabel = date.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric" 
      });

      chartData.push({
        date: dateStr,
        label: dayLabel,
        revenue: ordersByDate[dateStr]?.revenue || 0,
        orders: ordersByDate[dateStr]?.orders || 0,
      });
    }

    // Top products
    const productStats: Record<string, { orders: number; revenue: number; name: string }> = {};
    
    for (const order of orders) {
      const productName = order.product.name;
      if (!productStats[productName]) {
        productStats[productName] = { orders: 0, revenue: 0, name: productName };
      }
      productStats[productName].orders += 1;
      productStats[productName].revenue += order.amount;
    }

    const topProducts = Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        revenueChange: Math.round(revenueChange * 10) / 10,
        ordersChange: Math.round(ordersChange * 10) / 10,
        avgOrderValue: Math.round(avgOrderValue * 100) / 100,
        conversionRate: Math.round(conversionRate * 10) / 10,
        chartData,
        topProducts,
        recentActivity: [], // TODO: implement activity log
      },
    });
    
  } catch (error: any) {
    console.error("[Analytics API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Server error", message: error.message },
      { status: 500 }
    );
  }
}
