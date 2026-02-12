import { Zap, Github, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-white/10 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <a href="#" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold text-white">EmbPay</span>
            </a>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              The all-in-one payment infrastructure for modern creators and SaaS businesses. Built on Stripe.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-2 sm:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-slate-400 hover:text-indigo-400">Features</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-indigo-400">Pricing</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-indigo-400">API</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-indigo-400">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-slate-400 hover:text-indigo-400">About</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-indigo-400">Blog</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-indigo-400">Careers</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-indigo-400">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-slate-400 hover:text-indigo-400">Privacy</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-indigo-400">Terms</a></li>
              </ul>
            </div>
          </div>

          {/* Socials */}
          <div className="lg:col-span-1">
             <h3 className="text-sm font-semibold text-white mb-4">Connect</h3>
             <div className="flex gap-4">
               <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                 <Twitter className="h-5 w-5" />
               </a>
               <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                 <Github className="h-5 w-5" />
               </a>
               <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
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
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Systems Normal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
