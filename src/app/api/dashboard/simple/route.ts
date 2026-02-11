import { NextRequest, NextResponse } from "next/server";

// Ultra simple test - no auth, no database
export async function GET(request: NextRequest) {
  console.log("[Simple Test] Called");
  
  // Return data immediately
  return NextResponse.json({
    success: true,
    message: "API is working!",
    timestamp: new Date().toISOString(),
    data: {
      totalRevenue: 0,
      totalOrders: 0,
      totalProducts: 0,
      conversionRate: 0,
      revenueChange: 0,
      ordersChange: 0,
      recentOrders: [],
      chartData: [
        { date: "2024-01-01", label: "Mon", revenue: 0 },
        { date: "2024-01-02", label: "Tue", revenue: 0 },
        { date: "2024-01-03", label: "Wed", revenue: 0 },
        { date: "2024-01-04", label: "Thu", revenue: 0 },
        { date: "2024-01-05", label: "Fri", revenue: 0 },
        { date: "2024-01-06", label: "Sat", revenue: 0 },
        { date: "2024-01-07", label: "Sun", revenue: 0 },
      ],
    },
  });
}
