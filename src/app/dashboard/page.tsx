"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
  Plus,
  Code2,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ── Types ────────────────────────────────────────────────
interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  conversionRate: number;
  revenueChange: number;
  ordersChange: number;
  recentOrders: {
    id: string;
    customerEmail: string;
    customerName: string | null;
    productName: string;
    amount: number;
    status: string;
    createdAt: string;
  }[];
  chartData: {
    date: string;
    label: string;
    revenue: number;
  }[];
}

const statusVariant: Record<string, "success" | "warning" | "error" | "default"> = {
  completed: "success",
  pending: "warning",
  failed: "error",
  refunded: "default",
};

// ── Component ────────────────────────────────────────────
export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      console.log("[Dashboard] Fetching stats...");
      setError(null);
      
      // Add timeout - 15 seconds max
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log("[Dashboard] Request timeout!");
        controller.abort();
      }, 15000);
      
      const res = await fetch("/api/dashboard/stats", {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log("[Dashboard] Response status:", res.status);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log("[Dashboard] Response data:", data);
      
      if (data.success) {
        setStats(data.data);
        console.log("[Dashboard] Stats loaded successfully");
      } else {
        console.error("[Dashboard] API error:", data.error);
        setError(data.error || "API error");
        if (res.status === 401) {
          window.location.href = "/auth/login";
          return;
        }
      }
    } catch (err: any) {
      console.error("[Dashboard] Fetch error:", err);
      setError(err.name === 'AbortError' ? 'Request timeout (15s)' : err.message);
    } finally {
      setLoading(false);
      setTimeout(() => setMounted(true), 50);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatShortCurrency = (cents: number) => {
    if (cents >= 100000) return `$${(cents / 100000).toFixed(1)}k`;
    if (cents >= 10000) return `$${(cents / 10000).toFixed(0)}0`;
    return `$${(cents / 100).toFixed(0)}`;
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="h-7 w-36 bg-white/[0.06] rounded-lg animate-pulse" />
            <div className="h-4 w-72 bg-white/[0.04] rounded-lg animate-pulse mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="py-5">
                <div className="space-y-3">
                  <div className="h-4 w-24 bg-white/[0.06] rounded animate-pulse" />
                  <div className="h-7 w-32 bg-white/[0.08] rounded animate-pulse" />
                  <div className="h-3 w-20 bg-white/[0.04] rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
          {error && (
            <p className="mt-4 text-sm text-red-400">Error: {error}</p>
          )}
        </div>
      </div>
    );
  }

  // Use real data or defaults for empty state
  const totalRevenue = stats?.totalRevenue ?? 0;
  const totalOrders = stats?.totalOrders ?? 0;
  const totalProducts = stats?.totalProducts ?? 0;
  const conversionRate = stats?.conversionRate ?? 0;
  const revenueChange = stats?.revenueChange ?? 0;
  const ordersChange = stats?.ordersChange ?? 0;
  const recentOrders = stats?.recentOrders ?? [];
  const chartData = stats?.chartData ?? [];

  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 1);

  const statCards = [
    {
      label: "Total Revenue",
      value: formatCurrency(totalRevenue),
      change: `${revenueChange >= 0 ? "+" : ""}${revenueChange}%`,
      up: revenueChange >= 0,
      icon: DollarSign,
      gradient: "from-emerald-500 to-teal-600",
      glow: "shadow-emerald-500/20",
    },
    {
      label: "Orders",
      value: totalOrders.toLocaleString(),
      change: `${ordersChange >= 0 ? "+" : ""}${ordersChange}%`,
      up: ordersChange >= 0,
      icon: ShoppingCart,
      gradient: "from-indigo-500 to-blue-600",
      glow: "shadow-indigo-500/20",
    },
    {
      label: "Products",
      value: totalProducts.toString(),
      change: `${totalProducts} total`,
      up: true,
      icon: Package,
      gradient: "from-purple-500 to-violet-600",
      glow: "shadow-purple-500/20",
      hideArrow: true,
    },
    {
      label: "Conversion Rate",
      value: `${conversionRate}%`,
      change: `${totalOrders} orders`,
      up: conversionRate > 0,
      icon: TrendingUp,
      gradient: "from-amber-500 to-orange-600",
      glow: "shadow-amber-500/20",
      hideArrow: true,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-400 mt-1">
            Welcome back. Here&apos;s what&apos;s happening with your store.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/products/new">
            <Button size="md">
              <Plus className="h-4 w-4" />
              New Product
            </Button>
          </Link>
          <Link href="/dashboard/embed">
            <Button variant="outline" size="md">
              <Code2 className="h-4 w-4" />
              Embed Code
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className={`group hover:border-white/[0.1] transition-all duration-500 ${
                mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: `${i * 75}ms` }}
            >
              <CardContent className="py-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-slate-400 font-medium">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-white tracking-tight">
                      {stat.value}
                    </p>
                    <div className="flex items-center gap-1.5">
                      {!stat.hideArrow &&
                        (stat.up ? (
                          <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <ArrowDownRight className="h-3.5 w-3.5 text-red-400" />
                        ))}
                      <span
                        className={`text-xs font-medium ${
                          stat.hideArrow
                            ? "text-slate-500"
                            : stat.up
                              ? "text-emerald-400"
                              : "text-red-400"
                        }`}
                      >
                        {stat.change}
                      </span>
                      {!stat.hideArrow && (
                        <span className="text-xs text-slate-500">
                          vs last month
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg ${stat.glow} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Revenue Chart + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Revenue</h2>
                <p className="text-sm text-slate-400">Last 7 days</p>
              </div>
              {revenueChange !== 0 && (
                <Badge variant={revenueChange >= 0 ? "success" : "error"}>
                  {revenueChange >= 0 ? "+" : ""}
                  {revenueChange}%
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 && maxRevenue > 0 ? (
              <div className="flex items-end justify-between gap-2 h-48">
                {chartData.map((d, i) => {
                  const height = (d.revenue / maxRevenue) * 100;
                  return (
                    <div
                      key={d.date}
                      className="flex-1 flex flex-col items-center gap-2"
                    >
                      <span className="text-xs text-slate-400 font-medium">
                        {d.revenue > 0 ? formatShortCurrency(d.revenue) : "—"}
                      </span>
                      <div
                        className="w-full relative"
                        style={{ height: "140px" }}
                      >
                        <div
                          className="absolute bottom-0 w-full rounded-t-md bg-gradient-to-t from-indigo-600/80 to-indigo-400/80 transition-all duration-700 hover:from-indigo-500 hover:to-indigo-300"
                          style={{
                            height: mounted
                              ? `${Math.max(height, d.revenue > 0 ? 4 : 0)}%`
                              : "0%",
                            transitionDelay: `${i * 80 + 200}ms`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-slate-500">{d.label}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                <DollarSign className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No revenue data yet</p>
                <p className="text-xs mt-1">
                  Revenue will appear here as orders come in
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-400" />
              <h2 className="text-lg font-semibold text-white">
                Quick Actions
              </h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              {
                href: "/dashboard/products/new",
                icon: Plus,
                color: "indigo",
                title: "Create Product",
                desc: "Add a new product to sell",
              },
              {
                href: "/dashboard/embed",
                icon: Code2,
                color: "purple",
                title: "Get Embed Code",
                desc: "Embed checkout on your site",
              },
              {
                href: "/dashboard/orders",
                icon: ShoppingCart,
                color: "emerald",
                title: "View Orders",
                desc: "Manage customer orders",
              },
              {
                href: "/dashboard/settings",
                icon: TrendingUp,
                color: "amber",
                title: "Connect Stripe",
                desc: "Start accepting payments",
              },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href} className="block">
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-white/[0.04] hover:bg-white/[0.03] hover:border-indigo-500/20 transition-all duration-200 group">
                    <div
                      className={`w-10 h-10 rounded-lg bg-${action.color}-500/10 flex items-center justify-center`}
                    >
                      <Icon
                        className={`h-5 w-5 text-${action.color}-400`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors">
                        {action.title}
                      </p>
                      <p className="text-xs text-slate-500">{action.desc}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Recent Orders
              </h2>
              <p className="text-sm text-slate-400">
                Latest transactions across all products
              </p>
            </div>
            <Link href="/dashboard/orders">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                    Order
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                    Customer
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">
                    Product
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                    Amount
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3 hidden md:table-cell">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-mono text-indigo-400">
                      {order.id.slice(0, 12)}…
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {order.customerName || "—"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {order.customerEmail}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300 hidden sm:table-cell">
                      {order.productName}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-white">
                      {formatCurrency(order.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={statusVariant[order.status] || "default"}
                      >
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 hidden md:table-cell">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <ShoppingCart className="h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm font-medium">No orders yet</p>
              <p className="text-xs mt-1">
                Orders will appear here once customers make purchases
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
