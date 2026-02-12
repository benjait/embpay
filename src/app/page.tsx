"use client";

import Link from "next/link";
import { ArrowRight, Check, Code2, Zap, Shield, Globe, DollarSign } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Navigation */}
      <nav className="border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold">
            EmbPay
          </Link>
          <div className="flex items-center gap-8">
            <Link href="/docs" className="text-sm text-neutral-600 hover:text-black">
              Documentation
            </Link>
            <Link href="/pricing" className="text-sm text-neutral-600 hover:text-black">
              Pricing
            </Link>
            <Link href="/auth/login" className="text-sm text-neutral-600 hover:text-black">
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

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-32 pb-24 text-center">
        <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-6">
          Payments for<br />developers
        </h1>
        <p className="text-xl text-neutral-600 mb-12 max-w-2xl mx-auto">
          The best way to sell digital products. Simple integration, zero platform fees, and built for developers.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-md hover:bg-neutral-800 transition-colors"
          >
            Start for free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/docs"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-neutral-300 rounded-md hover:border-neutral-400 transition-colors"
          >
            Read documentation
          </Link>
        </div>
        <p className="text-sm text-neutral-500 mt-6">
          No credit card required · 0% platform fees · Free plan available
        </p>
      </section>

      {/* Code Example */}
      <section className="max-w-5xl mx-auto px-6 pb-32">
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-xs text-neutral-500 ml-2">Quick Start</span>
          </div>
          <pre className="text-sm font-mono overflow-x-auto">
            <code className="text-neutral-800">{`import { EmbPay } from '@embpay/sdk';

const embpay = new EmbPay({ apiKey: process.env.EMBPAY_KEY });

// Create a product
const product = await embpay.products.create({
  name: 'My SaaS License',
  price: 4900, // $49.00
  type: 'one_time_license',
});

// Generate checkout URL
const checkout = await embpay.checkout.create({
  productId: product.id,
  successUrl: 'https://yoursite.com/success',
});

console.log(checkout.url); // → Send to customer`}</code>
          </pre>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-32 border-t border-neutral-200">
        <h2 className="text-4xl font-bold text-center mb-4">
          Everything you need
        </h2>
        <p className="text-center text-neutral-600 mb-16 max-w-2xl mx-auto">
          Built by developers, for developers. No bloat, no complexity—just what you need to sell digital products.
        </p>

        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <div className="w-10 h-10 rounded-md bg-neutral-100 flex items-center justify-center mb-4">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Fast integration</h3>
            <p className="text-neutral-600 text-sm leading-relaxed">
              Get started in minutes with our JavaScript SDK, WordPress plugin, or simple REST API. Drop in a script tag and you're done.
            </p>
          </div>

          <div>
            <div className="w-10 h-10 rounded-md bg-neutral-100 flex items-center justify-center mb-4">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold mb-2">License key system</h3>
            <p className="text-neutral-600 text-sm leading-relaxed">
              Auto-generate software licenses with every purchase. Track activations, set limits, and prevent piracy—all built-in.
            </p>
          </div>

          <div>
            <div className="w-10 h-10 rounded-md bg-neutral-100 flex items-center justify-center mb-4">
              <DollarSign className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Zero platform fees</h3>
            <p className="text-neutral-600 text-sm leading-relaxed">
              We charge a flat monthly fee. You keep 100% of your revenue. No surprises, no percentage cuts, no hidden costs.
            </p>
          </div>

          <div>
            <div className="w-10 h-10 rounded-md bg-neutral-100 flex items-center justify-center mb-4">
              <Code2 className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Embeddable checkout</h3>
            <p className="text-neutral-600 text-sm leading-relaxed">
              Pop-up modal, redirect, or inline iframe. Customizable to match your brand. Works anywhere—React, Vue, vanilla JS.
            </p>
          </div>

          <div>
            <div className="w-10 h-10 rounded-md bg-neutral-100 flex items-center justify-center mb-4">
              <Globe className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Stripe Connect</h3>
            <p className="text-neutral-600 text-sm leading-relaxed">
              Use your own Stripe account. Full control over your money, instant payouts, and complete transaction history.
            </p>
          </div>

          <div>
            <div className="w-10 h-10 rounded-md bg-neutral-100 flex items-center justify-center mb-4">
              <Check className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Webhooks & APIs</h3>
            <p className="text-neutral-600 text-sm leading-relaxed">
              Real-time event notifications for every purchase, refund, or license activation. RESTful API for full programmatic control.
            </p>
          </div>
        </div>
      </section>

      {/* Developer Quote */}
      <section className="max-w-4xl mx-auto px-6 py-32 border-t border-neutral-200">
        <blockquote className="text-2xl font-medium text-center mb-6">
          "EmbPay is transforming payments for indie developers. Simple interface, easy integrations, zero fees. What else could we ask for."
        </blockquote>
        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full bg-neutral-200"></div>
          <div>
            <div className="font-medium">Alex Johnson</div>
            <div className="text-sm text-neutral-600">Founder, DevTools Inc</div>
          </div>
        </div>
      </section>

      {/* Technical Features */}
      <section className="max-w-7xl mx-auto px-6 py-32 border-t border-neutral-200">
        <h2 className="text-4xl font-bold text-center mb-16">
          Production-ready infrastructure
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "TypeScript SDK",
              description: "Fully typed SDK with auto-complete. Built for modern frameworks like Next.js, Remix, and Astro.",
            },
            {
              title: "License verification API",
              description: "Verify licenses in your app with a single API call. Includes machine-based activation tracking.",
            },
            {
              title: "Secure webhook delivery",
              description: "HMAC signature verification on every webhook. Automatic retries with exponential backoff.",
            },
            {
              title: "WordPress plugin",
              description: "Drop-in plugin with shortcodes for buttons, pricing tables, and product cards. Zero config needed.",
            },
            {
              title: "Real-time analytics",
              description: "Track revenue, conversion rates, and top products. Export data via CSV or connect to your BI tool.",
            },
            {
              title: "Admin dashboard",
              description: "Manage products, view orders, handle refunds, and monitor platform health—all in one place.",
            },
          ].map((feature, i) => (
            <div key={i} className="border border-neutral-200 rounded-lg p-6 hover:border-neutral-300 transition-colors">
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-6 py-32 border-t border-neutral-200">
        <h2 className="text-4xl font-bold text-center mb-4">
          Simple, transparent pricing
        </h2>
        <p className="text-center text-neutral-600 mb-16">
          Start free. Scale when you're ready. No hidden fees.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: "Free",
              price: "$0",
              period: "forever",
              features: ["10 products", "100 orders/month", "Basic analytics", "Email support"],
            },
            {
              name: "Pro",
              price: "$29",
              period: "/month",
              features: ["Unlimited products", "Unlimited orders", "License keys", "Priority support"],
              popular: true,
            },
            {
              name: "Scale",
              price: "$79",
              period: "/month",
              features: ["Everything in Pro", "API access", "White-label", "Dedicated support"],
            },
          ].map((plan, i) => (
            <div
              key={i}
              className={`border rounded-lg p-8 ${
                plan.popular
                  ? "border-black shadow-lg"
                  : "border-neutral-200"
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
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-neutral-600">{plan.period}</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/register"
                className={`block w-full text-center py-2 rounded-md transition-colors ${
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
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-6 py-32 text-center border-t border-neutral-200">
        <h2 className="text-5xl font-bold mb-6">
          Start selling today
        </h2>
        <p className="text-xl text-neutral-600 mb-12">
          Join hundreds of developers already using EmbPay to sell digital products.
        </p>
        <Link
          href="/auth/register"
          className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white rounded-md hover:bg-neutral-800 transition-colors text-lg"
        >
          Get started for free
          <ArrowRight className="h-5 w-5" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 mt-32">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="font-semibold mb-4">EmbPay</div>
              <p className="text-sm text-neutral-600">
                Payments infrastructure for developers.
              </p>
            </div>
            <div>
              <div className="text-sm font-medium mb-3">Product</div>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li><Link href="/docs" className="hover:text-black">Documentation</Link></li>
                <li><Link href="/docs/sdk" className="hover:text-black">SDK</Link></li>
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
                <li><a href="https://twitter.com" className="hover:text-black">Twitter</a></li>
                <li><a href="https://github.com" className="hover:text-black">GitHub</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-neutral-200 text-sm text-neutral-600 text-center">
            © 2026 EmbPay. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
