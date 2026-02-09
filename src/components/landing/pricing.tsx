import { Check, Sparkles, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started and testing the waters.",
    fee: "5% transaction fee",
    features: [
      "3 products",
      "Basic checkout widget",
      "Basic analytics",
      "Email delivery",
      "Community support",
    ],
    cta: "Start Free",
    popular: false,
    href: "/auth/register",
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For serious creators and growing businesses.",
    fee: "3% transaction fee",
    features: [
      "Unlimited products",
      "Custom branding",
      "Order bumps & upsells",
      "Subscription billing",
      "Advanced analytics",
      "Priority email support",
      "Custom domain",
    ],
    cta: "Start Pro Trial",
    popular: true,
    href: "/auth/register?plan=pro",
  },
  {
    name: "Business",
    price: "$79",
    period: "/month",
    description: "For teams and high-volume sellers.",
    fee: "2% transaction fee",
    features: [
      "Everything in Pro",
      "White-label checkout",
      "Team access (5 seats)",
      "Affiliate management",
      "Webhook integrations",
      "Priority support",
      "API access",
      "Custom email templates",
    ],
    cta: "Start Business Trial",
    popular: false,
    href: "/auth/register?plan=business",
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="relative py-28 sm:py-36">
      <div className="section-divider absolute left-0 right-0 top-0" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center scroll-fade-in">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-indigo-400">
            Pricing
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Simple, transparent{" "}
            <span className="gradient-text">pricing</span>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-400">
            Start free, scale as you grow. No hidden fees, no surprises.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mt-20 grid items-start gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 scroll-fade-in ${
                plan.popular
                  ? "pricing-popular bg-slate-900/80"
                  : "glass-card glass-card-hover border border-white/[0.06]"
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-1 text-xs font-semibold text-white shadow-lg shadow-indigo-500/30">
                    <Sparkles className="h-3 w-3" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white">
                  {plan.name}
                </h3>
                <p className="mt-1.5 text-sm text-slate-500">
                  {plan.description}
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold tracking-tight text-white">
                    {plan.price}
                  </span>
                  <span className="text-sm text-slate-500">{plan.period}</span>
                </div>
                <p className="mt-2 text-sm font-medium text-indigo-400">
                  {plan.fee}
                </p>
              </div>

              {/* Features */}
              <ul className="mb-8 space-y-3.5">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-slate-300"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href={plan.href}
                className={`group flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
                  plan.popular
                    ? "btn-primary text-white"
                    : "btn-secondary text-slate-300 hover:text-white"
                }`}
              >
                {plan.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          ))}
        </div>

        {/* Enterprise */}
        <div className="mx-auto mt-12 max-w-2xl text-center">
          <div className="glass-card rounded-2xl border border-white/[0.06] p-8">
            <h3 className="text-xl font-semibold text-white">Enterprise</h3>
            <p className="mt-2 text-sm text-slate-400">
              Need custom fees, SLA guarantees, dedicated support, or
              white-label infrastructure? Let&apos;s talk.
            </p>
            <a
              href="#contact"
              className="btn-secondary mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-slate-300 hover:text-white"
            >
              Contact Sales
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
