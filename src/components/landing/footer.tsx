"use client";

import { useState } from "react";
import {
  Zap,
  Github,
  Twitter,
  Linkedin,
  Mail,
  CreditCard,
  Shield,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

const footerLinks = {
  Product: [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/#pricing" },
    { label: "API Docs", href: "/docs" },
    { label: "Integrations", href: "/help" },
  ],
  Resources: [
    { label: "Help Center", href: "/help" },
    { label: "Documentation", href: "/docs" },
    { label: "Guides", href: "/help" },
    { label: "Blog", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Contact", href: "mailto:boka@agentmail.to" },
    { label: "Partners", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Refund Policy", href: "/refund" },
  ],
};

const socialLinks = [
  { icon: Github, href: "https://github.com/embpay", label: "GitHub" },
  { icon: Twitter, href: "https://twitter.com/embpay", label: "Twitter" },
  { icon: Linkedin, href: "https://linkedin.com/company/embpay", label: "LinkedIn" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="relative border-t border-white/[0.06] bg-slate-950 pt-20 pb-10">
      <div className="mx-auto max-w-7xl px-6">
        {/* CTA Banner */}
        <div className="relative mb-20 overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-transparent p-10 text-center sm:p-14">
          {/* Background glow */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-violet-500/5"
            aria-hidden="true"
          />
          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to start{" "}
              <span className="gradient-text">selling</span>?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-slate-400">
              Join thousands of creators who use EmbPay to sell their products
              online. Start free — no credit card required.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/auth/register"
                className="btn-primary inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold text-white"
              >
                Get Started for Free
              </Link>
              <Link
                href="/help"
                className="btn-secondary inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold text-slate-300"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mb-16 p-8 rounded-2xl glass-card">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Subscribe to our newsletter
                </h3>
                <p className="text-slate-400 text-sm">
                  Get the latest updates on features, tips, and product news.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubscribe} className="flex w-full lg:w-auto gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 lg:w-64 px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                required
              />
              <button
                type="submit"
                className="btn-primary px-6 py-3 rounded-xl text-sm font-semibold text-white whitespace-nowrap"
              >
                {subscribed ? "Subscribed!" : "Subscribe"}
              </button>
            </form>
          </div>
        </div>

        {/* Footer Grid */}
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-6">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
                <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-bold">
                Emb<span className="gradient-text">Pay</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
              All-in-one payment processing and e-commerce. Accept payments,
              sell digital products — do it all with a single platform.
            </p>

            {/* Social Links */}
            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-slate-900/50 border border-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white hover:border-indigo-500/30 hover:bg-indigo-500/10 transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>

            {/* Payment Methods */}
            <div className="mt-6">
              <p className="text-xs text-slate-600 mb-3">Secured by</p>
              <div className="flex items-center gap-3">
                {/* Stripe */}
                <div className="h-8 px-3 rounded-lg bg-slate-900/50 border border-slate-700/50 flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-indigo-500/20 flex items-center justify-center">
                    <Shield className="w-3 h-3 text-indigo-400" />
                  </div>
                  <span className="text-xs font-medium text-slate-400">Stripe</span>
                </div>
                {/* Visa */}
                <div className="h-8 px-3 rounded-lg bg-slate-900/50 border border-slate-700/50 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-medium text-slate-400">Visa</span>
                </div>
                {/* Mastercard */}
                <div className="h-8 px-3 rounded-lg bg-slate-900/50 border border-slate-700/50 flex items-center gap-2">
                  <div className="flex -space-x-1">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  </div>
                  <span className="text-xs font-medium text-slate-400">MC</span>
                </div>
              </div>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
                {category}
              </p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 transition-colors hover:text-white inline-flex items-center gap-1 group"
                    >
                      {link.label}
                      <ChevronRight className="w-3 h-3 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row">
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} EmbPay. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}
