import Link from "next/link";
import { ArrowLeft, HelpCircle, Search, Book, MessageCircle, FileText } from "lucide-react";

export default function HelpCenter() {
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
              <HelpCircle className="h-4 w-4 text-indigo-400" />
            </div>
            <span className="font-semibold text-white">Help Center</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-32">
        {/* Hero Search */}
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            How can we help?
          </h1>
          <p className="mb-8 text-lg text-slate-400">
            Search our knowledge base or browse common questions.
          </p>
          <div className="relative mx-auto max-w-xl">
            <input
              type="text"
              placeholder="Search for articles (e.g., 'refunds', 'api keys')..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-6 py-4 pl-12 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <Search className="absolute left-4 top-4 h-6 w-6 text-slate-500" />
          </div>
        </div>

        {/* Categories */}
        <div className="grid gap-6 md:grid-cols-3 mb-16">
          {[
            { icon: Book, title: "Getting Started", desc: "Account setup and basics" },
            { icon: FileText, title: "Billing & Payments", desc: "Invoices, refunds, and plans" },
            { icon: MessageCircle, title: "Developer API", desc: "Integration guides and docs" },
          ].map((cat) => (
            <div key={cat.title} className="group cursor-pointer rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-colors hover:bg-white/[0.05]">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20">
                <cat.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 font-semibold text-white">{cat.title}</h3>
              <p className="text-sm text-slate-400">{cat.desc}</p>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
          <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.02]">
            {[
              { q: "How do I connect my Stripe account?", a: "Go to Dashboard > Settings > Payments and click 'Connect Stripe'. You'll be redirected to Stripe's secure onboarding flow." },
              { q: "Can I sell in multiple currencies?", a: "Yes! EmbPay supports 135+ currencies. Prices are automatically converted based on your customer's location." },
              { q: "What are the transaction fees?", a: "We charge a small platform fee per transaction (variable by plan). Stripe also charges standard processing fees (usually 2.9% + 30¢)." },
              { q: "How do I issue a refund?", a: "Navigate to Dashboard > Orders, select the order, and click 'Refund'. You can issue full or partial refunds." },
            ].map((faq, i) => (
              <div key={i} className="p-6">
                <h3 className="mb-2 font-semibold text-white">{faq.q}</h3>
                <p className="text-slate-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-white/5 py-12 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} EmbPay Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
