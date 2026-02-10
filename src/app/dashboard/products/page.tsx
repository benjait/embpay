"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  MoreVertical,
  Edit3,
  Trash2,
  ExternalLink,
  Package,
  Loader2,
  Copy,
  Check,
  Link as LinkIcon,
  Code2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";

// ── Types ────────────────────────────────────────────────
interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  type: string;
  active: boolean;
  imageUrl: string | null;
  createdAt: string;
  _count: { orders: number };
}

// ── Component ────────────────────────────────────────────
export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "draft">("all");
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products", { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Close menu on outside click
  useEffect(() => {
    if (!openMenu) return;
    const close = () => setOpenMenu(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [openMenu]);

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && p.active) ||
      (filter === "draft" && !p.active);
    return matchesSearch && matchesFilter;
  });

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete product:", err);
    } finally {
      setDeleting(false);
      setDeleteModal(null);
    }
  };

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const getBaseUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return "";
  };

  const copyUrl = (productId: string, type: "checkout" | "embed") => {
    const base = getBaseUrl();
    const url =
      type === "checkout"
        ? `${base}/checkout/${productId}`
        : `${base}/embed/${productId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(productId);
    setCopiedType(type);
    setTimeout(() => {
      setCopiedId(null);
      setCopiedType(null);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="h-7 w-32 bg-white/[0.06] rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-white/[0.04] rounded-lg animate-pulse mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <div className="h-40 bg-white/[0.04] animate-pulse" />
              <CardContent className="py-4 space-y-3">
                <div className="h-5 w-3/4 bg-white/[0.06] rounded animate-pulse" />
                <div className="h-4 w-full bg-white/[0.04] rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-white/[0.04] rounded animate-pulse" />
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
            Products
          </h1>
          <p className="text-slate-400 mt-1">
            Manage your digital products and services
            {products.length > 0 && (
              <span className="text-slate-500">
                {" "}
                · {products.length} product{products.length !== 1 ? "s" : ""}
              </span>
            )}
          </p>
        </div>
        <Link href="/dashboard/products/new">
          <Button>
            <Plus className="h-4 w-4" />
            Create Product
          </Button>
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/30 transition-all"
          />
        </div>
        <div className="flex rounded-lg border border-white/[0.08] overflow-hidden">
          {(["all", "active", "draft"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 text-sm font-medium capitalize transition-all duration-200 ${
                filter === f
                  ? "bg-indigo-600 text-white shadow-inner"
                  : "bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-5">
              <Package className="h-8 w-8 text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No products found
            </h3>
            <p className="text-slate-400 mb-6 max-w-sm mx-auto">
              {search
                ? "Try a different search term or adjust your filters"
                : "Create your first product to start selling"}
            </p>
            <Link href="/dashboard/products/new">
              <Button>
                <Plus className="h-4 w-4" />
                Create Product
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((product, i) => (
            <Card
              key={product.id}
              className="overflow-hidden group hover:border-white/[0.12] transition-all duration-300"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {/* Image */}
              <div className="relative h-40 bg-slate-900 overflow-hidden">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900/40 to-purple-900/40">
                    <Package className="h-12 w-12 text-slate-600" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge
                    variant={product.active ? "success" : "default"}
                  >
                    {product.active ? "active" : "draft"}
                  </Badge>
                  {product.type === "subscription" && (
                    <Badge variant="info">Recurring</Badge>
                  )}
                </div>
              </div>

              {/* Content */}
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-white truncate">
                      {product.name}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                      {product.description || "No description"}
                    </p>
                  </div>
                  <div className="relative ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenu(
                          openMenu === product.id ? null : product.id
                        );
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {openMenu === product.id && (
                      <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-white/[0.06] bg-slate-900/95 backdrop-blur-xl shadow-2xl py-1 z-10 animate-[scaleIn_0.15s_ease]">
                        <button
                          onClick={() => setOpenMenu(null)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/[0.04]"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setOpenMenu(null);
                            window.open(
                              `/p/${product.id}`,
                              "_blank"
                            );
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/[0.04]"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Preview
                        </button>
                        <button
                          onClick={() => {
                            setOpenMenu(null);
                            copyUrl(product.id, "checkout");
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/[0.04]"
                        >
                          <LinkIcon className="h-3.5 w-3.5" />
                          Copy Checkout URL
                        </button>
                        <button
                          onClick={() => {
                            setOpenMenu(null);
                            copyUrl(product.id, "embed");
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/[0.04]"
                        >
                          <Code2 className="h-3.5 w-3.5" />
                          Copy Embed URL
                        </button>
                        <div className="mx-2 my-1 h-px bg-white/[0.06]" />
                        <button
                          onClick={() => {
                            setOpenMenu(null);
                            setDeleteModal(product.id);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/[0.04]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Copy URL quick buttons */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => copyUrl(product.id, "checkout")}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                      copiedId === product.id && copiedType === "checkout"
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                        : "bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]"
                    }`}
                  >
                    {copiedId === product.id && copiedType === "checkout" ? (
                      <>
                        <Check className="h-3 w-3" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <LinkIcon className="h-3 w-3" />
                        Checkout URL
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => copyUrl(product.id, "embed")}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                      copiedId === product.id && copiedType === "embed"
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                        : "bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]"
                    }`}
                  >
                    {copiedId === product.id && copiedType === "embed" ? (
                      <>
                        <Check className="h-3 w-3" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Code2 className="h-3 w-3" />
                        Embed URL
                      </>
                    )}
                  </button>
                </div>

                {/* Stats row */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.06]">
                  <span className="text-lg font-bold text-white">
                    {formatPrice(product.price)}
                    {product.type === "subscription" && (
                      <span className="text-xs font-normal text-slate-500">
                        /mo
                      </span>
                    )}
                  </span>
                  <div className="flex gap-4 text-xs text-slate-500">
                    <span>
                      <span className="text-slate-300 font-medium">
                        {product._count.orders}
                      </span>{" "}
                      sales
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Modal */}
      <Modal
        open={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Product"
        size="sm"
      >
        <p className="text-slate-400 mb-6">
          Are you sure you want to delete this product? This action cannot be
          undone and all associated data will be lost.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setDeleteModal(null)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            loading={deleting}
            onClick={() => deleteModal && handleDelete(deleteModal)}
          >
            <Trash2 className="h-4 w-4" />
            Delete Product
          </Button>
        </div>
      </Modal>
    </div>
  );
}
