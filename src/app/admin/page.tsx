"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Users,
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
  TrendingDown,
  Key,
  Crown,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface AdminDashboard {
  metrics: {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    completedOrders: number;
    todayOrders: number;
    totalLicenses: number;
    gmv: { thisMonth: number; prevMonth: number; change: number; allTime: number };
    platformFees: number;
    users: { newThisMonth: number; change: number };
    plans: Record<string, number>;
  };
  recentOrders: Array<{
    id: string; amount: number; status: string;
    customerEmail: string; product: string; merchant: string; date: string;
  }>;
  topMerchants: Array<{
    id: string; name: string; email: string; revenue: number; orders: number;
  }>;
  chart: Array<{ date: string; label: string; revenue: number; orders: number }>;
}

export default function AdminPage() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then(res => res.json())
      .then(json => {
        if (json.success) setData(json.data);
        else setError(json.error);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  const m = data.metrics;
  const maxChartRevenue = Math.max(...data.chart.map(d => d.revenue), 1);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Crown className="h-6 w-6 text-amber-500" />
          Platform Overview
        </h1>
        <p className="text-sm text-slate-400 mt-1">Everything happening on EmbPay</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "GMV (30 days)", value: `$${m.gmv.thisMonth.toFixed(2)}`,
            change: m.gmv.change, icon: DollarSign,
            color: "from-emerald-500 to-teal-600",
            sub: `All-time: $${m.gmv.allTime.toFixed(2)}`
          },
          {
            label: "Total Users", value: m.totalUsers,
            change: m.users.change, icon: Users,
            color: "from-blue-500 to-indigo-600",
            sub: `${m.users.newThisMonth} new this month`
          },
          {
            label: "Orders", value: m.totalOrders,
            change: null, icon: ShoppingCart,
            color: "from-purple-500 to-violet-600",
            sub: `${m.todayOrders} today · ${m.completedOrders} completed`
          },
          {
            label: "License Keys", value: m.totalLicenses,
            change: null, icon: Key,
            color: "from-amber-500 to-orange-600",
            sub: `${m.totalProducts} total products`
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="py-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  {stat.change !== null && (
                    <div className="flex items-center gap-1 mt-1">
                      {stat.change >= 0 ? (
                        <TrendingUp className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-400" />
                      )}
                      <span className={`text-xs font-medium ${stat.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {stat.change >= 0 ? '+' : ''}{stat.change.toFixed(1)}%
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-slate-500 mt-1">{stat.sub}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plan Distribution */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { plan: "free", label: "Free", color: "text-slate-400", bg: "bg-slate-800" },
          { plan: "pro", label: "Pro ($29/mo)", color: "text-indigo-400", bg: "bg-indigo-500/10" },
          { plan: "scale", label: "Scale ($79/mo)", color: "text-amber-400", bg: "bg-amber-500/10" },
        ].map(p => (
          <div key={p.plan} className={`${p.bg} rounded-xl p-4 text-center border border-white/5`}>
            <p className={`text-3xl font-bold ${p.color}`}>{m.plans[p.plan] || 0}</p>
            <p className="text-xs text-slate-500 mt-1">{p.label} users</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="text-lg font-semibold text-white">GMV — Last 30 Days</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.chart.filter((_, i) => i % 3 === 0 || i === data.chart.length - 1).map(day => {
                const pct = maxChartRevenue > 0 ? (day.revenue / maxChartRevenue) * 100 : 0;
                return (
                  <div key={day.date} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">{day.label}</span>
                      <span className="text-white font-medium">
                        ${day.revenue.toFixed(2)}
                        <span className="text-slate-500 ml-1">({day.orders} orders)</span>
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Merchants */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white">Top Merchants</h3>
          </CardHeader>
          <CardContent>
            {data.topMerchants.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">No merchants yet</p>
            ) : (
              <div className="space-y-4">
                {data.topMerchants.map((merchant, i) => (
                  <div key={merchant.id} className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 0 ? 'bg-amber-500/20 text-amber-400' :
                      i === 1 ? 'bg-slate-500/20 text-slate-400' :
                      'bg-orange-500/20 text-orange-400'
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{merchant.name}</p>
                      <p className="text-xs text-slate-500">{merchant.orders} orders</p>
                    </div>
                    <p className="text-sm font-semibold text-emerald-400">
                      ${merchant.revenue.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 uppercase border-b border-white/5">
                  <th className="text-left py-3 px-2">Date</th>
                  <th className="text-left py-3 px-2">Customer</th>
                  <th className="text-left py-3 px-2">Product</th>
                  <th className="text-left py-3 px-2">Merchant</th>
                  <th className="text-right py-3 px-2">Amount</th>
                  <th className="text-center py-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map(order => (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="py-3 px-2 text-slate-400">
                      {new Date(order.date).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="py-3 px-2 text-white">{order.customerEmail}</td>
                    <td className="py-3 px-2 text-slate-300">{order.product}</td>
                    <td className="py-3 px-2 text-slate-400">{order.merchant}</td>
                    <td className="py-3 px-2 text-right font-semibold text-white">${order.amount.toFixed(2)}</td>
                    <td className="py-3 px-2 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                        order.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                        order.status === 'failed' ? 'bg-red-500/10 text-red-400' :
                        'bg-slate-500/10 text-slate-400'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
