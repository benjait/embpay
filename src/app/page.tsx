"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ChevronRight } from "lucide-react";

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {/* Navigation - Resend style */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/80 backdrop-blur-md border-b border-neutral-200" : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            EmbPay
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/docs" className="text-sm text-neutral-600 hover:text-black transition-colors">
              Docs
            </Link>
            <Link href="/pricing" className="text-sm text-neutral-600 hover:text-black transition-colors">
              Pricing
            </Link>
            <Link href="/auth/login" className="text-sm text-neutral-600 hover:text-black transition-colors">
              Sign in
            </Link>
            <Link
              href="/auth/register"
              className="px-4 py-2 bg-black text-white text-sm rounded-md hover:bg-neutral-800 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Resend style */}
      <section ref={heroRef} className="pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.1] mb-6">
              Payments for<br />
              developers
            </h1>
            <p className="text-xl md:text-2xl text-neutral-600 leading-relaxed mb-8 max-w-2xl">
              The best way to sell digital products. Simple integration, zero platform fees, and built for developers who ship fast.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-md hover:bg-neutral-800 transition-all text-base"
              >
                Start for free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-neutral-300 rounded-md hover:border-neutral-400 transition-all text-base"
              >
                Documentation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Code Example - Terminal style like Resend */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="rounded-xl overflow-hidden border border-neutral-200 bg-[#fafafa] shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-3 bg-[#f0f0f0] border-b border-neutral-200">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
              </div>
              <span className="text-xs text-neutral-500 ml-2 font-mono">sdk.js</span>
            </div>
            <div className="p-6 overflow-x-auto">
              <pre className="text-sm font-mono leading-relaxed">
                <code>
                  <span className="text-[#d73a49]">import</span> <span className="text-[#24292e]">{ EmbPay }</span> <span className="text-[#d73a49]">from</span> <span className="text-[#032f62]">'@embpay/sdk'</span>;
                  {"\n"}
                  {"\n"}
                  <span className="text-[#d73a49]">const</span> <span className="text-[#24292e]">embpay</span> <span className="text-[#d73a49]">=</span> <span className="text-[#d73a49]">new</span> <span className="text-[#6f42c1]">EmbPay</span>({ <span className="text-[#e36209]">apiKey</span>: <span className="text-[#032f62]">process.env.EMBPAY_KEY</span> });
                  {"\n"}
                  {"\n"}
                  <span className="text-[#6a737d]">// Create a product</span>
                  {"\n"}
                  <span className="text-[#d73a49]">const</span> <span className="text-[#24292e]">product</span> <span className="text-[#d73a49]">=</span> <span className="text-[#d73a49]">await</span> <span className="text-[#24292e]">embpay.products</span>.<span className="text-[#6f42c1]">create</span>({
                  {"\n"}
                  {"  "}<span className="text-[#24292e]">name</span>: <span className="text-[#032f62]">'My SaaS License'</span>,
                  {"\n"}
                  {"  "}<span className="text-[#24292e]">price</span>: <span className="text-[#005cc5]">4900</span>, <span className="text-[#6a737d]">// $49.00</span>
                  {"\n"}
                  {"  "}<span className="text-[#24292e]">type</span>: <span className="text-[#032f62]">'one_time_license'</span>,
                  {"\n"}
                  });
                  {"\n"}
                  {"\n"}
                  <span className="text-[#6a737d]">// Create checkout</span>
                  {"\n"}
                  <span className="text-[#d73a49]">const</span> <span className="text-[#24292e]">checkout</span> <span className="text-[#d73a49]">=</span> <span className="text-[#d73a49]">await</span> <span className="text-[#24292e]">embpay.checkout</span>.<span className="text-[#6f42c1]">create</span>({
                  {"\n"}
                  {"  "}<span className="text-[#24292e]">productId</span>: <span className="text-[#24292e]">product.id</span>,
                  {"\n"}
                  {"  "}<span className="text-[#24292e]">successUrl</span>: <span className="text-[#032f62]">'https://yoursite.com/success'</span>,
                  {"\n"}
                  });
                  {"\n"}
                  {"\n"}
                  <span className="text-[#24292e]">console</span>.<span className="text-[#6f42c1]">log</span>(<span className="text-[#24292e]">checkout.url</span>); <span className="text-[#6a737d]">// → Send to customer</span>
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Integrate section */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
                Integrate
              </h2>
              <p className="text-lg text-neutral-600 leading-relaxed">
                A simple, elegant interface so you can start selling in minutes. It fits right into your code with SDKs for your favorite programming languages.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: "JavaScript", color: "bg-yellow-100 text-yellow-800" },
                { name: "TypeScript", color: "bg-blue-100 text-blue-800" },
                { name: "React", color: "bg-cyan-100 text-cyan-800" },
                { name: "Next.js", color: "bg-neutral-100 text-neutral-800" },
                { name: "WordPress", color: "bg-indigo-100 text-indigo-800" },
                { name: "REST API", color: "bg-green-100 text-green-800" },
              ].map((sdk) => (
                <div
                  key={sdk.name}
                  className={`px-4 py-3 rounded-lg ${sdk.color} font-medium text-sm`}
                >
                  {sdk.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Developer experience */}
      <section className="py-24 bg-neutral-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
              First-class developer experience
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              We are a team of engineers who love building tools for other engineers. Our goal is to create the payment platform we&apos;ve always wished we had.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl border border-neutral-200">
              <h3 className="font-semibold text-lg mb-3">License Management</h3>
              <p className="text-neutral-600 text-sm leading-relaxed">
                Auto-generate license keys with every purchase. Track activations, set device limits, and prevent piracy—all built-in.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-neutral-200">
              <h3 className="font-semibold text-lg mb-3">Webhooks</h3>
              <p className="text-neutral-600 text-sm leading-relaxed">
                Receive real-time notifications for every purchase, refund, or license activation. HMAC signed for security.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-neutral-200">
              <h3 className="font-semibold text-lg mb-3">Zero Platform Fees</h3>
              <p className="text-neutral-600 text-sm leading-relaxed">
                We charge a flat monthly fee. You keep 100% of your revenue. No percentage cuts, no hidden costs, no surprises.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <blockquote className="text-2xl md:text-3xl font-medium leading-relaxed mb-8">
            "EmbPay is transforming payments for indie developers. Simple interface, easy integrations, zero fees. What else could we ask for."
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-neutral-200"></div>
            <div className="text-left">
              <div className="font-semibold">Alex Johnson</div>
              <div className="text-sm text-neutral-600">Founder, DevTools Inc</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-24 border-t border-neutral-200">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-center mb-16">
            Everything in your control
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {[
              {
                title: "TypeScript SDK",
                description: "Fully typed SDK with auto-complete. Built for modern frameworks.",
              },
              {
                title: "License Verification API",
                description: "Verify licenses with a single API call. Machine tracking included.",
              },
              {
                title: "Secure Webhooks",
                description: "HMAC signature verification. Automatic retries with backoff.",
              },
              {
                title: "WordPress Plugin",
                description: "Drop-in plugin with shortcodes. Zero configuration needed.",
              },
              {
                title: "Real-time Analytics",
                description: "Track revenue, conversions, and top products. Export to CSV.",
              },
              {
                title: "Admin Dashboard",
                description: "Manage products, orders, and refunds in one place.",
              },
            ].map((feature) => (
              <div key={feature.title} className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <Check className="h-5 w-5 text-neutral-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 bg-neutral-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
              Simple pricing
            </h2>
            <p className="text-lg text-neutral-600">
              Start free. Scale when you&apos;re ready.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Free",
                price: "$0",
                description: "For getting started",
                features: ["10 products", "100 orders/month", "Basic analytics", "Email support"],
              },
              {
                name: "Pro",
                price: "$29",
                period: "/month",
                description: "For growing businesses",
                features: ["Unlimited products", "Unlimited orders", "License keys", "Priority support"],
                popular: true,
              },
              {
                name: "Scale",
                price: "$79",
                period: "/month",
                description: "For high-volume sellers",
                features: ["Everything in Pro", "API access", "White-label", "Dedicated support"],
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-xl p-8 border ${
                  plan.popular ? "border-black shadow-lg" : "border-neutral-200"
                }`}
              >
                {plan.popular && (
                  <div className="inline-block px-3 py-1 bg-black text-white text-xs rounded-full mb-4">
                    Most popular
                  </div>
                )}
                <div className="mb-6">
                  <div className="text-sm text-neutral-600 mb-1">{plan.name}</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-semibold">{plan.price}</span>
                    {plan.period && <span className="text-neutral-600">{plan.period}</span>}
                  </div>
                  <div className="text-sm text-neutral-600 mt-1">{plan.description}</div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/auth/register"
                  className={`block w-full text-center py-2.5 rounded-md transition-colors font-medium ${
                    plan.popular
                      ? "bg-black text-white hover:bg-neutral-800"
                      : "border border-neutral-300 hover:border-neutral-400"
                  }`}
                >
                  Get started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6">
            Email reimagined.<br />
            Available today.
          </h2>
          <p className="text-xl text-neutral-600 mb-12">
            Start sending with EmbPay today. No credit card required.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white rounded-md hover:bg-neutral-800 transition-colors text-lg"
          >
            Get Started
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="font-semibold mb-4">EmbPay</div>
              <p className="text-sm text-neutral-600">Payments infrastructure for developers.</p>
            </div>
            <div>
              <div className="text-sm font-medium mb-3">Product</div>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li><Link href="/docs" className="hover:text-black">Documentation</Link></li>
                <li><Link href="/pricing" className="hover:text-black">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <div className="text-sm font-medium mb-3">Legal</div>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li><Link href="/privacy" className="hover:text-black">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-black">Terms</Link></li>
              </ul>
            </div>
            <div>
              <div className="text-sm font-medium mb-3">Connect</div>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li><a href="#" className="hover:text-black">Twitter</a></li>
                <li><a href="#" className="hover:text-black">GitHub</a></li>
              </ul>
            </div>
          </div>
          <div className="text-sm text-neutral-600">
            © 2026 EmbPay. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
