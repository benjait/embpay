"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, DollarSign, ShoppingCart, Package, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    conversionRate: 0,
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/simple")
      .then(r => r.json())
      .then(d => {
        if (d.success) setData(d.data);
      })
      .catch(console.error)
      .finally(() => setLoaded(true));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <Link href="/dashboard/products/new">
          <Button><Plus className="h-4 w-4 mr-2" />New Product</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Revenue", value: `$${data.totalRevenue}`, icon: DollarSign, color: "from-emerald-500 to-teal-600" },
          { label: "Orders", value: data.totalOrders, icon: ShoppingCart, color: "from-indigo-500 to-blue-600" },
          { label: "Products", value: data.totalProducts, icon: Package, color: "from-purple-500 to-violet-600" },
          { label: "Conversion", value: `${data.conversionRate}%`, icon: TrendingUp, color: "from-amber-500 to-orange-600" },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="py-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-slate-400">{item.label}</p>
                  <p className="text-2xl font-bold text-white">{loaded ? item.value : "-"}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                  <item.icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
