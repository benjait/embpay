"use client";

import { useEffect, useState } from "react";
import {
  Users, Search, Shield, Ban, CheckCircle, Crown,
  Loader2, ChevronLeft, ChevronRight, Key
} from "lucide-react";

interface User {
  id: string; email: string; name: string | null; businessName: string | null;
  stripeConnected: boolean; role: string; plan: string; suspended: boolean;
  products: number; orders: number; revenue: number; createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function loadUsers() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/users?${params}`);
      const json = await res.json();
      if (json.success) {
        setUsers(json.data.users);
        setTotalPages(json.data.totalPages);
        setTotal(json.data.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadUsers(); }, [page]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    loadUsers();
  }

  async function userAction(userId: string, action: string, value?: string) {
    setActionLoading(userId);
    try {
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, value }),
      });
      await loadUsers();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  }

  const planColors: Record<string, string> = {
    free: "bg-slate-500/10 text-slate-400",
    pro: "bg-indigo-500/10 text-indigo-400",
    scale: "bg-amber-500/10 text-amber-400",
  };

  const roleColors: Record<string, string> = {
    merchant: "bg-blue-500/10 text-blue-400",
    admin: "bg-purple-500/10 text-purple-400",
    superadmin: "bg-amber-500/10 text-amber-400",
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-400" />
            User Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">{total} total users</p>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by email, name, or business..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-800 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>
        <button type="submit" className="px-4 py-2.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors">
          Search
        </button>
      </form>

      {/* Users Table */}
      <div className="bg-slate-900 rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 uppercase border-b border-white/5">
                <th className="text-left py-3 px-4">User</th>
                <th className="text-center py-3 px-2">Plan</th>
                <th className="text-center py-3 px-2">Role</th>
                <th className="text-center py-3 px-2">Stripe</th>
                <th className="text-right py-3 px-2">Products</th>
                <th className="text-right py-3 px-2">Orders</th>
                <th className="text-right py-3 px-2">Revenue</th>
                <th className="text-left py-3 px-2">Joined</th>
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No users found
                  </td>
                </tr>
              ) : users.map(user => (
                <tr key={user.id} className={`border-b border-white/5 hover:bg-white/[0.02] ${user.suspended ? 'opacity-60' : ''}`}>
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-white font-medium flex items-center gap-1.5">
                        {user.businessName || user.name || "—"}
                        {user.suspended && <Ban className="h-3.5 w-3.5 text-red-400" />}
                      </p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${planColors[user.plan] || planColors.free}`}>
                      {user.plan}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[user.role] || roleColors.merchant}`}>
                      {user.role === 'superadmin' ? '👑' : ''} {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    {user.stripeConnected ? (
                      <CheckCircle className="h-4 w-4 text-emerald-400 mx-auto" />
                    ) : (
                      <span className="text-xs text-slate-600">—</span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-right text-slate-300">{user.products}</td>
                  <td className="py-3 px-2 text-right text-slate-300">{user.orders}</td>
                  <td className="py-3 px-2 text-right font-semibold text-emerald-400">
                    ${user.revenue.toFixed(2)}
                  </td>
                  <td className="py-3 px-2 text-slate-400 text-xs">
                    {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1">
                      {actionLoading === user.id ? (
                        <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />
                      ) : (
                        <>
                          {/* Plan change */}
                          <select
                            value={user.plan}
                            onChange={e => userAction(user.id, "plan", e.target.value)}
                            className="bg-slate-800 text-xs text-white border border-white/10 rounded px-1 py-1 cursor-pointer"
                          >
                            <option value="free">Free</option>
                            <option value="pro">Pro</option>
                            <option value="scale">Scale</option>
                          </select>
                          
                          {/* Suspend/Unsuspend */}
                          {user.suspended ? (
                            <button
                              onClick={() => userAction(user.id, "unsuspend")}
                              className="p-1 text-emerald-400 hover:bg-emerald-500/10 rounded"
                              title="Unsuspend"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                if (confirm(`Suspend ${user.email}?`)) {
                                  userAction(user.id, "suspend", "Suspended by admin");
                                }
                              }}
                              className="p-1 text-red-400 hover:bg-red-500/10 rounded"
                              title="Suspend"
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
            <p className="text-xs text-slate-500">
              Page {page} of {totalPages} · {total} users
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
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
