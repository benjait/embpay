import {
  Link2,
  Code2,
  TrendingUp,
  RefreshCw,
  BarChart3,
  Palette,
} from "lucide-react";

const features = [
  {
    icon: Link2,
    title: "Stripe Connect",
    description:
      "One-click Stripe integration. Connect your existing account or create a new one — start accepting payments instantly.",
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/10",
    borderColor: "group-hover:border-indigo-500/30",
  },
  {
    icon: Code2,
    title: "Embeddable Checkout",
    description:
      "Drop a checkout anywhere — iframe embeds, popup overlays, or hosted links. Works on any website, landing page, or funnel.",
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    borderColor: "group-hover:border-violet-500/30",
  },
  {
    icon: TrendingUp,
    title: "Order Bumps & Upsells",
    description:
      "Boost AOV with one-click order bumps and post-purchase upsells. Increase revenue by 30% on average.",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "group-hover:border-emerald-500/30",
  },
  {
    icon: RefreshCw,
    title: "Subscription Billing",
    description:
      "Recurring payments, free trials, metered billing, and dunning management — all built in and fully automated.",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "group-hover:border-cyan-500/30",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description:
      "Revenue dashboards, conversion funnels, cohort analysis, and MRR tracking — know your numbers in real time.",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "group-hover:border-amber-500/30",
  },
  {
    icon: Palette,
    title: "Custom Branding",
    description:
      "White-label everything. Custom colors, logos, domains, and email templates that match your brand perfectly.",
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
    borderColor: "group-hover:border-pink-500/30",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-28 sm:py-36">
      {/* Section Header */}
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center scroll-fade-in">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-indigo-400">
            Features
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Everything you need to{" "}
            <span className="gradient-text">sell online</span>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-400">
            A complete payment platform built for creators, SaaS founders, and
            digital businesses. No code. No complexity.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`glass-card glass-card-hover group rounded-2xl border border-white/[0.06] p-7 scroll-fade-in ${feature.borderColor}`}
              >
                <div
                  className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.bgColor}`}
                >
                  <Icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="mb-2.5 text-lg font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
