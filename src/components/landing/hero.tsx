import {
  ArrowRight,
  Play,
  CreditCard,
  Lock,
  CheckCircle2,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-16">
      {/* Animated Background */}
      <div className="hero-gradient" aria-hidden="true" />
      <div className="grid-pattern absolute inset-0" aria-hidden="true" />

      {/* Floating Orbs */}
      <div className="orb orb-1" aria-hidden="true" />
      <div className="orb orb-2" aria-hidden="true" />
      <div className="orb orb-3" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-24 lg:pt-32">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left — Copy */}
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="fade-in-up mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Now in Public Beta — Free to Start
            </div>

            {/* Headline */}
            <h1 className="fade-in-up fade-in-up-delay-1 text-5xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
              Accept Payments{" "}
              <span className="gradient-text">Anywhere.</span>
              <br />
              Embed{" "}
              <span className="gradient-text">Everywhere.</span>
            </h1>

            {/* Sub-headline */}
            <p className="fade-in-up fade-in-up-delay-2 mt-6 max-w-xl text-lg leading-relaxed text-slate-400 sm:text-xl">
              An all-in-one payment processing and e-commerce solution. Accept
              payments, sell digital products and more — do it all with a single
              platform.
            </p>

            {/* CTAs */}
            <div className="fade-in-up fade-in-up-delay-3 mt-10 flex flex-wrap gap-4">
              <a
                href="/auth/register"
                className="btn-primary group inline-flex items-center gap-2.5 rounded-xl px-7 py-3.5 text-sm font-semibold text-white"
              >
                Start Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="#demo"
                className="btn-secondary group inline-flex items-center gap-2.5 rounded-xl px-7 py-3.5 text-sm font-semibold text-slate-300"
              >
                <Play className="h-4 w-4 text-indigo-400" />
                See Demo
              </a>
            </div>

            {/* Social Proof */}
            <div className="fade-in-up fade-in-up-delay-4 mt-12 flex items-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                No credit card required
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                5-minute setup
              </div>
            </div>
          </div>

          {/* Right — Mock Checkout Widget */}
          <div className="fade-in-up fade-in-up-delay-3 relative hidden lg:block">
            {/* Glow behind widget */}
            <div
              className="absolute -inset-10 rounded-3xl bg-indigo-500/10 blur-3xl"
              aria-hidden="true"
            />

            <div className="checkout-widget relative rounded-2xl p-6">
              {/* Widget Header */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20">
                    <CreditCard className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      EmbPay Checkout
                    </p>
                    <p className="text-xs text-slate-500">Secure payment</p>
                  </div>
                </div>
                <Lock className="h-4 w-4 text-emerald-400" />
              </div>

              {/* Product */}
              <div className="mb-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">
                      Pro Design Course
                    </p>
                    <p className="text-xs text-slate-500">
                      Lifetime access · Instant delivery
                    </p>
                  </div>
                  <p className="text-lg font-bold text-white">$97</p>
                </div>
              </div>

              {/* Order Bump */}
              <div className="mb-6 rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="mt-0.5 h-4 w-4 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500/20"
                    readOnly
                  />
                  <div>
                    <p className="text-sm font-medium text-white">
                      🔥 Add Figma Templates — $27
                    </p>
                    <p className="text-xs text-slate-400">
                      50+ premium templates (65% off)
                    </p>
                  </div>
                </label>
              </div>

              {/* Email Field */}
              <div className="mb-4">
                <label className="mb-1.5 block text-xs font-medium text-slate-400">
                  Email address
                </label>
                <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-slate-500">
                  you@example.com
                </div>
              </div>

              {/* Card Field */}
              <div className="mb-6">
                <label className="mb-1.5 block text-xs font-medium text-slate-400">
                  Card details
                </label>
                <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-slate-500">
                  4242 •••• •••• ••••
                </div>
              </div>

              {/* Pay Button */}
              <button className="btn-primary w-full rounded-xl py-3 text-sm font-semibold text-white">
                Pay $124.00
              </button>

              {/* Footer */}
              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-600">
                <Lock className="h-3 w-3" />
                Secured by EmbPay + Stripe
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent" />
    </section>
  );
}
