import Link from "next/link";
import { Zap, Github, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-white/10 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20 transition-all duration-300 group-hover:shadow-indigo-500/40 group-hover:scale-105">
                <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold text-white">EmbPay</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              The all-in-one payment infrastructure for modern creators and SaaS businesses. Built on Stripe.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-2 sm:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-3">
                <li><Link href="/#features" className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">Features</Link></li>
                <li><Link href="/#pricing" className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">Pricing</Link></li>
                <li><Link href="/docs" className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">API Docs</Link></li>
                <li><Link href="/changelog" className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">Changelog</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-3">
                <li><Link href="/help" className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">Help Center</Link></li>
                <li><a href="mailto:support@embpay.com" className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">Contact Us</a></li>
                <li><Link href="/status" className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">System Status</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-3">
                <li><Link href="/privacy" className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">Terms of Service</Link></li>
                <li><Link href="/refund" className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">Refund Policy</Link></li>
              </ul>
            </div>
          </div>

          {/* Socials */}
          <div className="lg:col-span-1">
             <h3 className="text-sm font-semibold text-white mb-4">Connect</h3>
             <div className="flex gap-4">
               <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                 <Twitter className="h-5 w-5" />
               </a>
               <a href="https://github.com/benjait/embpay" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                 <Github className="h-5 w-5" />
               </a>
               <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                 <Linkedin className="h-5 w-5" />
               </a>
             </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} EmbPay Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            <span>All Systems Normal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
