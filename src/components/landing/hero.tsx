"use client";

import { useState, useEffect } from "react";
import {
  ArrowRight,
  Play,
  CreditCard,
  Lock,
  Zap,
  CheckCircle2,
  ShieldCheck,
  Globe,
  Loader2,
} from "lucide-react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";

export default function Hero() {
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success">("idle");

  // Simulated Payment Animation Loop
  useEffect(() => {
    const timer = setInterval(() => {
      setPaymentStatus("processing");
      setTimeout(() => {
        setPaymentStatus("success");
        setTimeout(() => {
          setPaymentStatus("idle");
        }, 3000); // Show success for 3s
      }, 1500); // Process for 1.5s
    }, 8000); // Restart every 8s

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[90vh] overflow-hidden pt-20 flex items-center">
      {/* ═══════════════════════════════════════════════════════
         Background Effects
         ═══════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950" />
      <div className="hero-gradient opacity-40" aria-hidden="true" />
      <div className="grid-pattern absolute inset-0 opacity-[0.15]" aria-hidden="true" />

      {/* Floating Orbs (Framer Motion) */}
      <motion.div
        animate={{ y: [0, -20, 0], opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-20 h-72 w-72 rounded-full bg-indigo-500/20 blur-[100px]"
      />
      <motion.div
        animate={{ y: [0, 30, 0], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-violet-500/10 blur-[120px]"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* ═══════════════════════════════════════════════════════
             Left Column: Copy & CTA
             ═══════════════════════════════════════════════════════ */}
          <div className="max-w-2xl text-center lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-300 backdrop-blur-sm lg:mx-0"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              v1.0 is Live — Join 10,000+ Creators
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl"
            >
              The Payment Layer for the{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-gradient-x relative inline-block">
                Modern Web
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3 text-indigo-500/50"
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 5 Q 50 10 100 5"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                </svg>
              </span>
            </motion.h1>

            {/* Subhead */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-lg leading-relaxed text-slate-400 sm:text-xl"
            >
              Embed checkout forms, sell subscriptions, and manage digital
              products anywhere. No redirection, no code required. Built on
              Stripe.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start"
            >
              <LinkButton href="/auth/register" primary>
                Start Selling Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </LinkButton>

              <LinkButton href="#demo">
                <Play className="h-4 w-4 fill-current text-indigo-400" />
                Live Demo
              </LinkButton>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm font-medium text-slate-500 lg:justify-start"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <span>Stripe Verified Partner</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-500" />
                <span>Global Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                <span>Instant Payouts</span>
              </div>
            </motion.div>
          </div>

          {/* ═══════════════════════════════════════════════════════
             Right Column: Interactive 3D Mockup
             ═══════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative mx-auto w-full max-w-[500px] lg:max-w-none perspective-1000"
          >
            {/* Glow Effect */}
            <div
              className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-violet-500 opacity-20 blur-3xl"
              aria-hidden="true"
            />

            {/* Main Card Container */}
            <motion.div
              whileHover={{ rotateY: 5, rotateX: 5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative transform-style-3d"
            >
              {/* Floating Elements (Badges) */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -left-8 top-12 z-20 hidden lg:block"
              >
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-900/90 p-3 shadow-2xl backdrop-blur-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20 text-green-400">
                    <span className="font-bold text-lg">$</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Revenue</p>
                    <p className="text-sm font-bold text-white">+$1,240.50</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -right-6 bottom-24 z-20 hidden lg:block"
              >
                 <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-900/90 p-3 shadow-2xl backdrop-blur-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">New Order</p>
                    <p className="text-sm font-bold text-white">Design System</p>
                  </div>
                </div>
              </motion.div>

              {/* The Checkout Widget (Glassmorphism) */}
              <div className="checkout-widget relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl md:p-8">
                
                {/* Simulated Success Overlay */}
                <AnimatePresence>
                  {paymentStatus === "success" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-md"
                    >
                      <div className="text-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400"
                        >
                          <CheckCircle2 className="h-8 w-8" />
                        </motion.div>
                        <h3 className="text-xl font-bold text-white">Payment Successful!</h3>
                        <p className="text-slate-400">Check your email for receipt.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20">
                      <Zap className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-white">
                        EmbPay Store
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        <p className="text-xs font-medium text-slate-400">
                          Secure Checkout
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg bg-white/5 p-2">
                    <Lock className="h-4 w-4 text-emerald-400" />
                  </div>
                </div>

                {/* Product Info */}
                <div className="mb-6 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-semibold text-white">
                        SaaS Starter Kit
                      </p>
                      <p className="text-sm text-slate-400">
                        Next.js + Stripe + Tailwind
                      </p>
                    </div>
                    <p className="text-lg font-bold text-white">$149</p>
                  </div>
                </div>

                {/* Smart Order Bump */}
                <div className="mb-6 relative overflow-hidden rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4">
                  <div className="absolute top-0 right-0 rounded-bl-lg bg-indigo-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    Special Offer
                  </div>
                  <label className="flex cursor-pointer items-start gap-3">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="peer h-5 w-5 cursor-pointer rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500/20"
                        readOnly
                      />
                      <div className="pointer-events-none absolute inset-0 hidden items-center justify-center text-white peer-checked:flex">
                         <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">
                        Add "Design Mastery" E-book
                      </p>
                      <p className="text-xs text-indigo-300">
                        One-time offer: <span className="line-through opacity-70">$49</span> <span className="font-bold">$29</span>
                      </p>
                    </div>
                  </label>
                </div>

                {/* Payment Form (Visual) */}
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-400">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="w-full rounded-lg border border-white/10 bg-slate-950/50 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="john@example.com"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-400">
                      Card Details
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full rounded-lg border border-white/10 bg-slate-950/50 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 pl-10"
                        placeholder="4242 4242 4242 4242"
                        readOnly
                      />
                      <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  className={`btn-primary mt-6 w-full rounded-xl py-3.5 text-sm font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                    paymentStatus === "processing"
                      ? "bg-indigo-600/80 cursor-wait"
                      : "shadow-indigo-500/25 hover:shadow-indigo-500/40"
                  }`}
                >
                  {paymentStatus === "processing" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Pay $178.00"
                  )}
                </button>

                {/* Security Footer */}
                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-500">
                  <Lock className="h-3 w-3" />
                  <span>256-bit SSL Encrypted Payment</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function LinkButton({ href, primary, children }: { href: string; primary?: boolean; children: React.ReactNode }) {
  if (primary) {
    return (
      <a
        href={href}
        className="btn-primary group relative inline-flex h-12 items-center justify-center gap-2.5 overflow-hidden rounded-xl px-8 text-base font-semibold text-white transition-all hover:scale-105"
      >
        <span className="relative z-10 flex items-center gap-2">{children}</span>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 transition-opacity group-hover:opacity-100" />
      </a>
    );
  }
  return (
    <a
      href={href}
      className="group inline-flex h-12 items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-8 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/20"
    >
      {children}
    </a>
  );
}
