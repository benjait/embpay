import { NextRequest, NextResponse } from "next/server";
import { getAdminUser, unauthorized } from "@/lib/admin";
import prisma from "@/lib/prisma";

// Simple in-memory cache (30 seconds TTL)
let cachedData: any = null;
let cacheTime = 0;
const CACHE_TTL = 30 * 1000; // 30 seconds

export async function GET(request: NextRequest) {
  const admin = await getAdminUser(request);
  if (!admin) return unauthorized();

  // Return cached data if still fresh
  if (cachedData && Date.now() - cacheTime < CACHE_TTL) {
    return NextResponse.json(cachedData);
  }

  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const previousThirty = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Run all queries in parallel
    const [
      totalUsers,
      newUsersThisMonth,
      newUsersPrevMonth,
      totalProducts,
      totalOrders,
      completedOrders,
      todayOrders,
      revenueData,
      prevRevenueData,
      recentOrders,
      topMerchants,
      planDistribution,
      totalLicenses,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: previousThirty, lt: thirtyDaysAgo } } }),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.count({ where: { status: "completed" } }),
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.order.aggregate({
        where: { status: "completed", createdAt: { gte: thirtyDaysAgo } },
        _sum: { amount: true, platformFee: true },
        _count: true,
      }),
      prisma.order.aggregate({
        where: { status: "completed", createdAt: { gte: previousThirty, lt: thirtyDaysAgo } },
        _sum: { amount: true },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          amount: true,
          status: true,
          customerEmail: true,
          createdAt: true,
          product: { select: { name: true } },
          user: { select: { email: true, businessName: true } },
        },
      }),
      prisma.order.groupBy({
        by: ["userId"],
        where: { status: "completed" },
        _sum: { amount: true },
        _count: true,
        orderBy: { _sum: { amount: "desc" } },
        take: 5,
      }),
      prisma.user.groupBy({
        by: ["plan"],
        _count: true,
      }),
      prisma.licenseKey.count().catch(() => 0),
    ]);

    // Calculate metrics
    const gmvThisMonth = revenueData._sum.amount || 0;
    const gmvPrevMonth = prevRevenueData._sum.amount || 0;
    const gmvChange = gmvPrevMonth > 0
      ? ((gmvThisMonth - gmvPrevMonth) / gmvPrevMonth) * 100
      : gmvThisMonth > 0 ? 100 : 0;

    const userChange = newUsersPrevMonth > 0
      ? ((newUsersThisMonth - newUsersPrevMonth) / newUsersPrevMonth) * 100
      : newUsersThisMonth > 0 ? 100 : 0;

    // Get merchant names for top merchants
    const topMerchantIds = topMerchants.map(m => m.userId);
    const merchants = await prisma.user.findMany({
      where: { id: { in: topMerchantIds } },
      select: { id: true, email: true, businessName: true, name: true },
    });
    const merchantMap = new Map(merchants.map(m => [m.id, m]));

    // Build 30-day chart (use aggregated data to reduce load)
    const chartOrders = await prisma.order.findMany({
      where: { status: "completed", createdAt: { gte: thirtyDaysAgo } },
      select: { amount: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const chartData: Record<string, { revenue: number; orders: number }> = {};
    for (const order of chartOrders) {
      const d = order.createdAt.toISOString().split("T")[0];
      if (!chartData[d]) chartData[d] = { revenue: 0, orders: 0 };
      chartData[d].revenue += order.amount;
      chartData[d].orders += 1;
    }

    const chart = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const d = date.toISOString().split("T")[0];
      chart.push({
        date: d,
        label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue: chartData[d]?.revenue || 0,
        orders: chartData[d]?.orders || 0,
      });
    }

    // Plan distribution
    const plans: Record<string, number> = {};
    for (const p of planDistribution) {
      plans[p.plan] = p._count;
    }

    const response = {
      success: true,
      data: {
        metrics: {
          totalUsers,
          totalProducts,
          totalOrders,
          completedOrders,
          todayOrders,
          totalLicenses,
          gmv: {
            thisMonth: Math.round((gmvThisMonth / 100) * 100) / 100,
            prevMonth: Math.round((gmvPrevMonth / 100) * 100) / 100,
            change: Math.round(gmvChange * 10) / 10,
            allTime: Math.round(((revenueData._sum.amount || 0) / 100) * 100) / 100,
          },
          platformFees: Math.round(((revenueData._sum.platformFee || 0) / 100) * 100) / 100,
          users: {
            newThisMonth: newUsersThisMonth,
            change: Math.round(userChange * 10) / 10,
          },
          plans,
        },
        recentOrders: recentOrders.map(o => ({
          id: o.id,
          amount: o.amount / 100,
          status: o.status,
          customerEmail: o.customerEmail,
          product: o.product.name,
          merchant: o.user.businessName || o.user.email,
          date: o.createdAt.toISOString(),
        })),
        topMerchants: topMerchants.map(m => {
          const info = merchantMap.get(m.userId);
          return {
            id: m.userId,
            name: info?.businessName || info?.name || info?.email || "Unknown",
            email: info?.email || "",
            revenue: Math.round(((m._sum.amount || 0) / 100) * 100) / 100,
            orders: m._count,
          };
        }),
        chart: chart.map(c => ({
          ...c,
          revenue: Math.round((c.revenue / 100) * 100) / 100,
        })),
      },
    };

    // Cache the response
    cachedData = response;
    cacheTime = Date.now();

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("[Admin Dashboard] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
