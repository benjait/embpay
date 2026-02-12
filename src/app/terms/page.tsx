import Link from "next/link";
import { ArrowLeft, FileCheck, AlertCircle, Scale } from "lucide-react";

export default function TermsOfService() {
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
              <FileCheck className="h-4 w-4 text-indigo-400" />
            </div>
            <span className="font-semibold text-white">Terms of Service</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-32">
        <div className="prose prose-invert prose-indigo max-w-none">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Terms of Service
            </h1>
            <p className="text-lg text-slate-400">
              Last updated: February 12, 2026
            </p>
          </div>

          <div className="space-y-12">
            <section>
              <h2 className="flex items-center gap-3 text-2xl font-bold text-white">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 text-sm">1</span>
                Acceptance of Terms
              </h2>
              <p>
                By accessing or using EmbPay ("the Service"), you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the Service.
              </p>
            </section>

            <section>
              <h2 className="flex items-center gap-3 text-2xl font-bold text-white">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 text-sm">2</span>
                Accounts
              </h2>
              <p>
                When you create an account with us, you guarantee that the information you provide is accurate, complete, and current at all times. Inaccurate, incomplete, or obsolete information may result in the immediate termination of your account.
              </p>
            </section>

            <section>
              <h2 className="flex items-center gap-3 text-2xl font-bold text-white">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 text-sm">3</span>
                Payments & Fees
              </h2>
              <ul className="list-disc pl-6 marker:text-indigo-500">
                <li><strong>Transaction Fees:</strong> We charge a platform fee per transaction as described on our Pricing page.</li>
                <li><strong>Payouts:</strong> Payouts are processed via Stripe Connect and are subject to their terms and processing times.</li>
                <li><strong>Taxes:</strong> You are responsible for determining and paying any applicable taxes on your sales.</li>
              </ul>
            </section>

            <section>
              <h2 className="flex items-center gap-3 text-2xl font-bold text-white">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 text-sm">4</span>
                Prohibited Uses
              </h2>
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
                <div className="mb-4 flex items-center gap-2 text-red-400">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-semibold">Strictly Prohibited Items</span>
                </div>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li>• Illegal products or services</li>
                  <li>• Adult content or services</li>
                  <li>• Weapons, ammunition, or explosives</li>
                  <li>• Drugs or drug paraphernalia</li>
                  <li>• High-risk businesses (gambling, betting)</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="flex items-center gap-3 text-2xl font-bold text-white">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 text-sm">5</span>
                Limitation of Liability
              </h2>
              <p>
                In no event shall EmbPay, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
              </p>
            </section>

            <section>
              <h2 className="flex items-center gap-3 text-2xl font-bold text-white">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 text-sm">6</span>
                Governing Law
              </h2>
              <div className="flex items-center gap-3 rounded-xl bg-slate-900 p-4">
                <Scale className="h-5 w-5 text-slate-500" />
                <p className="m-0 text-sm">
                  These Terms shall be governed and construed in accordance with the laws of Delaware, United States, without regard to its conflict of law provisions.
                </p>
              </div>
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
