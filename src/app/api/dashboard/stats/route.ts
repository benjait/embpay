import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
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
      // Total active products
      prisma.product.count({
        where: { userId: user.id },
      }),
      // Total orders
      prisma.order.count({
        where: { userId: user.id },
      }),
      // Completed orders this month
      prisma.order.count({
        where: {
          userId: user.id,
          status: "completed",
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      // Completed orders prev month (for comparison)
      prisma.order.count({
        where: {
          userId: user.id,
          status: "completed",
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
      }),
      // All completed orders (for revenue)
      prisma.order.findMany({
        where: {
          userId: user.id,
          status: "completed",
        },
        select: { amount: true, createdAt: true },
      }),
      // Recent orders with product info
      prisma.order.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          product: {
            select: { name: true },
          },
        },
      }),
      // Last 7 days orders for chart
      prisma.order.findMany({
        where: {
          userId: user.id,
          status: "completed",
          createdAt: { gte: sevenDaysAgo },
        },
        select: { amount: true, createdAt: true },
      }),
    ]);

    // Calculate total revenue
    const totalRevenue = allCompletedOrders.reduce(
      (sum, o) => sum + o.amount,
      0
    );

    // Revenue this month vs last month
    const revenueThisMonth = allCompletedOrders
      .filter((o) => o.createdAt >= thirtyDaysAgo)
      .reduce((sum, o) => sum + o.amount, 0);

    const revenuePrevMonth = allCompletedOrders
      .filter(
        (o) => o.createdAt >= sixtyDaysAgo && o.createdAt < thirtyDaysAgo
      )
      .reduce((sum, o) => sum + o.amount, 0);

    const revenueChange =
      revenuePrevMonth > 0
        ? ((revenueThisMonth - revenuePrevMonth) / revenuePrevMonth) * 100
        : revenueThisMonth > 0
          ? 100
          : 0;

    const ordersChange =
      completedOrdersPrevMonth > 0
        ? ((completedOrders - completedOrdersPrevMonth) /
            completedOrdersPrevMonth) *
          100
        : completedOrders > 0
          ? 100
          : 0;

    // Conversion rate: completed / total
    const conversionRate =
      totalOrders > 0
        ? (allCompletedOrders.length / totalOrders) * 100
        : 0;

    // Build last 7 days chart data
    const chartData: { date: string; label: string; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      const dayLabel = date.toLocaleDateString("en-US", { weekday: "short" });

      const dayRevenue = last7DaysOrders
        .filter((o) => o.createdAt.toISOString().split("T")[0] === dateStr)
        .reduce((sum, o) => sum + o.amount, 0);

      chartData.push({
        date: dateStr,
        label: dayLabel,
        revenue: dayRevenue,
      });
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
          productName: o.product.name,
          amount: o.amount,
          status: o.status,
          createdAt: o.createdAt.toISOString(),
        })),
        chartData,
      },
    });
  } catch (error) {
    return handleApiError(error, "Dashboard stats");
  }
}
