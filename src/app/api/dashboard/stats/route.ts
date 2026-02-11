import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getAuthUser } from "@/lib/auth";

// Initialize Prisma Client
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  console.log("Dashboard stats API called");
  
  try {
    const user = await getAuthUser(request);
    console.log("Auth user:", user?.id || "null");
    
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

    // Initialize all variables with defaults
    let totalProducts = 0;
    let totalOrders = 0;
    let completedOrders = 0;
    let completedOrdersPrevMonth = 0;
    let allCompletedOrders: any[] = [];
    let recentOrders: any[] = [];
    let last7DaysOrders: any[] = [];

    // Query 1: Total products
    try {
      totalProducts = await prisma.product.count({
        where: { userId: user.id },
      });
      console.log("Products count:", totalProducts);
    } catch (e: any) {
      console.error("Products query error:", e.message);
    }

    // Query 2: Total orders
    try {
      totalOrders = await prisma.order.count({
        where: { userId: user.id },
      });
      console.log("Orders count:", totalOrders);
    } catch (e: any) {
      console.error("Orders query error:", e.message);
    }

    // Query 3: Completed orders this month
    try {
      completedOrders = await prisma.order.count({
        where: {
          userId: user.id,
          status: "completed",
          createdAt: { gte: thirtyDaysAgo },
        },
      });
    } catch (e: any) {
      console.error("Completed orders error:", e.message);
    }

    // Query 4: Completed orders prev month
    try {
      completedOrdersPrevMonth = await prisma.order.count({
        where: {
          userId: user.id,
          status: "completed",
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
      });
    } catch (e: any) {
      console.error("Prev month orders error:", e.message);
    }

    // Query 5: All completed orders for revenue
    try {
      allCompletedOrders = await prisma.order.findMany({
        where: {
          userId: user.id,
          status: "completed",
        },
        select: { 
          amount: true, 
          createdAt: true 
        },
      });
      console.log("Completed orders fetched:", allCompletedOrders.length);
    } catch (e: any) {
      console.error("All completed orders error:", e.message);
    }

    // Query 6: Recent orders
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
      console.log("Recent orders fetched:", recentOrders.length);
    } catch (e: any) {
      console.error("Recent orders error:", e.message);
    }

    // Query 7: Last 7 days orders
    try {
      last7DaysOrders = await prisma.order.findMany({
        where: {
          userId: user.id,
          status: "completed",
          createdAt: { gte: sevenDaysAgo },
        },
        select: { 
          amount: true, 
          createdAt: true 
        },
      });
    } catch (e: any) {
      console.error("Last 7 days orders error:", e.message);
    }

    // Calculate metrics
    const totalRevenue = allCompletedOrders.reduce(
      (sum, o) => sum + (o?.amount || 0),
      0
    );

    const revenueThisMonth = allCompletedOrders
      .filter((o) => o?.createdAt >= thirtyDaysAgo)
      .reduce((sum, o) => sum + (o?.amount || 0), 0);

    const revenuePrevMonth = allCompletedOrders
      .filter((o) => o?.createdAt >= sixtyDaysAgo && o?.createdAt < thirtyDaysAgo)
      .reduce((sum, o) => sum + (o?.amount || 0), 0);

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
        .filter((o) => o?.createdAt?.toISOString().split("T")[0] === dateStr)
        .reduce((sum, o) => sum + (o?.amount || 0), 0);

      chartData.push({ date: dateStr, label: dayLabel, revenue: dayRevenue });
    }

    const response = {
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
          customerEmail: o.customerEmail || "",
          customerName: o.customerName || null,
          productName: o.product?.name || "Unknown",
          amount: o.amount || 0,
          status: o.status || "pending",
          createdAt: o.createdAt?.toISOString() || new Date().toISOString(),
        })),
        chartData,
      },
    };
    
    console.log("Dashboard response ready");
    return NextResponse.json(response);
    
  } catch (error: any) {
    console.error("Dashboard stats critical error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Dashboard error occurred",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
