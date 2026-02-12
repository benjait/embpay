import { Check, X } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for testing ideas and side projects.",
    features: [
      "10 Products",
      "100 Orders / month",
      "Basic Analytics",
      "Stripe Connect",
      "Standard Support",
    ],
    cta: "Start for Free",
    popular: false,
    gradient: "from-slate-800 to-slate-900",
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For serious creators scaling their business.",
    features: [
      "Unlimited Products",
      "Unlimited Orders",
      "Advanced Analytics",
      "Order Bumps & Upsells",
      "Priority Support",
      "0% Transaction Fee",
      "Custom Domains",
    ],
    cta: "Start 14-Day Trial",
    popular: true,
    gradient: "from-indigo-600 to-violet-600",
  },
  {
    name: "Scale",
    price: "$79",
    period: "/month",
    description: "For agencies and high-volume sellers.",
    features: [
      "Everything in Pro",
      "White-Label Checkout",
      "API Access",
      "Team Members",
      "Dedicated Success Manager",
      "Multi-Currency Support",
      "SLA Guarantee",
    ],
    cta: "Contact Sales",
    popular: false,
    gradient: "from-slate-800 to-slate-900",
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="relative py-24 sm:py-32 overflow-hidden">
       {/* Background Glow */}
       <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
       
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Simple, transparent <span className="gradient-text">pricing</span>
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Start for free, upgrade as you grow. No hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {plans.map((plan, idx) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-3xl border p-8 transition-all duration-300 hover:-translate-y-2 ${
                plan.popular
                  ? "border-indigo-500/50 bg-slate-900/80 shadow-2xl shadow-indigo-500/20 z-10 scale-105"
                  : "border-white/10 bg-slate-950/50 hover:bg-slate-900/80 hover:border-white/20"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-1 text-sm font-bold text-white shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                <p className="mt-2 text-sm text-slate-400">{plan.description}</p>
              </div>

              <div className="mb-6 flex items-baseline">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                {plan.period && (
                  <span className="ml-1 text-sm text-slate-500">{plan.period}</span>
                )}
              </div>

              <ul className="mb-8 flex-1 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full ${plan.popular ? "bg-indigo-500/20 text-indigo-300" : "bg-white/10 text-slate-400"}`}>
                      <Check className="h-3 w-3" />
                    </div>
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="/auth/register"
                className={`block w-full rounded-xl py-3 text-center text-sm font-bold transition-all ${
                  plan.popular
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg hover:shadow-indigo-500/30"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
