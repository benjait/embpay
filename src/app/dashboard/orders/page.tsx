"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  RotateCcw,
  ShoppingCart,
  Download,
  Loader2,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";

// ── Types ────────────────────────────────────────────────
interface Order {
  id: string;
  amount: number;
  currency: string;
  status: string;
  customerEmail: string;
  customerName: string | null;
  stripePaymentId: string | null;
  stripePaymentIntentId: string | null;
  stripeSessionId: string | null;
  includedBump: boolean;
  platformFee: number;
  createdAt: string;
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string | null;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const statusVariant: Record<string, "success" | "warning" | "error" | "default"> = {
  completed: "success",
  pending: "warning",
  failed: "error",
  refunded: "default",
};

const ITEMS_PER_PAGE = 10;

// ── Component ────────────────────────────────────────────
export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      });

      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }
      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      }

      const res = await fetch(`/api/orders?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.data.orders);
        setPagination(data.data.pagination);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, debouncedSearch]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const formatAmount = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (iso: string) => {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Calculate summary stats from current view
  const completedOrders = orders.filter((o) => o.status === "completed");
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.amount, 0);
  const pendingCount = orders.filter((o) => o.status === "pending").length;

  const handleExport = () => {
    // Generate CSV from current orders
    const headers = ["Order ID", "Date", "Customer", "Email", "Product", "Amount", "Status"];
    const rows = orders.map((o) => [
      o.id,
      formatDate(o.createdAt),
      o.customerName || "",
      o.customerEmail,
      o.product.name,
      formatAmount(o.amount),
      o.status,
    ]);
    
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `embpay-orders-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Orders
          </h1>
          <p className="text-slate-400 mt-1">
            Track and manage all customer orders
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-6 text-right">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">
                Revenue
              </p>
              <p className="text-lg font-bold text-emerald-400">
                {formatAmount(totalRevenue)}
              </p>
            </div>
            <div className="hidden sm:block">
              <p className="text-xs text-slate-500 uppercase tracking-wider">
                Total
              </p>
              <p className="text-lg font-bold text-white">{pagination.total}</p>
            </div>
            <div className="hidden sm:block">
              <p className="text-xs text-slate-500 uppercase tracking-wider">
                Pending
              </p>
              <p className="text-lg font-bold text-amber-400">
                {pendingCount}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by email, customer name, or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/30 transition-all"
          />
        </div>
        <div className="flex rounded-lg border border-white/[0.08] overflow-hidden">
          {(["all", "completed", "pending", "failed", "refunded"] as const).map(
            (f) => (
              <button
                key={f}
                onClick={() => {
                  setStatusFilter(f);
                  setPage(1);
                }}
                className={`px-3 py-2.5 text-xs font-medium capitalize transition-all duration-200 ${
                  statusFilter === f
                    ? "bg-indigo-600 text-white"
                    : "bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {f}
              </button>
            )
          )}
        </div>
      </div>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-5">
              <ShoppingCart className="h-8 w-8 text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No orders found
            </h3>
            <p className="text-slate-400 max-w-sm mx-auto">
              {search || statusFilter !== "all"
                ? "Try a different search term or adjust your filters"
                : "Orders will appear here once customers make purchases"}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                      Order
                    </th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">
                      Date
                    </th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                      Customer
                    </th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3 hidden md:table-cell">
                      Product
                    </th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                      Amount
                    </th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                      Status
                    </th>
                    <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-mono text-indigo-400">
                        {order.id.slice(0, 12)}…
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400 hidden sm:table-cell">
                        {formatDate(order.createdAt)}
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
                      <td className="px-6 py-4 text-sm text-slate-300 hidden md:table-cell">
                        {order.product.name}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-white">
                        {formatAmount(order.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={statusVariant[order.status] || "default"}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewOrder(order)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {order.status === "failed" && (
                            <button
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-white/[0.06] transition-colors"
                              title="Retry"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.06]">
                <p className="text-sm text-slate-500">
                  Showing{" "}
                  <span className="text-slate-300 font-medium">
                    {(page - 1) * ITEMS_PER_PAGE + 1}
                  </span>{" "}
                  to{" "}
                  <span className="text-slate-300 font-medium">
                    {Math.min(page * ITEMS_PER_PAGE, pagination.total)}
                  </span>{" "}
                  of{" "}
                  <span className="text-slate-300 font-medium">
                    {pagination.total}
                  </span>{" "}
                  results
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from(
                    { length: Math.min(pagination.totalPages, 5) },
                    (_, i) => {
                      // Show pages around current page
                      let pageNum: number;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      return pageNum;
                    }
                  ).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 ${
                        page === p
                          ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/30"
                          : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPage((p) => Math.min(pagination.totalPages, p + 1))
                    }
                    disabled={page === pagination.totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Order Detail Modal */}
      <Modal
        open={!!viewOrder}
        onClose={() => setViewOrder(null)}
        title="Order Details"
      >
        {viewOrder && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                <p className="text-xs text-slate-500 uppercase tracking-wider">
                  Order ID
                </p>
                <p className="text-sm font-mono text-indigo-400 mt-1 break-all">
                  {viewOrder.id}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                <p className="text-xs text-slate-500 uppercase tracking-wider">
                  Date
                </p>
                <p className="text-sm text-white mt-1">
                  {formatDateTime(viewOrder.createdAt)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                <p className="text-xs text-slate-500 uppercase tracking-wider">
                  Customer
                </p>
                <p className="text-sm text-white mt-1">
                  {viewOrder.customerName || "—"}
                </p>
                <p className="text-xs text-slate-500">
                  {viewOrder.customerEmail}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                <p className="text-xs text-slate-500 uppercase tracking-wider">
                  Product
                </p>
                <p className="text-sm text-white mt-1">
                  {viewOrder.product.name}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                <p className="text-xs text-slate-500 uppercase tracking-wider">
                  Amount
                </p>
                <p className="text-lg font-bold text-white mt-1">
                  {formatAmount(viewOrder.amount)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                <p className="text-xs text-slate-500 uppercase tracking-wider">
                  Status
                </p>
                <div className="mt-1.5">
                  <Badge variant={statusVariant[viewOrder.status] || "default"}>
                    {viewOrder.status}
                  </Badge>
                </div>
              </div>
            </div>
            {(viewOrder.stripePaymentIntentId || viewOrder.stripeSessionId) && (
              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                <p className="text-xs text-slate-500 uppercase tracking-wider">
                  Stripe Payment ID
                </p>
                <p className="text-sm font-mono text-slate-400 mt-1 break-all">
                  {viewOrder.stripePaymentIntentId ||
                    viewOrder.stripeSessionId ||
                    "—"}
                </p>
              </div>
            )}
            {viewOrder.platformFee > 0 && (
              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                <p className="text-xs text-slate-500 uppercase tracking-wider">
                  Platform Fee
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  {formatAmount(viewOrder.platformFee)}
                </p>
              </div>
            )}
            <div className="flex justify-end pt-2">
              <Button variant="ghost" onClick={() => setViewOrder(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
