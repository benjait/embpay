import Link from "next/link";
import { ArrowLeft, RefreshCw, CheckCircle2, XCircle } from "lucide-react";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 selection:bg-indigo-500/30">
      <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10">
              <RefreshCw className="h-4 w-4 text-indigo-400" />
            </div>
            <span className="font-semibold text-white">Refund Policy</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-32">
        <div className="prose prose-invert prose-indigo max-w-none">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Refund Policy
            </h1>
            <p className="text-lg text-slate-400">
              Fair and transparent refund rules for creators and buyers.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-12">
             <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Eligible for Refund</h3>
                <ul className="space-y-2 text-sm text-slate-400">
                    <li>• Duplicate charges</li>
                    <li>• Product not delivered/accessible</li>
                    <li>• Major defects in digital product</li>
                    <li>• Request within 14 days (if policy allows)</li>
                </ul>
             </div>

             <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20 text-red-400">
                    <XCircle className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Not Eligible</h3>
                <ul className="space-y-2 text-sm text-slate-400">
                    <li>• Change of mind after downloading</li>
                    <li>• Services already rendered</li>
                    <li>• Abuse of refund policy</li>
                    <li>• Requests after 30 days</li>
                </ul>
             </div>
          </div>

          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-bold text-white">For Buyers</h2>
              <p>
                If you purchased a product through EmbPay and need a refund, please first contact the seller directly. 
                Sellers on EmbPay set their own refund policies, but they are required to honor refunds for defective products or non-delivery.
              </p>
              <p>
                If the seller does not respond within 3 business days, you may escalate the issue to EmbPay Support.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">For Sellers (Creators)</h2>
              <p>
                As a seller on EmbPay, you agree to:
              </p>
              <ul className="list-disc pl-6 marker:text-indigo-500">
                <li>Clearly state your refund policy on your product pages.</li>
                <li>Process valid refund requests promptly.</li>
                <li>Maintain a refund rate below 1% to avoid account review.</li>
              </ul>
              <div className="mt-4 rounded-lg bg-slate-900 p-4 text-sm text-slate-400">
                <strong>Note:</strong> When a refund is processed, the platform fees are generally not returned by Stripe or EmbPay, depending on current processor rules.
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">Disputes & Chargebacks</h2>
              <p>
                We encourage resolving issues directly. Chargebacks hurt sellers and the platform. 
                Excessive chargebacks may result in account termination.
              </p>
            </section>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/5 py-12 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} EmbPay Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
