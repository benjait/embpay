"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from 'date-fns';
import { ShoppingCart, CheckCircle2, Clock, XCircle } from "lucide-react";

interface Order {
  id: string;
  customerEmail: string;
  productName: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  createdAt: Date;
}

interface RecentOrdersProps {
  orders: Order[];
}

export default function RecentOrders({ orders }: RecentOrdersProps) {
  const getStatusConfig = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return { 
          label: 'Completed', 
          icon: CheckCircle2, 
          className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
        };
      case 'pending':
        return { 
          label: 'Pending', 
          icon: Clock, 
          className: 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
        };
      case 'failed':
        return { 
          label: 'Failed', 
          icon: XCircle, 
          className: 'bg-red-500/10 text-red-500 border-red-500/20' 
        };
    }
  };

  return (
    <Card className="border-white/10 bg-slate-900/50 backdrop-blur-sm">
      <CardHeader className="border-b border-white/5 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Recent Orders
          </CardTitle>
          <span className="text-xs text-slate-400">{orders.length} total</span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
              <ShoppingCart className="h-8 w-8 text-slate-600" />
            </div>
            <p className="text-sm text-slate-400 text-center">No orders yet</p>
            <p className="text-xs text-slate-500 text-center mt-1">Orders will appear here when customers make purchases</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {orders.map((order, idx) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <div 
                  key={order.id} 
                  className="px-6 py-4 hover:bg-white/5 transition-colors group cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-white truncate group-hover:text-indigo-400 transition-colors">
                          {order.productName}
                        </p>
                        <Badge variant="outline" className={`${statusConfig.className} text-xs`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 truncate">{order.customerEmail}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-white">${order.amount.toFixed(2)}</p>
                      <p className="text-xs text-slate-500">#{order.id.slice(0, 8)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
