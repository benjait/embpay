"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Check, Zap, Crown, Rocket } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    icon: Zap,
    gradient: "from-slate-500 to-gray-600",
    features: [
      "Up to 10 products",
      "Basic analytics",
      "Shareable payment links",
      "Stripe integration",
      "Email support"
    ],
    cta: "Start Free",
    href: "/auth/register",
    popular: false
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For serious creators",
    icon: Crown,
    gradient: "from-indigo-500 to-blue-600",
    features: [
      "Unlimited products",
      "Advanced analytics",
      "Custom branding",
      "Priority support",
      "Webhooks & API access",
      "A/B testing",
      "Abandoned cart recovery"
    ],
    cta: "Start Pro Trial",
    href: "/auth/register?plan=pro",
    popular: true
  },
  {
    name: "Scale",
    price: "$79",
    period: "/month",
    description: "For high-volume businesses",
    icon: Rocket,
    gradient: "from-purple-500 to-pink-600",
    features: [
      "Everything in Pro",
      "White-label checkout",
      "Dedicated account manager",
      "Custom integrations",
      "99.99% SLA",
      "Advanced fraud protection",
      "Volume discounts"
    ],
    cta: "Contact Sales",
    href: "/contact",
    popular: false
  }
];

export default function PricingModern() {
  return (
    <section id="pricing" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-slate-300">
            Start free, upgrade when you need more. No hidden fees.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => {
            const Icon = plan.icon;
            return (
              <Card 
                key={idx}
                className={`border-white/10 bg-slate-900/50 backdrop-blur-sm relative ${
                  plan.popular 
                    ? 'ring-2 ring-indigo-500 shadow-2xl shadow-indigo-500/20' 
                    : 'hover:border-white/20'
                } transition-all`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="px-4 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full text-white text-sm font-medium shadow-lg">
                      Most Popular
                    </div>
                  </div>
                )}

                <CardHeader className="text-center pb-8 pt-8">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <Icon className="h-8 w-8 text-white" strokeWidth={2} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-sm text-slate-400 mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold text-white">{plan.price}</span>
                    <span className="text-slate-400">{plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href={plan.href} className="block">
                    <Button 
                      className={`w-full ${
                        plan.popular 
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20' 
                          : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                      }`}
                      size="lg"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12">
          <p className="text-sm text-slate-400">
            All plans include Stripe processing fees (2.9% + 30¢ per successful charge)
          </p>
        </div>
      </div>
    </section>
  );
}
