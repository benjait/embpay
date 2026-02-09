import Link from "next/link";
import { Zap, Home, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 grid-pattern pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
      </div>

      <div className="relative z-10 text-center max-w-lg mx-auto">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2.5 mb-12 group no-underline">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold">
            <span className="text-white">Emb</span>
            <span className="gradient-text">Pay</span>
          </span>
        </Link>

        {/* 404 Number */}
        <div className="mb-6">
          <span className="text-[120px] sm:text-[160px] font-extrabold leading-none gradient-text select-none">
            404
          </span>
        </div>

        {/* Message */}
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          Page not found
        </h1>
        <p className="text-slate-400 text-base leading-relaxed mb-10 max-w-sm mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="btn-primary group inline-flex items-center gap-2.5 rounded-xl px-7 py-3.5 text-sm font-semibold text-white no-underline"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            href="/dashboard"
            className="btn-secondary inline-flex items-center gap-2.5 rounded-xl px-7 py-3.5 text-sm font-semibold text-slate-300 no-underline"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
