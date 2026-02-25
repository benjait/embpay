"use client";

import { 
  Zap, Shield, Code, CreditCard, BarChart3, Globe, 
  Webhook, Lock, TrendingUp, Sparkles, Package, Link2 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast Setup",
    description: "Create your first product in under 60 seconds. No technical skills required.",
    gradient: "from-amber-500 to-orange-600"
  },
  {
    icon: CreditCard,
    title: "Accept All Payments",
    description: "Credit cards, debit cards, Apple Pay, Google Pay — we support them all.",
    gradient: "from-indigo-500 to-blue-600"
  },
  {
    icon: Shield,
    title: "Bank-Level Security",
    description: "PCI DSS compliant. Your customer data is encrypted and protected.",
    gradient: "from-emerald-500 to-teal-600"
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Track revenue, conversion rates, and customer behavior in real-time.",
    gradient: "from-purple-500 to-violet-600"
  },
  {
    icon: Code,
    title: "Developer Friendly",
    description: "REST API, webhooks, and SDKs for seamless integration into any stack.",
    gradient: "from-pink-500 to-rose-600"
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "Accept payments from customers worldwide in multiple currencies.",
    gradient: "from-cyan-500 to-blue-600"
  },
  {
    icon: Link2,
    title: "Shareable Links",
    description: "Generate payment links and share them anywhere — no website needed.",
    gradient: "from-violet-500 to-purple-600"
  },
  {
    icon: Package,
    title: "Product Variants",
    description: "Create one-time purchases, subscriptions, or pay-what-you-want products.",
    gradient: "from-red-500 to-orange-600"
  },
  {
    icon: Webhook,
    title: "Smart Webhooks",
    description: "Get notified instantly when payments succeed, fail, or require action.",
    gradient: "from-green-500 to-emerald-600"
  },
  {
    icon: Lock,
    title: "Fraud Protection",
    description: "Advanced fraud detection powered by Stripe Radar keeps you safe.",
    gradient: "from-slate-500 to-gray-600"
  },
  {
    icon: TrendingUp,
    title: "Revenue Optimization",
    description: "A/B test pricing, add upsells, and maximize your revenue per customer.",
    gradient: "from-yellow-500 to-amber-600"
  },
  {
    icon: Sparkles,
    title: "White-Label Ready",
    description: "Customize the checkout experience with your brand colors and logo.",
    gradient: "from-fuchsia-500 to-pink-600"
  }
];

export default function FeaturesModern() {
  return (
    <section id="features" className="py-24 px-6 bg-slate-900/30">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Everything you need to get paid
          </h2>
          <p className="text-xl text-slate-300">
            Built for creators, optimized for conversion, trusted by thousands.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={idx}
                className="border-white/10 bg-slate-900/50 backdrop-blur-sm hover:bg-slate-900/80 transition-all hover:shadow-xl hover:shadow-indigo-500/10 group"
              >
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
