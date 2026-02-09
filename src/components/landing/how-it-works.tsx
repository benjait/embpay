import { Link2, Package, Rocket } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Link2,
    title: "Connect Stripe",
    description:
      "Link your Stripe account in one click. We use Stripe Connect for secure, instant onboarding — your money goes directly to you.",
    color: "from-indigo-500 to-indigo-600",
    iconColor: "text-indigo-400",
    hasConnector: true,
  },
  {
    number: "02",
    icon: Package,
    title: "Create Products",
    description:
      "Set up products in minutes — one-time payments, subscriptions, payment plans. Add order bumps and upsells to maximize revenue.",
    color: "from-violet-500 to-violet-600",
    iconColor: "text-violet-400",
    hasConnector: true,
  },
  {
    number: "03",
    icon: Rocket,
    title: "Embed & Sell",
    description:
      "Grab your embed code, drop it on any page, and start selling. Share links, embed iframes, or use our hosted checkout.",
    color: "from-cyan-500 to-cyan-600",
    iconColor: "text-cyan-400",
    hasConnector: false,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-28 sm:py-36">
      <div className="section-divider absolute left-0 right-0 top-0" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center scroll-fade-in">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-indigo-400">
            How It Works
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Up and running in{" "}
            <span className="gradient-text">three steps</span>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-400">
            From zero to accepting payments in under five minutes. No developers
            needed.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-20 grid gap-10 md:grid-cols-3 md:gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className={`relative text-center scroll-fade-in ${step.hasConnector ? "step-connector" : ""}`}
              >
                {/* Number Badge */}
                <div className="relative mx-auto mb-8">
                  {/* Glow ring */}
                  <div
                    className={`absolute inset-0 mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br ${step.color} opacity-20 blur-xl`}
                  />
                  {/* Icon container */}
                  <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-white/[0.08] bg-slate-900/80 shadow-2xl">
                    <Icon className={`h-8 w-8 ${step.iconColor}`} />
                  </div>
                  {/* Step number */}
                  <div className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white shadow-lg shadow-indigo-500/30">
                    {step.number}
                  </div>
                </div>

                <h3 className="mb-3 text-xl font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mx-auto max-w-xs text-sm leading-relaxed text-slate-400">
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
