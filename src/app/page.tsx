"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Zap,
  Shield,
  Code,
  TrendingUp,
  Users,
  DollarSign,
  Sparkles,
  CheckCircle2,
  Star,
} from "lucide-react";

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 mb-8 animate-fade-in">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span className="text-sm text-slate-300">Trusted by 1,000+ creators</span>
          </div>

          {/* Main headline */}
          <h1 className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-white via-amber-200 to-amber-500 bg-clip-text text-transparent leading-tight animate-fade-in-up">
            From Idea to
            <br />
            First Sale in
            <br />
            <span className="text-amber-400">5 Minutes</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto animate-fade-in-up delay-100">
            No code. No complexity. No BS.
            <br />
            Just <span className="text-white font-semibold">connect Stripe, add your product, and sell.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in-up delay-200">
            <Link
              href="/auth/register"
              className="group px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full text-lg font-bold hover:scale-105 transition-all shadow-2xl shadow-amber-500/50 flex items-center gap-2"
            >
              Start Free Now
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/demo"
              className="px-8 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-lg font-semibold hover:bg-white/10 transition-all flex items-center gap-2"
            >
              Watch Demo
              <span className="text-amber-400">→</span>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-8 text-sm text-slate-500 animate-fade-in-up delay-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>0% transaction fees</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Setup in 5 min</span>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-32 relative">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4">
              The Problem We Solved
            </h2>
            <p className="text-xl text-slate-400">
              Selling digital products shouldn&apos;t require a CS degree
            </p>
          </div>

          <div className="space-y-8">
            {/* Pain point 1 */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-2xl">
                  😤
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Gumroad takes 10% + fees</h3>
                  <p className="text-slate-400 text-lg">
                    You work hard. They take a cut. Every. Single. Sale.
                    <br />
                    <span className="text-red-400 font-semibold">That&apos;s $100 on a $1,000 product.</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Pain point 2 */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center text-2xl">
                  🤦
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Custom solutions take weeks</h3>
                  <p className="text-slate-400 text-lg">
                    Hire a dev. Wait 2 weeks. Debug. Repeat.
                    <br />
                    <span className="text-orange-400 font-semibold">By then, your competitor already shipped.</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Solution */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-2xl">
                  ✨
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">EmbPay: Ship in 5 minutes. Keep 100%.</h3>
                  <p className="text-slate-400 text-lg">
                    Connect your Stripe. Add products. Embed checkout anywhere.
                    <br />
                    <span className="text-emerald-400 font-semibold">No code. No fees. No waiting.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent"></div>
        
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4">The Numbers</h2>
            <p className="text-xl text-slate-400">Real results from real creators</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { label: "Merchants", value: "1,247", icon: Users, color: "text-blue-400" },
              { label: "Products Sold", value: "24,891", icon: TrendingUp, color: "text-emerald-400" },
              { label: "Revenue Processed", value: "$1.2M", icon: DollarSign, color: "text-amber-400" },
              { label: "Avg Setup Time", value: "4.2 min", icon: Zap, color: "text-purple-400" },
            ].map((stat, i) => (
              <div
                key={i}
                className="text-center p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:scale-105 transition-transform"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <stat.icon className={`h-12 w-12 ${stat.color} mx-auto mb-4`} />
                <div className={`text-4xl font-black mb-2 ${stat.color}`}>
                  {isVisible ? stat.value : "0"}
                </div>
                <div className="text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4">Everything You Need</h2>
            <p className="text-xl text-slate-400">And nothing you don&apos;t</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "5-Minute Setup",
                description: "Connect Stripe, add products, start selling. Seriously, that's it.",
              },
              {
                icon: Code,
                title: "Embed Anywhere",
                description: "WordPress plugin, JS SDK, or simple payment links. Your choice.",
              },
              {
                icon: Shield,
                title: "License Keys",
                description: "Auto-generate software licenses. Track activations. Prevent piracy.",
              },
              {
                icon: DollarSign,
                title: "0% Platform Fees",
                description: "We charge $29/mo for Pro. You keep 100% of your sales. Forever.",
              },
              {
                icon: TrendingUp,
                title: "Real-Time Analytics",
                description: "See your revenue, conversions, and top products at a glance.",
              },
              {
                icon: Users,
                title: "No Coding Required",
                description: "If you can copy-paste, you can use EmbPay. It's that simple.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-amber-500/50 transition-all hover:scale-105"
              >
                <feature.icon className="h-12 w-12 text-amber-400 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-400 text-lg">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-32 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4">Loved by Creators</h2>
            <p className="text-xl text-slate-400">See what people are saying</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "Course Creator",
                avatar: "👩‍💻",
                text: "Made $12K in my first month. Setup took 6 minutes. I'm never going back to Gumroad.",
                stars: 5,
              },
              {
                name: "Marcus Johnson",
                role: "SaaS Founder",
                avatar: "👨‍💼",
                text: "License key system saved me weeks of dev work. Worth every penny of the Pro plan.",
                stars: 5,
              },
              {
                name: "Emma Rodriguez",
                role: "Digital Artist",
                avatar: "🎨",
                text: "Embedded checkout on my portfolio site. Sold 47 art packs in week one. Clean & fast.",
                stars: 5,
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className="p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-amber-500/30 transition-all"
              >
                <div className="flex gap-1 mb-4">
                  {Array(testimonial.stars)
                    .fill(0)
                    .map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                    ))}
                </div>
                <p className="text-lg text-slate-300 mb-6">&ldquo;{testimonial.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-slate-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4">Simple Pricing</h2>
            <p className="text-xl text-slate-400">Start free. Scale when you&apos;re ready.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Free",
                price: "$0",
                period: "forever",
                features: ["10 products", "100 orders/month", "Basic analytics", "Email support"],
                cta: "Start Free",
                popular: false,
              },
              {
                name: "Pro",
                price: "$29",
                period: "/month",
                features: [
                  "Unlimited products",
                  "Unlimited orders",
                  "License keys",
                  "Priority support",
                  "Custom branding",
                ],
                cta: "Start Pro Trial",
                popular: true,
              },
              {
                name: "Scale",
                price: "$79",
                period: "/month",
                features: [
                  "Everything in Pro",
                  "API access",
                  "White-label",
                  "Custom domain",
                  "Dedicated support",
                ],
                cta: "Contact Sales",
                popular: false,
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`relative p-8 rounded-2xl border transition-all hover:scale-105 ${
                  plan.popular
                    ? "bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/50 shadow-2xl shadow-amber-500/20"
                    : "bg-white/5 border-white/10"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-sm font-bold">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="text-lg text-slate-400 mb-2">{plan.name}</div>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-black">{plan.price}</span>
                    <span className="text-slate-500">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-slate-300">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/auth/register"
                  className={`block w-full py-3 rounded-lg text-center font-semibold transition-all ${
                    plan.popular
                      ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:scale-105 shadow-xl shadow-amber-500/30"
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-amber-500/20 blur-3xl"></div>
        
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-6xl font-black mb-6 bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent">
            Ready to Ship?
          </h2>
          <p className="text-2xl text-slate-400 mb-12">
            Join 1,000+ creators making real money with EmbPay
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full text-xl font-bold hover:scale-105 transition-all shadow-2xl shadow-amber-500/50"
          >
            Start Free — No Credit Card Required
            <ArrowRight className="h-6 w-6" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-2xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                EmbPay
              </div>
              <p className="text-sm text-slate-500">
                The fastest way to sell digital products.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Product</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/docs/sdk" className="hover:text-white transition-colors">SDK</Link></li>
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Legal</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
                <li><Link href="/refund" className="hover:text-white transition-colors">Refund Policy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Connect</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="https://twitter.com/embpay" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="https://github.com/embpay" className="hover:text-white transition-colors">GitHub</a></li>
                <li><a href="mailto:hello@embpay.com" className="hover:text-white transition-colors">Email</a></li>
              </ul>
            </div>
          </div>
          <div className="text-center text-sm text-slate-600 border-t border-white/5 pt-8">
            © 2026 EmbPay. All rights reserved.
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        .delay-100 {
          animation-delay: 100ms;
        }
        .delay-200 {
          animation-delay: 200ms;
        }
        .delay-300 {
          animation-delay: 300ms;
        }
      `}</style>
    </div>
  );
}
