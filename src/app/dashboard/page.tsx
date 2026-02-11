"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, DollarSign, ShoppingCart, Package, TrendingUp, Loader2, AlertCircle } from "lucide-react";

interface DashboardData {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  conversionRate: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    conversionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const res = await fetch("/api/dashboard/stats");
        
        if (!mounted) return;

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const json = await res.json();
        
        if (json.success && json.data) {
          setData({
            totalRevenue: json.data.totalRevenue || 0,
            totalOrders: json.data.totalOrders || 0,
            totalProducts: json.data.totalProducts || 0,
            conversionRate: json.data.conversionRate || 0,
          });
          setError(null);
        } else {
          throw new Error(json.error || "Failed to load data");
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || "Network error");
          console.error("Dashboard error:", err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mx-auto" />
          <p className="mt-4 text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Dashboard Error</h2>
          <p className="text-slate-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  const stats = [
    { 
      label: "Revenue", 
      value: `$${data.totalRevenue.toFixed(2)}`, 
      icon: DollarSign, 
      color: "from-emerald-500 to-teal-600" 
    },
    { 
      label: "Orders", 
      value: data.totalOrders, 
      icon: ShoppingCart, 
      color: "from-indigo-500 to-blue-600" 
    },
    { 
      label: "Products", 
      value: data.totalProducts, 
      icon: Package, 
      color: "from-purple-500 to-violet-600" 
    },
    { 
      label: "Conversion", 
      value: `${data.conversionRate.toFixed(1)}%`, 
      icon: TrendingUp, 
      color: "from-amber-500 to-orange-600" 
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Welcome back! Here&apos;s your overview.</p>
        </div>
        <Link href="/dashboard/products/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Product
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item) => (
          <Card key={item.label}>
            <CardContent className="py-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-slate-400">{item.label}</p>
                  <p className="text-2xl font-bold text-white">{item.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                  <item.icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="py-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/dashboard/products" className="block">
                <div className="p-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors">
                  <p className="text-sm font-medium text-white">View All Products</p>
                  <p className="text-xs text-slate-400">Manage your product catalog</p>
                </div>
              </Link>
              <Link href="/dashboard/orders" className="block">
                <div className="p-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors">
                  <p className="text-sm font-medium text-white">View Orders</p>
                  <p className="text-xs text-slate-400">Track customer orders</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-6">
            <h3 className="text-lg font-semibold text-white mb-4">Get Started</h3>
            <div className="space-y-2 text-sm text-slate-300">
              <p>✓ Create your first product</p>
              <p>✓ Set up payment methods</p>
              <p>✓ Customize your checkout</p>
              <p>✓ Share your product links</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
