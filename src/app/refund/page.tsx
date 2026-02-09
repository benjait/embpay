import { RefreshCw, Clock, CheckCircle, XCircle, HelpCircle, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";

export const metadata = {
  title: "Refund Policy | EmbPay",
  description: "EmbPay's refund policy - 30-day money back guarantee on all purchases.",
};

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Background effects */}
      <div className="fixed inset-0 grid-pattern pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
      </div>

      <Navbar />

      <main className="relative z-10 pt-24 pb-20">
        <div className="mx-auto max-w-4xl px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
              <RefreshCw className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Refund Policy</h1>
            <p className="text-slate-400">Last updated: February 8, 2026</p>
          </div>

          {/* Guarantee Banner */}
          <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent p-8 mb-8">
            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold text-white mb-2">30-Day Money Back Guarantee</h2>
                <p className="text-slate-300">
                  We stand behind our platform. If you&apos;re not satisfied with EmbPay for any reason, 
                  contact us within 30 days for a full refund. No questions asked.
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            {/* How to Request Section */}
            <section className="glass-card rounded-2xl p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-indigo-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mt-2">How to Request a Refund</h2>
              </div>
              <p className="text-slate-300 leading-relaxed mb-6">
                Requesting a refund is simple and hassle-free. Just follow these steps:
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700/50">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center mb-4">1</div>
                  <h3 className="font-medium text-white mb-2">Contact Support</h3>
                  <p className="text-sm text-slate-400">Email us at boka@agentmail.to with your account details and order information.</p>
                </div>
                <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700/50">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center mb-4">2</div>
                  <h3 className="font-medium text-white mb-2">Quick Review</h3>
                  <p className="text-sm text-slate-400">Our team will review your request within 24-48 business hours.</p>
                </div>
                <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700/50">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center mb-4">3</div>
                  <h3 className="font-medium text-white mb-2">Refund Processed</h3>
                  <p className="text-sm text-slate-400">Once approved, your refund will be processed within 5-10 business days.</p>
                </div>
              </div>
            </section>

            {/* Eligible Items Section */}
            <section className="glass-card rounded-2xl p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mt-2">What&apos;s Eligible for Refund</h2>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-slate-300">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Monthly and annual subscription fees (prorated based on usage)</span>
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Platform fees charged within the last 30 days</span>
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Setup fees and one-time charges</span>
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Additional feature purchases and upgrades</span>
                </li>
              </ul>
            </section>

            {/* Exceptions Section */}
            <section className="glass-card rounded-2xl p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                  <XCircle className="w-5 h-5 text-red-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mt-2">Non-Refundable Items</h2>
              </div>
              <p className="text-slate-300 leading-relaxed mb-4">
                While we strive to be flexible, certain items are not eligible for refunds:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-slate-300">
                  <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-white">Digital products delivered</strong> - Downloads, licenses, or access to digital content that has been consumed</span>
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-white">Stripe processing fees</strong> - Third-party payment processor fees are non-refundable</span>
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-white">Chargebacks</strong> - Disputed transactions handled through your payment provider</span>
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-white">Refunds after 30 days</strong> - Requests submitted beyond the 30-day window</span>
                </li>
              </ul>
            </section>

            {/* Processing Time Section */}
            <section className="glass-card rounded-2xl p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <RefreshCw className="w-5 h-5 text-cyan-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mt-2">Refund Processing Times</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                  <h3 className="font-medium text-white mb-2">Credit/Debit Cards</h3>
                  <p className="text-sm text-slate-400">5-10 business days to appear on your statement</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                  <h3 className="font-medium text-white mb-2">Bank Transfers</h3>
                  <p className="text-sm text-slate-400">3-5 business days to process</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                  <h3 className="font-medium text-white mb-2">Digital Wallets</h3>
                  <p className="text-sm text-slate-400">Instant to 2 business days depending on provider</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                  <h3 className="font-medium text-white mb-2">Stripe Account Balance</h3>
                  <p className="text-sm text-slate-400">1-2 business days to credit your Stripe balance</p>
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <section className="glass-card rounded-2xl p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mt-2">Frequently Asked Questions</h2>
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                  <h3 className="font-medium text-white mb-2">Can I get a partial refund?</h3>
                  <p className="text-sm text-slate-400">Yes, we may offer partial refunds for unused portions of your subscription or prorated amounts based on your usage.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                  <h3 className="font-medium text-white mb-2">What if I forget to cancel my subscription?</h3>
                  <p className="text-sm text-slate-400">If you were charged for a renewal you didn&apos;t intend, contact us within 7 days of the charge for a full refund.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                  <h3 className="font-medium text-white mb-2">Do you refund Stripe fees?</h3>
                  <p className="text-sm text-slate-400">Stripe&apos;s processing fees are charged by Stripe directly and are not refundable through EmbPay. You may contact Stripe directly regarding their fee policies.</p>
                </div>
              </div>
            </section>

            {/* Contact Section */}
            <section className="glass-card rounded-2xl p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mt-2">Need Help?</h2>
              </div>
              <p className="text-slate-300 leading-relaxed mb-6">
                Have questions about your refund? Our support team is here to help you with any concerns.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="mailto:boka@agentmail.to?subject=Refund Request"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl btn-primary text-white font-medium transition-all"
                >
                  <Mail className="w-4 h-4" />
                  Request a Refund
                </a>
                <Link
                  href="/help"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl btn-secondary text-slate-300 font-medium transition-all"
                >
                  Visit Help Center
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </section>
          </div>

          {/* Footer Note */}
          <div className="mt-12 text-center">
            <p className="text-slate-500 text-sm">
              We&apos;re committed to your satisfaction. If you&apos;re unhappy with our service for any reason, 
              please let us know and we&apos;ll make it right.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
