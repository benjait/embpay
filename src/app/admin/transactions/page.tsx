"use client";

import { useEffect, useState } from "react";
import { CreditCard, Search, Loader2, ChevronLeft, ChevronRight, DollarSign, Key } from "lucide-react";

interface Transaction {
  id: string; amount: number; currency: string; status: string;
  customerEmail: string; customerName: string | null;
  product: string; merchant: string; merchantEmail: string;
  licenseKey: string | null; licenseStatus: string | null;
  platformFee: number; stripePaymentId: string | null; createdAt: string;
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState({ totalRevenue: 0, todayRevenue: 0 });

  async function loadData() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "25" });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admin/transactions?${params}`);
      const json = await res.json();
      if (json.success) {
        setTransactions(json.data.transactions);
        setTotalPages(json.data.totalPages);
        setTotal(json.data.total);
        setSummary(json.data.summary);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, [page, statusFilter]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    loadData();
  }

  const statusColors: Record<string, string> = {
    completed: "bg-emerald-500/10 text-emerald-400",
    pending: "bg-amber-500/10 text-amber-400",
    failed: "bg-red-500/10 text-red-400",
    refunded: "bg-blue-500/10 text-blue-400",
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-purple-400" />
          All Transactions
        </h1>
        <p className="text-sm text-slate-400 mt-1">{total} total transactions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-emerald-400" />
            <div>
              <p className="text-xs text-slate-500 uppercase">All-Time Revenue</p>
              <p className="text-2xl font-bold text-emerald-400">${summary.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-amber-400" />
            <div>
              <p className="text-xs text-slate-500 uppercase">Today&apos;s Revenue</p>
              <p className="text-2xl font-bold text-amber-400">${summary.todayRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex gap-3 flex-wrap">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[250px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by email, name, or order ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-800 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>
          <button type="submit" className="px-4 py-2.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700">
            Search
          </button>
        </form>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 rounded-lg bg-slate-800 border border-white/10 text-sm text-white"
        >
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900 rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 uppercase border-b border-white/5">
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-2">Customer</th>
                <th className="text-left py-3 px-2">Product</th>
                <th className="text-left py-3 px-2">Merchant</th>
                <th className="text-right py-3 px-2">Amount</th>
                <th className="text-center py-3 px-2">Status</th>
                <th className="text-center py-3 px-2">License</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Loader2 className="h-6 w-6 text-amber-500 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No transactions found
                  </td>
                </tr>
              ) : transactions.map(tx => (
                <tr key={tx.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-3 px-4 text-slate-400 text-xs whitespace-nowrap">
                    {new Date(tx.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="py-3 px-2">
                    <p className="text-white text-xs">{tx.customerEmail}</p>
                    {tx.customerName && <p className="text-xs text-slate-500">{tx.customerName}</p>}
                  </td>
                  <td className="py-3 px-2 text-slate-300 text-xs">{tx.product}</td>
                  <td className="py-3 px-2 text-slate-400 text-xs">{tx.merchant}</td>
                  <td className="py-3 px-2 text-right font-semibold text-white">${tx.amount.toFixed(2)}</td>
                  <td className="py-3 px-2 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[tx.status] || 'bg-slate-500/10 text-slate-400'}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    {tx.licenseKey ? (
                      <span className="flex items-center justify-center gap-1 text-xs text-indigo-400" title={tx.licenseKey}>
                        <Key className="h-3 w-3" />
                        {tx.licenseKey.substring(0, 14)}...
                      </span>
                    ) : (
                      <span className="text-xs text-slate-600">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
            <p className="text-xs text-slate-500">Page {page} of {totalPages} · {total} transactions</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
