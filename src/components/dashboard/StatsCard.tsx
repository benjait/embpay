"use client";

import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  gradient: string;
  trend?: 'up' | 'down' | 'neutral';
}

export default function StatsCard({ title, value, change, icon: Icon, gradient, trend }: StatsCardProps) {
  const getTrendColor = () => {
    if (!trend || trend === 'neutral') return 'text-slate-400';
    return trend === 'up' ? 'text-emerald-500' : 'text-red-500';
  };

  const getTrendIcon = () => {
    if (!trend || trend === 'neutral') return '→';
    return trend === 'up' ? '↑' : '↓';
  };

  return (
    <Card className="border-white/10 bg-slate-900/50 backdrop-blur-sm hover:bg-slate-900/80 transition-all hover:shadow-xl hover:shadow-indigo-500/10 group">
      <CardContent className="py-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
              {change !== undefined && (
                <span className={`text-sm font-medium ${getTrendColor()} flex items-center gap-0.5`}>
                  <span className="text-xs">{getTrendIcon()}</span>
                  {Math.abs(change)}%
                </span>
              )}
            </div>
            {change !== undefined && (
              <p className="text-xs text-slate-500 mt-1">vs last period</p>
            )}
          </div>
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
            <Icon className="h-7 w-7 text-white" strokeWidth={2.5} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
