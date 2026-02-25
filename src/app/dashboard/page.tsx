"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Plus, DollarSign, ShoppingCart, Package, TrendingUp, 
  AlertCircle, Users, CreditCard, BarChart3 
} from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import RecentOrders from "@/components/dashboard/RecentOrders";

interface DashboardData {
  stats: {
    totalRevenue: number;
    revenueChange: number;
    totalOrders: number;
    ordersChange: number;
    totalProducts: number;
    productsChange: number;
    conversionRate: number;
    conversionChange: number;
  };
  revenueData: Array<{ date: string; revenue: number; orders: number }>;
  recentOrders: Array<{
    id: string;
    customerEmail: string;
    productName: string;
    amount: number;
    status: 'completed' | 'pending' | 'failed';
    createdAt: Date;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const start = Date.now();
        
        const res = await fetch(`/api/dashboard/stats?range=${timeRange}`);
        
        if (!mounted) return;

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const json = await res.json();
        
        // Ensure minimum loading time for smooth UX
        const elapsed = Date.now() - start;
        if (elapsed < 500) await new Promise(r => setTimeout(r, 500 - elapsed));

        if (json.success && json.data) {
          setData(json.data);
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
  }, [timeRange]);

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>

        <Skeleton className="h-[400px] rounded-xl" />
        
        <Skeleton className="h-[400px] rounded-xl" />
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

  if (!data) {
    return null;
  }

  const stats = [
    { 
      title: "Total Revenue", 
      value: `$${data.stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: data.stats.revenueChange,
      trend: data.stats.revenueChange > 0 ? 'up' : data.stats.revenueChange < 0 ? 'down' : 'neutral',
      icon: DollarSign, 
      gradient: "from-emerald-500 to-teal-600" 
    },
    { 
      title: "Total Orders", 
      value: data.stats.totalOrders.toLocaleString(),
      change: data.stats.ordersChange,
      trend: data.stats.ordersChange > 0 ? 'up' : data.stats.ordersChange < 0 ? 'down' : 'neutral',
      icon: ShoppingCart, 
      gradient: "from-indigo-500 to-blue-600" 
    },
    { 
      title: "Products", 
      value: data.stats.totalProducts,
      change: data.stats.productsChange,
      trend: data.stats.productsChange > 0 ? 'up' : data.stats.productsChange < 0 ? 'down' : 'neutral',
      icon: Package, 
      gradient: "from-purple-500 to-violet-600" 
    },
    { 
      title: "Conversion Rate", 
      value: `${data.stats.conversionRate.toFixed(1)}%`,
      change: data.stats.conversionChange,
      trend: data.stats.conversionChange > 0 ? 'up' : data.stats.conversionChange < 0 ? 'down' : 'neutral',
      icon: TrendingUp, 
      gradient: "from-amber-500 to-orange-600" 
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">
            Welcome back! Here&apos;s your performance overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-900/50 border border-white/10 rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  timeRange === range 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
          <Link href="/dashboard/products/new">
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20">
              <Plus className="h-4 w-4 mr-2" />
              New Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Revenue Chart */}
      <RevenueChart data={data.revenueData} timeRange={timeRange} />

      {/* Recent Orders */}
      <RecentOrders orders={data.recentOrders} />
    </div>
  );
}
