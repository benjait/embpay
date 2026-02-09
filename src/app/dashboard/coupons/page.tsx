"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Ticket,
  Copy,
  Check,
  Trash2,
  Search,
  Percent,
  Calendar,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

// ── Types ────────────────────────────────────────────────
interface Coupon {
  id: string;
  code: string;
  discount: number;
  maxUses: number;
  usedCount: number;
  active: boolean;
  expiresAt: string | null;
  status: "active" | "expired" | "maxed";
  createdAt: string;
}

// ── Component ────────────────────────────────────────────
export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [search, setSearch] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newDiscount, setNewDiscount] = useState("");
  const [newMaxUses, setNewMaxUses] = useState("");
  const [newExpiresAt, setNewExpiresAt] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const fetchCoupons = useCallback(async () => {
    try {
      const res = await fetch("/api/coupons");
      const data = await res.json();
      if (data.success) {
        setCoupons(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch coupons:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const filtered = coupons.filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const activeCoupons = coupons.filter((c) => c.status === "active").length;
  const totalUses = coupons.reduce((sum, c) => sum + c.usedCount, 0);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreate = async () => {
    if (!newCode.trim() || !newDiscount) return;

    setCreating(true);
    setError("");

    try {
      const discountValue = parseFloat(newDiscount) / 100; // Convert percentage to decimal
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newCode,
          discount: discountValue,
          maxUses: newMaxUses ? parseInt(newMaxUses) : 0,
          expiresAt: newExpiresAt || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCreateOpen(false);
        setNewCode("");
        setNewDiscount("");
        setNewMaxUses("");
        setNewExpiresAt("");
        fetchCoupons(); // Refresh list
      } else {
        setError(data.error || "Failed to create coupon");
      }
    } catch {
      setError("Failed to create coupon");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/coupons?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchCoupons(); // Refresh list
      }
    } catch {
      console.error("Failed to delete coupon");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const formatDiscount = (discount: number) => {
    return `${Math.round(discount * 100)}%`;
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-7 w-28 bg-white/[0.06] rounded-lg animate-pulse" />
        <div className="h-4 w-56 bg-white/[0.04] rounded-lg animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-white/[0.06] animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-32 bg-white/[0.06] rounded animate-pulse" />
                    <div className="h-3 w-48 bg-white/[0.04] rounded animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Coupons
          </h1>
          <p className="text-slate-400 mt-1">
            Create discount codes for your products
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-4 text-right">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">
                Active
              </p>
              <p className="text-lg font-bold text-indigo-400">
                {activeCoupons}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">
                Total Uses
              </p>
              <p className="text-lg font-bold text-white">{totalUses}</p>
            </div>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Create Coupon
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search coupons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/30 transition-all"
        />
      </div>

      {/* Coupons List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-5">
              <Ticket className="h-8 w-8 text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No coupons found
            </h3>
            <p className="text-slate-400 mb-6 max-w-sm mx-auto">
              {search
                ? "Try a different search term"
                : "Create your first coupon to offer discounts"}
            </p>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Create Coupon
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((coupon, i) => (
            <Card
              key={coupon.id}
              className="hover:border-white/[0.1] transition-all duration-300"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <CardContent className="py-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                        coupon.status === "active"
                          ? "bg-indigo-500/10"
                          : "bg-slate-500/10"
                      }`}
                    >
                      <Percent
                        className={`h-5 w-5 ${
                          coupon.status === "active"
                            ? "text-indigo-400"
                            : "text-slate-500"
                        }`}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-lg tracking-wider">
                          {coupon.code}
                        </span>
                        <button
                          onClick={() => copyCode(coupon.code)}
                          className="p-1 rounded text-slate-500 hover:text-white transition-colors"
                          title="Copy code"
                        >
                          {copiedCode === coupon.code ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm text-slate-400">
                          {formatDiscount(coupon.discount)} off
                        </span>
                        {coupon.expiresAt && (
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <Calendar className="h-3 w-3" />
                            {formatDate(coupon.expiresAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">
                        {coupon.usedCount}
                        {coupon.maxUses > 0 && (
                          <span className="text-slate-500 font-normal">
                            /{coupon.maxUses}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500">uses</p>
                    </div>
                    {coupon.maxUses > 0 && (
                      <div className="hidden sm:block w-20">
                        <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              coupon.usedCount >= coupon.maxUses
                                ? "bg-red-500"
                                : coupon.usedCount > coupon.maxUses * 0.7
                                  ? "bg-amber-500"
                                  : "bg-indigo-500"
                            }`}
                            style={{
                              width: `${Math.min(
                                (coupon.usedCount / coupon.maxUses) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                    <Badge
                      variant={
                        coupon.status === "active" ? "success" : "default"
                      }
                    >
                      {coupon.status}
                    </Badge>
                    <button
                      onClick={() => setDeleteId(coupon.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-white/[0.04] transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setError("");
        }}
        title="Create Coupon"
        size="sm"
      >
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
          <Input
            label="Coupon Code"
            placeholder="e.g., SUMMER25"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value.toUpperCase())}
          />
          <Input
            label="Discount Percentage"
            type="number"
            placeholder="20"
            value={newDiscount}
            onChange={(e) => setNewDiscount(e.target.value)}
          />
          <Input
            label="Max Uses (0 = unlimited)"
            type="number"
            placeholder="0"
            value={newMaxUses}
            onChange={(e) => setNewMaxUses(e.target.value)}
          />
          <Input
            label="Expires At (optional)"
            type="date"
            value={newExpiresAt}
            onChange={(e) => setNewExpiresAt(e.target.value)}
          />

          {/* Preview */}
          {newCode && newDiscount && (
            <div className="p-3 rounded-lg bg-indigo-500/[0.05] border border-indigo-500/20">
              <p className="text-xs text-indigo-400 font-medium mb-1">
                Preview
              </p>
              <p className="text-sm text-white">
                Code{" "}
                <span className="font-mono font-bold">{newCode}</span>{" "}
                gives{" "}
                <span className="font-bold text-indigo-400">
                  {newDiscount}% off
                </span>
                {newMaxUses && parseInt(newMaxUses) > 0 && (
                  <span className="text-slate-400">
                    {" "}(up to {newMaxUses} uses)
                  </span>
                )}
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" onClick={() => { setCreateOpen(false); setError(""); }}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {creating ? "Creating..." : "Create Coupon"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Coupon"
        size="sm"
      >
        <p className="text-slate-400 mb-6">
          Are you sure you want to deactivate this coupon? Customers with this code
          will no longer be able to use it.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteId && handleDelete(deleteId)}
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {deleting ? "Deleting..." : "Delete Coupon"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
