"use client";

import { useState, useEffect } from "react";
import { Menu, X, Zap, ChevronRight } from "lucide-react";
import Link from "next/link";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/[0.08] bg-slate-950/80 backdrop-blur-md shadow-lg shadow-black/5"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* ═══════════════════════════════════════════════════════
           Logo
           ═══════════════════════════════════════════════════════ */}
        <Link href="/" className="flex items-center gap-2.5 group relative z-50">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20 transition-all duration-300 group-hover:shadow-indigo-500/40 group-hover:scale-105">
            <Zap className="h-4 w-4 text-white fill-white/20" strokeWidth={2.5} />
            <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20 group-hover:ring-white/30" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            Emb<span className="text-indigo-400">Pay</span>
          </span>
        </Link>

        {/* ═══════════════════════════════════════════════════════
           Desktop Navigation
           ═══════════════════════════════════════════════════════ */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-slate-400 transition-colors hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════
           Desktop CTA
           ═══════════════════════════════════════════════════════ */}
        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/auth/login"
            className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
          >
            Log in
          </Link>
          <Link
            href="/auth/register"
            className="btn-primary group relative inline-flex items-center gap-2 overflow-hidden rounded-lg px-5 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/10 transition-all hover:shadow-indigo-500/25 hover:-translate-y-0.5"
          >
            <span className="relative z-10">Get Started</span>
            <ChevronRight className="relative z-10 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-100 group-hover:opacity-90" />
          </Link>
        </div>

        {/* ═══════════════════════════════════════════════════════
           Mobile Menu Toggle
           ═══════════════════════════════════════════════════════ */}
        <button
          className="relative z-50 flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-slate-300 transition-colors hover:bg-white/5 hover:text-white md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════
         Mobile Menu Overlay
         ═══════════════════════════════════════════════════════ */}
      <div
        className={`fixed inset-0 z-40 bg-slate-950/95 backdrop-blur-xl transition-all duration-300 md:hidden ${
          mobileOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
      >
        <div className="flex h-full flex-col justify-center px-8 pb-10 pt-24">
          <div className="space-y-4">
            {navLinks.map((link, idx) => (
              <Link
                key={link.label}
                href={link.href}
                className={`block text-2xl font-bold text-slate-300 transition-all hover:text-white hover:translate-x-2 ${
                  mobileOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
                style={{ transitionDelay: `${idx * 50}ms` }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mt-12 space-y-4 border-t border-white/10 pt-8">
            <Link
              href="/auth/login"
              className="flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-base font-semibold text-white transition-colors hover:bg-white/10"
              onClick={() => setMobileOpen(false)}
            >
              Log in
            </Link>
            <Link
              href="/auth/register"
              className="btn-primary flex w-full items-center justify-center rounded-xl px-6 py-4 text-base font-bold text-white shadow-lg shadow-indigo-500/20"
              onClick={() => setMobileOpen(false)}
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
