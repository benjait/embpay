import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

// Simple test endpoint - no database queries
export async function GET(request: NextRequest) {
  console.log("[Dashboard Test] Called");
  
  try {
    const user = await getAuthUser(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("[Dashboard Test] User authenticated:", user.id);

    // Return mock data immediately - no DB queries
    return NextResponse.json({
      success: true,
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
    
  } catch (error: any) {
    console.error("[Dashboard Test] Error:", error);
    return NextResponse.json(
      { success: false, error: "Server error", message: error.message },
      { status: 500 }
    );
  }
}
