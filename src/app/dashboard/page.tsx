"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, DollarSign, ShoppingCart, Package, TrendingUp, AlertCircle } from "lucide-react";

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
        // Ensure minimum loading time for smooth transition (optional, but feels better)
        const start = Date.now();
        const res = await fetch("/api/dashboard/stats");
        
        if (!mounted) return;

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const json = await res.json();
        
        // Calculate remaining time to ensure at least 500ms skeleton (prevents flicker)
        const elapsed = Date.now() - start;
        if (elapsed < 500) await new Promise(r => setTimeout(r, 500 - elapsed));

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
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="py-5">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                  <Skeleton className="h-10 w-10 rounded-xl" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="py-6 space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-2">
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
            </CardContent>
          </Card>
          <Card>
             <CardContent className="py-6 space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </CardContent>
          </Card>
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
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white">
            <Plus className="h-4 w-4 mr-2" />
            New Product
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item) => (
          <Card key={item.label} className="border-white/10 bg-slate-900/50 backdrop-blur-sm hover:bg-slate-900/80 transition-colors">
            <CardContent className="py-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-slate-400">{item.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{item.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                  <item.icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-white/10 bg-slate-900/50">
          <CardContent className="py-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/dashboard/products" className="block group">
                <div className="p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all group-hover:border-indigo-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">View All Products</p>
                      <p className="text-xs text-slate-400">Manage your product catalog</p>
                    </div>
                    <Package className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                  </div>
                </div>
              </Link>
              <Link href="/dashboard/orders" className="block group">
                <div className="p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all group-hover:border-indigo-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">View Orders</p>
                      <p className="text-xs text-slate-400">Track customer orders</p>
                    </div>
                    <ShoppingCart className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                  </div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-900/50">
          <CardContent className="py-6">
            <h3 className="text-lg font-semibold text-white mb-4">Get Started</h3>
            <div className="space-y-3">
              {[
                { label: "Create your first product", done: data.totalProducts > 0 },
                { label: "Set up payment methods", done: true }, // Assuming done for now
                { label: "Customize your checkout", done: true },
                { label: "Share your product links", done: data.totalOrders > 0 }
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${step.done ? 'border-emerald-500 bg-emerald-500/20 text-emerald-500' : 'border-slate-600 bg-slate-800 text-slate-400'}`}>
                    {step.done && <TrendingUp className="h-3 w-3" />}
                  </div>
                  <span className={step.done ? "text-slate-300 line-through decoration-slate-600" : "text-slate-300"}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
