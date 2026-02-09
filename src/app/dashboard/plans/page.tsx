"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  CreditCard,
  Users,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Search,
  Repeat,
  DollarSign,
  Star,
  X,
  Check,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

interface Plan {
  id: string;
  name: string;
  stripePriceId: string | null;
  price: number;
  interval: string;
  features: string | null;
  isActive: boolean;
  createdAt: string;
  _count: { subscriptions: number };
}

interface PlanForm {
  name: string;
  price: string;
  interval: string;
  features: string;
  stripePriceId: string;
}

const emptyForm: PlanForm = {
  name: "",
  price: "",
  interval: "month",
  features: "",
  stripePriceId: "",
};

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<PlanForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof PlanForm, string>>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/plans");
      const data = await res.json();
      if (data.success) {
        setPlans(data.data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const filteredPlans = plans.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = plans.reduce((sum, p) => {
    if (!p.isActive) return sum;
    return sum + p.price * p._count.subscriptions;
  }, 0);

  const totalSubscribers = plans.reduce(
    (sum, p) => sum + p._count.subscriptions,
    0
  );

  const activePlans = plans.filter((p) => p.isActive).length;

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof PlanForm, string>> = {};
    if (!form.name.trim()) newErrors.name = "Plan name is required";
    if (!form.price || parseFloat(form.price) <= 0)
      newErrors.price = "Price must be greater than 0";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const features = form.features
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean);

      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          price: parseFloat(form.price),
          interval: form.interval,
          features: features.length > 0 ? features : null,
          stripePriceId: form.stripePriceId || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowCreate(false);
        setForm(emptyForm);
        setErrors({});
        fetchPlans();
      }
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (plan: Plan) => {
    try {
      const res = await fetch("/api/plans", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: plan.id, isActive: !plan.isActive }),
      });

      const data = await res.json();
      if (data.success) {
        setPlans((prev) =>
          prev.map((p) =>
            p.id === plan.id ? { ...p, isActive: !p.isActive } : p
          )
        );
      }
    } catch {
      // silently fail
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/plans?id=${deleteId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setPlans((prev) => prev.filter((p) => p.id !== deleteId));
      }
    } catch {
      // silently fail
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const formatPrice = (price: number, interval: string) => {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
    return `${formatted}/${interval === "year" ? "yr" : "mo"}`;
  };

  const parseFeatures = (features: string | null): string[] => {
    if (!features) return [];
    try {
      return JSON.parse(features);
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Subscription Plans
          </h1>
          <p className="text-slate-400 mt-0.5">
            Create and manage recurring billing plans
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          New Plan
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Active Plans</p>
                <p className="text-xl font-bold text-white">{activePlans}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Subscribers</p>
                <p className="text-xl font-bold text-white">
                  {totalSubscribers}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Monthly Revenue</p>
                <p className="text-xl font-bold text-white">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(totalRevenue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      {plans.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search plans..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition"
          />
        </div>
      )}

      {/* Plans List */}
      {plans.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
              <Repeat className="h-8 w-8 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">
              No plans yet
            </h3>
            <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
              Create your first subscription plan to start earning recurring
              revenue.
            </p>
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4" />
              Create Plan
            </Button>
          </CardContent>
        </Card>
      ) : filteredPlans.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-400">
              No plans matching &ldquo;{search}&rdquo;
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPlans.map((plan) => {
            const features = parseFeatures(plan.features);
            return (
              <Card
                key={plan.id}
                className={`relative transition-all duration-200 ${
                  !plan.isActive ? "opacity-60" : ""
                }`}
              >
                <CardContent className="py-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-white truncate">
                          {plan.name}
                        </h3>
                        <Badge
                          variant={plan.isActive ? "success" : "default"}
                        >
                          {plan.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-2xl font-bold text-indigo-400">
                        {formatPrice(plan.price, plan.interval)}
                      </p>
                    </div>
                  </div>

                  {/* Features */}
                  {features.length > 0 && (
                    <ul className="space-y-1.5 mb-4">
                      {features.map((feature, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 text-sm text-slate-300"
                        >
                          <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 py-3 border-t border-white/[0.06]">
                    <div className="flex items-center gap-1.5 text-sm text-slate-400">
                      <Users className="h-3.5 w-3.5" />
                      {plan._count.subscriptions} subscriber
                      {plan._count.subscriptions !== 1 ? "s" : ""}
                    </div>
                    {plan.stripePriceId && (
                      <div className="flex items-center gap-1.5 text-sm text-slate-500">
                        <CreditCard className="h-3.5 w-3.5" />
                        Stripe linked
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => toggleActive(plan)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        plan.isActive
                          ? "text-amber-400 hover:bg-amber-500/10"
                          : "text-emerald-400 hover:bg-emerald-500/10"
                      }`}
                    >
                      {plan.isActive ? (
                        <>
                          <ToggleRight className="h-3.5 w-3.5" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="h-3.5 w-3.5" />
                          Activate
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setDeleteId(plan.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Plan Modal */}
      <Modal
        open={showCreate}
        onClose={() => {
          setShowCreate(false);
          setForm(emptyForm);
          setErrors({});
        }}
        title="Create Subscription Plan"
      >
        <form onSubmit={handleCreate} className="space-y-5">
          <Input
            label="Plan Name"
            placeholder="e.g., Pro Monthly"
            value={form.name}
            onChange={(e) => {
              setForm((f) => ({ ...f, name: e.target.value }));
              if (errors.name)
                setErrors((e) => {
                  const n = { ...e };
                  delete n.name;
                  return n;
                });
            }}
            error={errors.name}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price (USD)"
              type="number"
              step="0.01"
              min="0"
              placeholder="9.99"
              value={form.price}
              onChange={(e) => {
                setForm((f) => ({ ...f, price: e.target.value }));
                if (errors.price)
                  setErrors((e) => {
                    const n = { ...e };
                    delete n.price;
                    return n;
                  });
              }}
              error={errors.price}
            />
            <Select
              label="Billing Interval"
              options={[
                { value: "month", label: "Monthly" },
                { value: "year", label: "Yearly" },
              ]}
              value={form.interval}
              onChange={(e) =>
                setForm((f) => ({ ...f, interval: e.target.value }))
              }
            />
          </div>

          <Textarea
            label="Features"
            placeholder="One feature per line&#10;e.g., Unlimited access&#10;Priority support&#10;Custom branding"
            value={form.features}
            onChange={(e) =>
              setForm((f) => ({ ...f, features: e.target.value }))
            }
            rows={4}
          />

          <Input
            label="Stripe Price ID"
            placeholder="price_xxxxxxxxx (optional)"
            value={form.stripePriceId}
            onChange={(e) =>
              setForm((f) => ({ ...f, stripePriceId: e.target.value }))
            }
            hint="Link to an existing Stripe price for automatic billing"
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowCreate(false);
                setForm(emptyForm);
                setErrors({});
              }}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              <Plus className="h-4 w-4" />
              Create Plan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Plan"
      >
        <p className="text-sm text-slate-400 mb-6">
          Are you sure you want to delete this plan? This action cannot be
          undone. Plans with active subscribers cannot be deleted.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            loading={deleting}
          >
            <Trash2 className="h-4 w-4" />
            Delete Plan
          </Button>
        </div>
      </Modal>
    </div>
  );
}
