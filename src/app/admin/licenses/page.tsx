"use client";

import { useEffect, useState } from "react";
import {
  Key, Search, Loader2, ChevronLeft, ChevronRight,
  Ban, XCircle, CheckCircle, AlertTriangle, Clock
} from "lucide-react";

interface License {
  id: string;
  key: string;
  customerEmail: string;
  customerName: string | null;
  product: string;
  merchant: string;
  status: string;
  currentActivations: number;
  maxActivations: number;
  expiresAt: string | null;
  createdAt: string;
  revokedReason: string | null;
}

export default function AdminLicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function loadLicenses() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "25" });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admin/licenses?${params}`);
      const json = await res.json();
      if (json.success) {
        setLicenses(json.data.licenses);
        setTotalPages(json.data.totalPages);
        setTotal(json.data.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadLicenses(); }, [page, statusFilter]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    loadLicenses();
  }

  async function licenseAction(licenseId: string, action: string, reason?: string) {
    setActionLoading(licenseId);
    try {
      await fetch("/api/admin/licenses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseId, action, reason }),
      });
      await loadLicenses();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  }

  const statusColors: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-400",
    expired: "bg-amber-500/10 text-amber-400",
    revoked: "bg-red-500/10 text-red-400",
    suspended: "bg-orange-500/10 text-orange-400",
  };

  const statusIcons: Record<string, any> = {
    active: CheckCircle,
    expired: Clock,
    revoked: XCircle,
    suspended: AlertTriangle,
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Key className="h-6 w-6 text-amber-400" />
          License Key Management
        </h1>
        <p className="text-sm text-slate-400 mt-1">{total} total license keys</p>
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
              placeholder="Search by key, email, or product..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-800 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>
          <button type="submit" className="px-4 py-2.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors">
            Search
          </button>
        </form>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 rounded-lg bg-slate-800 border border-white/10 text-sm text-white"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="suspended">Suspended</option>
          <option value="revoked">Revoked</option>
        </select>
      </div>

      {/* Licenses Table */}
      <div className="bg-slate-900 rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 uppercase border-b border-white/5">
                <th className="text-left py-3 px-4">License Key</th>
                <th className="text-left py-3 px-2">Customer</th>
                <th className="text-left py-3 px-2">Product</th>
                <th className="text-left py-3 px-2">Merchant</th>
                <th className="text-center py-3 px-2">Status</th>
                <th className="text-center py-3 px-2">Activations</th>
                <th className="text-left py-3 px-2">Expires</th>
                <th className="text-left py-3 px-2">Created</th>
                <th className="text-center py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <Loader2 className="h-6 w-6 text-amber-500 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : licenses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No licenses found
                  </td>
                </tr>
              ) : licenses.map(license => {
                const StatusIcon = statusIcons[license.status] || Key;
                return (
                  <tr key={license.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-amber-400 flex-shrink-0" />
                        <code className="text-xs text-white font-mono bg-slate-800/50 px-2 py-1 rounded">
                          {license.key}
                        </code>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <p className="text-white text-xs">{license.customerEmail}</p>
                      {license.customerName && <p className="text-xs text-slate-500">{license.customerName}</p>}
                    </td>
                    <td className="py-3 px-2 text-slate-300 text-xs">{license.product}</td>
                    <td className="py-3 px-2 text-slate-400 text-xs">{license.merchant}</td>
                    <td className="py-3 px-2 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[license.status] || 'bg-slate-500/10 text-slate-400'}`}>
                        <StatusIcon className="h-3 w-3" />
                        {license.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={`text-xs ${license.currentActivations >= license.maxActivations ? 'text-amber-400 font-semibold' : 'text-slate-300'}`}>
                        {license.currentActivations} / {license.maxActivations}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-slate-400 text-xs">
                      {license.expiresAt 
                        ? new Date(license.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : <span className="text-slate-600">Lifetime</span>
                      }
                    </td>
                    <td className="py-3 px-2 text-slate-400 text-xs">
                      {new Date(license.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        {actionLoading === license.id ? (
                          <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />
                        ) : (
                          <>
                            {license.status === "active" && (
                              <>
                                <button
                                  onClick={() => {
                                    const reason = prompt("Reason for suspension:");
                                    if (reason) licenseAction(license.id, "suspend", reason);
                                  }}
                                  className="p-1.5 text-orange-400 hover:bg-orange-500/10 rounded transition-colors"
                                  title="Suspend License"
                                >
                                  <AlertTriangle className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Revoke license ${license.key}? This cannot be undone.`)) {
                                      const reason = prompt("Reason for revocation:");
                                      if (reason) licenseAction(license.id, "revoke", reason);
                                    }
                                  }}
                                  className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                  title="Revoke License"
                                >
                                  <Ban className="h-4 w-4" />
                                </button>
                              </>
                            )}
                            {license.status === "suspended" && (
                              <button
                                onClick={() => licenseAction(license.id, "reactivate")}
                                className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors"
                                title="Reactivate License"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            )}
                            {license.revokedReason && (
                              <span className="text-xs text-slate-500 italic ml-2" title={license.revokedReason}>
                                📝
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
            <p className="text-xs text-slate-500">
              Page {page} of {totalPages} · {total} licenses
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
