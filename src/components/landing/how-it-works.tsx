import { Wallet, PackagePlus, Code2, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Wallet,
    title: "Connect Stripe",
    description:
      "Link your Stripe account in one click. We automatically sync your products, customers, and payouts.",
    color: "bg-indigo-500",
    shadow: "shadow-indigo-500/50",
  },
  {
    icon: PackagePlus,
    title: "Create Products",
    description:
      "Add digital goods, subscriptions, or services. Set prices, add order bumps, and configure delivery.",
    color: "bg-violet-500",
    shadow: "shadow-violet-500/50",
  },
  {
    icon: Code2,
    title: "Embed & Sell",
    description:
      "Copy a single line of code to embed the checkout anywhere. Start accepting payments instantly.",
    color: "bg-emerald-500",
    shadow: "shadow-emerald-500/50",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background Decorative Line */}
      <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent -translate-y-1/2 hidden lg:block" />
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Start selling in <span className="gradient-text">3 simple steps</span>
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            No complex setup. No coding knowledge required. Just connect and go.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="relative flex flex-col items-center text-center scroll-fade-in group"
                style={{ animationDelay: `${idx * 200}ms` }}
              >
                {/* Step Number Badge */}
                <div className="absolute -top-4 -right-4 h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-slate-400 z-20 group-hover:bg-indigo-500 group-hover:text-white group-hover:border-indigo-400 transition-all">
                  {idx + 1}
                </div>

                {/* Icon Circle with Glow */}
                <div className="relative mb-8">
                  <div className={`absolute inset-0 rounded-full blur-xl opacity-20 ${step.color} group-hover:opacity-40 transition-opacity duration-500`} />
                  <div className={`relative flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-900 border border-white/10 shadow-xl transition-transform duration-300 group-hover:-translate-y-2 group-hover:border-white/20`}>
                    <Icon className={`h-8 w-8 text-white`} />
                  </div>
                  
                  {/* Connecting Arrow (Desktop Only) */}
                  {idx < steps.length - 1 && (
                    <div className="absolute top-1/2 -right-[calc(50%+2rem)] hidden w-[calc(100%-4rem)] -translate-y-1/2 lg:block">
                      <ArrowRight className="mx-auto h-6 w-6 text-slate-700 animate-pulse" />
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">
                  {step.title}
                </h3>
                <p className="text-base text-slate-400 leading-relaxed max-w-sm mx-auto">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
