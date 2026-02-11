"use client";

import { useEffect, useState } from "react";
import {
  FileText, Loader2, ChevronLeft, ChevronRight,
  Shield, User, CreditCard, Key, Package
} from "lucide-react";

interface AuditLog {
  id: string;
  timestamp: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string | null;
  ipAddress: string | null;
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  async function loadLogs() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "50" });
      if (actionFilter) params.set("action", actionFilter);
      const res = await fetch(`/api/admin/audit?${params}`);
      const json = await res.json();
      if (json.success) {
        setLogs(json.data.logs);
        setTotalPages(json.data.totalPages);
        setTotal(json.data.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadLogs(); }, [page, actionFilter]);

  const targetIcons: Record<string, any> = {
    user: User,
    order: CreditCard,
    license: Key,
    product: Package,
  };

  const actionColors: Record<string, string> = {
    "user.suspend": "text-red-400",
    "user.unsuspend": "text-emerald-400",
    "user.plan": "text-blue-400",
    "license.revoke": "text-red-400",
    "license.suspend": "text-orange-400",
    "license.reactivate": "text-emerald-400",
    "order.refund": "text-amber-400",
  };

  function formatDetails(details: string | null) {
    if (!details) return null;
    try {
      const parsed = JSON.parse(details);
      return (
        <div className="text-xs text-slate-500 mt-1 font-mono">
          {Object.entries(parsed).map(([key, value]) => (
            <div key={key}>
              <span className="text-slate-600">{key}:</span> {String(value)}
            </div>
          ))}
        </div>
      );
    } catch {
      return <p className="text-xs text-slate-500 mt-1">{details}</p>;
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="h-6 w-6 text-amber-400" />
          Audit Log
        </h1>
        <p className="text-sm text-slate-400 mt-1">{total} total admin actions</p>
      </div>

      {/* Filter */}
      <div className="flex gap-3">
        <select
          value={actionFilter}
          onChange={e => { setActionFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 rounded-lg bg-slate-800 border border-white/10 text-sm text-white"
        >
          <option value="">All Actions</option>
          <option value="user.suspend">User Suspend</option>
          <option value="user.unsuspend">User Unsuspend</option>
          <option value="user.plan">User Plan Change</option>
          <option value="license.revoke">License Revoke</option>
          <option value="license.suspend">License Suspend</option>
          <option value="license.reactivate">License Reactivate</option>
          <option value="order.refund">Order Refund</option>
        </select>
      </div>

      {/* Audit Table */}
      <div className="bg-slate-900 rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 uppercase border-b border-white/5">
                <th className="text-left py-3 px-4">Timestamp</th>
                <th className="text-left py-3 px-2">Admin</th>
                <th className="text-left py-3 px-2">Action</th>
                <th className="text-left py-3 px-2">Target Type</th>
                <th className="text-left py-3 px-2">Target ID</th>
                <th className="text-left py-3 px-2">Details</th>
                <th className="text-left py-3 px-2">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Loader2 className="h-6 w-6 text-amber-500 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No audit logs found
                  </td>
                </tr>
              ) : logs.map(log => {
                const TargetIcon = targetIcons[log.targetType] || Shield;
                return (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="py-3 px-4 text-slate-400 text-xs whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3 px-2 text-slate-300 text-xs">{log.adminEmail}</td>
                    <td className="py-3 px-2">
                      <span className={`text-xs font-medium ${actionColors[log.action] || 'text-slate-400'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1.5">
                        <TargetIcon className="h-3.5 w-3.5 text-slate-500" />
                        <span className="text-xs text-slate-400">{log.targetType}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <code className="text-xs text-slate-400 font-mono">
                        {log.targetId.substring(0, 12)}...
                      </code>
                    </td>
                    <td className="py-3 px-2">
                      {formatDetails(log.details)}
                    </td>
                    <td className="py-3 px-2 text-slate-500 text-xs">
                      {log.ipAddress || "—"}
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
              Page {page} of {totalPages} · {total} logs
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
