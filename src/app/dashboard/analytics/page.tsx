"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Calendar,
  Loader2,
  AlertCircle,
  TrendingDown,
} from "lucide-react";

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  revenueChange: number;
  ordersChange: number;
  avgOrderValue: number;
  conversionRate: number;
  chartData: Array<{ date: string; label: string; revenue: number; orders: number }>;
  topProducts: Array<{ name: string; orders: number; revenue: number }>;
  recentActivity: Array<{ date: string; event: string; amount?: number }>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("7d");

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  async function loadAnalytics() {
    try {
      setLoading(true);
      const res = await fetch(`/api/analytics?range=${timeRange}`);
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const json = await res.json();
      
      if (json.success && json.data) {
        setData(json.data);
        setError(null);
      } else {
        throw new Error(json.error || "Failed to load analytics");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
      console.error("Analytics error:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mx-auto" />
          <p className="mt-4 text-slate-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Analytics Error</h2>
          <p className="text-slate-400 mb-4">{error}</p>
          <button 
            onClick={loadAnalytics}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const maxRevenue = Math.max(...data.chartData.map((d) => d.revenue), 1);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-sm text-slate-400 mt-1">Performance insights and trends</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex gap-2 bg-slate-800/50 p-1 rounded-lg border border-white/10">
          {[
            { key: "7d", label: "7 Days" },
            { key: "30d", label: "30 Days" },
            { key: "90d", label: "90 Days" },
          ].map((range) => (
            <button
              key={range.key}
              onClick={() => setTimeRange(range.key as typeof timeRange)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                timeRange === range.key
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-400">Total Revenue</p>
                <p className="text-2xl font-bold text-white mt-1">
                  ${data.totalRevenue.toFixed(2)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  {data.revenueChange >= 0 ? (
                    <>
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-xs text-emerald-400 font-medium">
                        +{data.revenueChange.toFixed(1)}%
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-3.5 w-3.5 text-red-400" />
                      <span className="text-xs text-red-400 font-medium">
                        {data.revenueChange.toFixed(1)}%
                      </span>
                    </>
                  )}
                  <span className="text-xs text-slate-500">vs previous period</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-400">Total Orders</p>
                <p className="text-2xl font-bold text-white mt-1">{data.totalOrders}</p>
                <div className="flex items-center gap-1 mt-2">
                  {data.ordersChange >= 0 ? (
                    <>
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-xs text-emerald-400 font-medium">
                        +{data.ordersChange.toFixed(1)}%
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-3.5 w-3.5 text-red-400" />
                      <span className="text-xs text-red-400 font-medium">
                        {data.ordersChange.toFixed(1)}%
                      </span>
                    </>
                  )}
                  <span className="text-xs text-slate-500">vs previous period</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-400">Avg Order Value</p>
                <p className="text-2xl font-bold text-white mt-1">
                  ${data.avgOrderValue.toFixed(2)}
                </p>
                <p className="text-xs text-slate-500 mt-2">per transaction</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-400">Conversion Rate</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {data.conversionRate.toFixed(1)}%
                </p>
                <p className="text-xs text-slate-500 mt-2">completed / total</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-400" />
              <h3 className="text-lg font-semibold text-white">Revenue Over Time</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.chartData.map((day) => {
                const percentage = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
                return (
                  <div key={day.date} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400 font-medium">{day.label}</span>
                      <span className="text-white font-semibold">
                        ${day.revenue.toFixed(2)}
                        <span className="text-slate-500 text-xs ml-2">
                          ({day.orders} orders)
                        </span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white">Top Products</h3>
          </CardHeader>
          <CardContent>
            {data.topProducts.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">No sales yet</p>
            ) : (
              <div className="space-y-4">
                {data.topProducts.map((product, idx) => (
                  <div key={idx} className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-slate-500">{product.orders} orders</p>
                    </div>
                    <p className="text-sm font-semibold text-emerald-400 ml-3">
                      ${product.revenue.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
