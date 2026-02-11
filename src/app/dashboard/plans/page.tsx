"use client";

import React, { useState, useEffect } from "react";
import { Check, Loader2, Zap, Rocket, Gift, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface UserData {
  plan: "free" | "pro" | "scale";
  planExpiresAt: string | null;
  productCount: number;
  monthlyOrders: number;
}

const PLANS = {
  free: {
    name: "Free",
    price: 0,
    icon: Gift,
    description: "Perfect for getting started",
    features: [
      "Up to 10 products",
      "Up to 100 orders/month",
      "Basic analytics",
      "Email support",
      "Stripe integration",
      "Embed checkout",
    ],
    limits: {
      maxProducts: 10,
      maxOrders: 100,
    },
  },
  pro: {
    name: "Pro",
    price: 29,
    icon: Zap,
    description: "For growing businesses",
    features: [
      "Unlimited products",
      "Unlimited orders",
      "Advanced analytics",
      "License key generation",
      "Priority support",
      "Custom branding",
      "Webhook notifications",
    ],
    limits: {
      maxProducts: Infinity,
      maxOrders: Infinity,
    },
    popular: true,
  },
  scale: {
    name: "Scale",
    price: 79,
    icon: Rocket,
    description: "For high-volume sellers",
    features: [
      "Everything in Pro",
      "API access",
      "White-label solution",
      "Custom domain",
      "Dedicated support",
      "SLA guarantee",
      "Advanced integrations",
      "Multi-user accounts",
    ],
    limits: {
      maxProducts: Infinity,
      maxOrders: Infinity,
    },
  },
};

export default function PlansPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      // Remove query param
      window.history.replaceState({}, "", "/dashboard/plans");
    }
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/dashboard/stats", { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setUserData({
          plan: data.data.user.plan || "free",
          planExpiresAt: data.data.user.planExpiresAt,
          productCount: data.data.products || 0,
          monthlyOrders: data.data.orders || 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan: "pro" | "scale") => {
    setUpgrading(plan);
    try {
      const res = await fetch("/api/subscriptions/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();
      if (data.success && data.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = data.checkoutUrl;
      } else {
        alert(data.error || "Failed to create checkout session");
        setUpgrading(null);
      }
    } catch (error) {
      console.error("Upgrade error:", error);
      alert("Failed to start checkout. Please try again.");
      setUpgrading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  const currentPlan = userData?.plan || "free";
  const isExpired = userData?.planExpiresAt
    ? new Date(userData.planExpiresAt) < new Date()
    : false;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white tracking-tight mb-3">
          Choose Your Plan
        </h1>
        <p className="text-slate-400 text-lg">
          Scale your business with the right tools. Upgrade anytime.
        </p>
      </div>

      {/* Success Banner */}
      {showSuccess && (
        <div className="max-w-4xl mx-auto bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 flex items-center gap-3">
          <Check className="h-5 w-5 text-emerald-400 flex-shrink-0" />
          <div>
            <p className="text-emerald-400 font-medium">
              Subscription activated successfully!
            </p>
            <p className="text-emerald-400/70 text-sm">
              Your plan has been upgraded. Enjoy your new features!
            </p>
          </div>
        </div>
      )}

      {/* Current Plan Info */}
      {userData && (
        <div className="max-w-4xl mx-auto bg-slate-800/40 border border-slate-700/50 rounded-lg p-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-slate-400 text-sm mb-1">Current Plan</p>
              <div className="flex items-center gap-3">
                <p className="text-xl font-bold text-white capitalize">
                  {currentPlan}
                </p>
                {currentPlan !== "free" && userData.planExpiresAt && (
                  <Badge variant={isExpired ? "error" : "default"}>
                    {isExpired
                      ? "Expired"
                      : `Renews ${new Date(userData.planExpiresAt).toLocaleDateString()}`}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div>
                <p className="text-slate-400">Products</p>
                <p className="text-white font-semibold">
                  {userData.productCount} / {PLANS[currentPlan].limits.maxProducts === Infinity ? "∞" : PLANS[currentPlan].limits.maxProducts}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Orders (this month)</p>
                <p className="text-white font-semibold">
                  {userData.monthlyOrders} / {PLANS[currentPlan].limits.maxOrders === Infinity ? "∞" : PLANS[currentPlan].limits.maxOrders}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {(["free", "pro", "scale"] as const).map((planKey) => {
          const plan = PLANS[planKey];
          const Icon = plan.icon;
          const isCurrent = currentPlan === planKey;
          const canUpgrade = planKey !== "free" && currentPlan === "free";

          return (
            <Card
              key={planKey}
              className={`relative transition-all duration-300 ${
                (plan as any).popular
                  ? "ring-2 ring-amber-500/50 shadow-xl shadow-amber-500/10"
                  : isCurrent
                  ? "ring-2 ring-emerald-500/50"
                  : ""
              }`}
            >
              {(plan as any).popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardContent className="py-8 px-6">
                {/* Header */}
                <div className="text-center mb-6">
                  <div
                    className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
                      (plan as any).popular
                        ? "bg-gradient-to-br from-amber-500/20 to-orange-500/20"
                        : planKey === "scale"
                        ? "bg-gradient-to-br from-purple-500/20 to-pink-500/20"
                        : "bg-slate-700/30"
                    }`}
                  >
                    <Icon
                      className={`h-7 w-7 ${
                        (plan as any).popular
                          ? "text-amber-400"
                          : planKey === "scale"
                          ? "text-purple-400"
                          : "text-slate-400"
                      }`}
                    />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-slate-400 text-sm mb-4">
                    {plan.description}
                  </p>

                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-white">
                      ${plan.price}
                    </span>
                    <span className="text-slate-400">/month</span>
                  </div>
                </div>

                {/* Current Plan Badge */}
                {isCurrent && (
                  <div className="mb-4">
                    <Badge className="w-full justify-center bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Current Plan
                    </Badge>
                  </div>
                )}

                {/* CTA Button */}
                {canUpgrade && (
                  <Button
                    onClick={() => handleUpgrade(planKey)}
                    disabled={!!upgrading}
                    loading={upgrading === planKey}
                    className={`w-full mb-6 ${
                      (plan as any).popular
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25"
                        : ""
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    Upgrade to {plan.name}
                  </Button>
                )}

                {!isCurrent && !canUpgrade && planKey !== "free" && (
                  <div className="mb-6">
                    <Button variant="outline" disabled className="w-full">
                      {currentPlan === planKey ? "Current Plan" : "Contact Sales"}
                    </Button>
                  </div>
                )}

                {planKey === "free" && !isCurrent && (
                  <div className="mb-6 h-[42px]" />
                )}

                {/* Features */}
                <div className="space-y-3 pt-4 border-t border-white/[0.06]">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check
                        className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                          (plan as any).popular
                            ? "text-amber-400"
                            : planKey === "scale"
                            ? "text-purple-400"
                            : "text-emerald-400"
                        }`}
                      />
                      <span className="text-sm text-slate-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto pt-8">
        <h2 className="text-xl font-bold text-white mb-6 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          <Card>
            <CardContent className="py-4">
              <h3 className="text-white font-semibold mb-2">
                Can I change plans anytime?
              </h3>
              <p className="text-slate-400 text-sm">
                Yes! You can upgrade from Free to Pro or Scale at any time. Downgrades
                will take effect at the end of your current billing period.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-4">
              <h3 className="text-white font-semibold mb-2">
                What happens if I exceed my plan limits?
              </h3>
              <p className="text-slate-400 text-sm">
                On the Free plan, you'll be prompted to upgrade once you reach 10 products
                or 100 orders per month. Pro and Scale plans have no limits.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-4">
              <h3 className="text-white font-semibold mb-2">
                Is there a refund policy?
              </h3>
              <p className="text-slate-400 text-sm">
                We offer a 14-day money-back guarantee on all paid plans. Contact support
                if you're not satisfied.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
