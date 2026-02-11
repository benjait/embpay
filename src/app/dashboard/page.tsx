"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
  Plus,
  Code2,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  conversionRate: number;
  revenueChange: number;
  ordersChange: number;
  recentOrders: any[];
  chartData: any[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/dashboard/simple");
        const data = await res.json();
        
        if (data.success) {
          setStats(data.data);
        } else {
          setError(data.error || "Failed to load");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  const formatCurrency = (val: number) => `$${val.toFixed(2)}`;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400">Welcome back! Here&apos;s your overview.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/products/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Revenue</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(stats?.totalRevenue || 0)}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">Orders</p>
                <p className="text-2xl font-bold text-white">{stats?.totalOrders || 0}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">Products</p>
                <p className="text-2xl font-bold text-white">{stats?.totalProducts || 0}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">Conversion</p>
                <p className="text-2xl font-bold text-white">{stats?.conversionRate || 0}%</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { href: "/dashboard/products/new", title: "Create Product", desc: "Add a new product" },
            { href: "/dashboard/embed", title: "Get Embed Code", desc: "Embed on your site" },
            { href: "/dashboard/orders", title: "View Orders", desc: "Manage orders" },
          ].map((action) => (
            <Link key={action.href} href={action.href} className="block">
              <div className="flex items-center gap-3 p-3 rounded-lg border border-white/[0.04] hover:bg-white/[0.03] transition-all">
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{action.title}</p>
                  <p className="text-xs text-slate-500">{action.desc}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-600" />
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
