import {
  Link2,
  Code2,
  TrendingUp,
  RefreshCw,
  BarChart3,
  Palette,
  Zap,
  Globe,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: Link2,
    title: "Stripe Connect Integration",
    description:
      "Seamlessly connect your existing Stripe account or create a new one in seconds. We handle the complex API interactions so you can focus on selling.",
    color: "text-indigo-400",
    gradient: "from-indigo-500/20 to-indigo-500/5",
    border: "group-hover:border-indigo-500/50",
    colSpan: "lg:col-span-2",
  },
  {
    icon: Code2,
    title: "Embeddable Anywhere",
    description:
      "Drop our conversion-optimized checkout widget into any website — React, WordPress, Webflow, or plain HTML. No coding required.",
    color: "text-violet-400",
    gradient: "from-violet-500/20 to-violet-500/5",
    border: "group-hover:border-violet-500/50",
    colSpan: "lg:col-span-1",
  },
  {
    icon: TrendingUp,
    title: "Smart Order Bumps",
    description:
      "Increase your Average Order Value (AOV) by 30% with one-click upsells right in the checkout flow. Offer complementary products instantly.",
    color: "text-emerald-400",
    gradient: "from-emerald-500/20 to-emerald-500/5",
    border: "group-hover:border-emerald-500/50",
    colSpan: "lg:col-span-1",
  },
  {
    icon: RefreshCw,
    title: "Subscription Management",
    description:
      "Launch SaaS pricing, memberships, or newsletters with built-in recurring billing logic. We handle trials, upgrades, and churn recovery.",
    color: "text-cyan-400",
    gradient: "from-cyan-500/20 to-cyan-500/5",
    border: "group-hover:border-cyan-500/50",
    colSpan: "lg:col-span-2",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description:
      "Visualize your revenue, conversion rates, and customer growth with our beautiful, real-time dashboard. Know exactly how your business is performing.",
    color: "text-amber-400",
    gradient: "from-amber-500/20 to-amber-500/5",
    border: "group-hover:border-amber-500/50",
    colSpan: "lg:col-span-1",
  },
  {
    icon: Palette,
    title: "White-Label Branding",
    description:
      "Customize every pixel of the checkout experience to match your brand. Colors, fonts, logos — make it truly yours.",
    color: "text-pink-400",
    gradient: "from-pink-500/20 to-pink-500/5",
    border: "group-hover:border-pink-500/50",
    colSpan: "lg:col-span-1",
  },
  {
    icon: Globe,
    title: "Global Payments",
    description:
      "Accept payments from 135+ countries in local currencies. Support for cards, wallets, and bank transfers.",
    color: "text-blue-400",
    gradient: "from-blue-500/20 to-blue-500/5",
    border: "group-hover:border-blue-500/50",
    colSpan: "lg:col-span-1",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16 scroll-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-sm text-indigo-300 mb-6">
            <Zap className="h-4 w-4 fill-indigo-500/20" />
            <span>Power Features</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl mb-6">
            Everything you need to <br />
            <span className="gradient-text">scale your revenue</span>
          </h2>
          <p className="text-lg leading-relaxed text-slate-400">
            A complete suite of tools designed to help creators and SaaS founders
            sell more, manage less, and grow faster.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 ${feature.colSpan} scroll-fade-in`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                {/* Hover Gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                />
                
                {/* Border Glow */}
                <div className={`absolute inset-0 border border-transparent ${feature.border} rounded-3xl transition-colors duration-300 pointer-events-none`} />

                <div className="relative z-10 h-full flex flex-col">
                  <div
                    className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950 border border-white/10 shadow-lg ${feature.color}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-200 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors flex-grow">
                    {feature.description}
                  </p>

                  {/* Decorative corner icon */}
                  <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-white/5 blur-2xl group-hover:bg-indigo-500/20 transition-colors duration-500" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
