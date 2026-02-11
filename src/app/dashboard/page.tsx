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

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/simple", {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4">
        <Card><CardContent className="py-4"><p className="text-slate-400">Revenue</p><p className="text-xl font-bold text-white">${stats?.totalRevenue || 0}</p></CardContent></Card>
        <Card><CardContent className="py-4"><p className="text-slate-400">Orders</p><p className="text-xl font-bold text-white">{stats?.totalOrders || 0}</p></CardContent></Card>
        <Card><CardContent className="py-4"><p className="text-slate-400">Products</p><p className="text-xl font-bold text-white">{stats?.totalProducts || 0}</p></CardContent></Card>
        <Card><CardContent className="py-4"><p className="text-slate-400">Conversion</p><p className="text-xl font-bold text-white">{stats?.conversionRate || 0}%</p></CardContent></Card>
      </div>
    </div>
  );
}
