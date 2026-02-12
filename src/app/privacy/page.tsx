import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, FileText } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 selection:bg-indigo-500/30">
      {/* Header */}
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
              <Shield className="h-4 w-4 text-indigo-400" />
            </div>
            <span className="font-semibold text-white">Privacy Policy</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-32">
        <div className="prose prose-invert prose-indigo max-w-none">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Privacy Policy
            </h1>
            <p className="text-lg text-slate-400">
              Last updated: February 12, 2026
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">
            <p className="lead text-xl text-slate-300">
              At EmbPay, we take your privacy seriously. This policy describes how we collect, use, and protect your personal information when you use our payment infrastructure services.
            </p>
          </div>

          <div className="mt-12 space-y-12">
            <section>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                  <Eye className="h-5 w-5 text-blue-400" />
                </div>
                <h2 className="m-0 text-2xl font-bold text-white">1. Information We Collect</h2>
              </div>
              <p>
                We collect information you provide directly to us when you create an account, process a payment, or communicate with us. This includes:
              </p>
              <ul className="list-disc pl-6 marker:text-indigo-500">
                <li><strong>Account Information:</strong> Name, email address, password, and business details.</li>
                <li><strong>Payment Information:</strong> Transaction data, bank account information (processed securely via Stripe).</li>
                <li><strong>Usage Data:</strong> Device information, IP address, and browser type.</li>
              </ul>
            </section>

            <section>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                  <FileText className="h-5 w-5 text-emerald-400" />
                </div>
                <h2 className="m-0 text-2xl font-bold text-white">2. How We Use Information</h2>
              </div>
              <p>We use your information to provide, maintain, and improve our services, including:</p>
              <ul className="list-disc pl-6 marker:text-indigo-500">
                <li>Processing transactions and sending related notifications.</li>
                <li>Verifying your identity and preventing fraud.</li>
                <li>Sending you technical notices, updates, and support messages.</li>
                <li>Analyzing usage trends to improve our platform.</li>
              </ul>
            </section>

            <section>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
                  <Lock className="h-5 w-5 text-purple-400" />
                </div>
                <h2 className="m-0 text-2xl font-bold text-white">3. Data Security</h2>
              </div>
              <p>
                We implement industry-standard security measures to protect your personal information.
                Your payment data is processed securely through Stripe, a PCI-DSS Level 1 compliant provider.
                We do not store full credit card numbers on our servers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">4. Sharing of Information</h2>
              <p>
                We do not sell your personal information. We may share your information with third-party service providers
                who help us operate our business (e.g., cloud hosting, payment processing), subject to confidentiality agreements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">5. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:
                <a href="mailto:support@embpay.com" className="ml-1 text-indigo-400 hover:text-indigo-300">support@embpay.com</a>
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
