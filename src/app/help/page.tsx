import { HelpCircle, Package, Code, CreditCard, Wallet, RefreshCw, Mail, Search, ChevronDown } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";

export const metadata = {
  title: "Help Center | EmbPay",
  description: "Find answers to common questions about EmbPay's payment platform.",
};

export default function HelpPage() {
  const categories = [
    {
      icon: Package,
      title: "Getting Started",
      questions: [
        {
          q: "How do I create a product?",
          a: "Log into your dashboard, click 'Products' in the sidebar, then click 'New Product'. Fill in your product details including name, description, price, and upload any digital files. Your product will be ready to sell immediately!",
        },
        {
          q: "What types of products can I sell?",
          a: "You can sell digital products like ebooks, courses, templates, software, music, art, and more. EmbPay is perfect for any digital downloadable content or access-based products.",
        },
        {
          q: "Is there a limit on products or sales?",
          a: "No! You can create unlimited products and make unlimited sales. We believe in scaling with your success.",
        },
      ],
    },
    {
      icon: Code,
      title: "Embedding & Integration",
      questions: [
        {
          q: "How do I embed checkout on my website?",
          a: "Go to your product page, click 'Embed', and copy the provided code snippet. Paste it into your website's HTML where you want the checkout button to appear. It works with any website builder, including WordPress, Webflow, Notion, and more.",
        },
        {
          q: "Can I customize the checkout button?",
          a: "Yes! You can customize colors, text, and styling to match your brand. You can also use our JavaScript SDK for advanced integrations and custom checkout flows.",
        },
        {
          q: "Do I need to know how to code?",
          a: "Not at all. Our embed code works with copy-paste simplicity. For advanced users, we offer a full API and webhooks.",
        },
      ],
    },
    {
      icon: CreditCard,
      title: "Stripe Integration",
      questions: [
        {
          q: "How do I connect my Stripe account?",
          a: "In your dashboard, go to Settings > Integrations and click 'Connect Stripe'. You'll be redirected to Stripe to authorize the connection. Once complete, you're ready to accept payments!",
        },
        {
          q: "What if I don't have a Stripe account?",
          a: "You can create one during the connection process. Stripe's setup takes just a few minutes, and you'll be able to start accepting payments immediately after verification.",
        },
        {
          q: "Is Stripe required to use EmbPay?",
          a: "Yes, EmbPay uses Stripe to process all payments securely. This ensures PCI compliance and gives you access to Stripe's powerful payment infrastructure.",
        },
      ],
    },
    {
      icon: Wallet,
      title: "Payouts & Payments",
      questions: [
        {
          q: "When do I get paid?",
          a: "Payouts depend on your Stripe account settings. Typically, funds are transferred to your bank account within 2-7 business days. You can also enable instant payouts for faster access (fees may apply).",
        },
        {
          q: "What fees does EmbPay charge?",
          a: "EmbPay takes 0% of your sales! You only pay Stripe's standard processing fees (2.9% + 30¢ per transaction in the US). No monthly fees, no hidden charges.",
        },
        {
          q: "Which currencies are supported?",
          a: "We support all currencies that Stripe supports (135+ currencies). Your customers can pay in their local currency, and you'll receive payouts in your account's default currency.",
        },
      ],
    },
    {
      icon: RefreshCw,
      title: "Refunds & Disputes",
      questions: [
        {
          q: "How do I issue a refund?",
          a: "Go to your Orders page, find the order you want to refund, click 'Refund', and confirm the amount. The refund will be processed immediately through Stripe.",
        },
        {
          q: "What happens if there's a chargeback?",
          a: "Chargebacks are handled through Stripe's dispute process. We'll notify you immediately, and you can submit evidence to contest the dispute through your Stripe dashboard.",
        },
        {
          q: "Can customers request refunds directly?",
          a: "Refund policies are set by you as the seller. We recommend clearly stating your refund policy on your product pages. EmbPay provides the tools to process refunds easily when needed.",
        },
      ],
    },
  ];

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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-6">
              <HelpCircle className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Help Center</h1>
            <p className="text-slate-400 max-w-lg mx-auto">
              Find answers to common questions about using EmbPay. Can't find what you're looking for? 
              We're here to help.
            </p>
          </div>

          {/* Contact CTA */}
          <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-transparent p-8 mb-12">
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Still need help?</h3>
                  <p className="text-slate-400">Contact our support team for personalized assistance.</p>
                </div>
              </div>
              <a
                href="mailto:boka@agentmail.to"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl btn-primary text-white font-medium transition-all whitespace-nowrap"
              >
                <Mail className="w-4 h-4" />
                Contact Support
              </a>
            </div>
          </div>

          {/* FAQ Categories */}
          <div className="space-y-12">
            {categories.map((category) => (
              <section key={category.title} className="glass-card rounded-2xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <category.icon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">{category.title}</h2>
                </div>

                <div className="space-y-4">
                  {category.questions.map((qa, i) => (
                    <details
                      key={i}
                      className="group rounded-xl bg-slate-900/50 border border-slate-700/50 overflow-hidden"
                    >
                      <summary className="flex items-center justify-between gap-4 p-5 cursor-pointer list-none hover:bg-slate-800/50 transition-colors">
                        <span className="font-medium text-white">{qa.q}</span>
                        <ChevronDown className="w-5 h-5 text-slate-500 group-open:rotate-180 transition-transform flex-shrink-0" />
                      </summary>
                      <div className="px-5 pb-5">
                        <p className="text-slate-400 leading-relaxed">{qa.a}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Quick Links */}
          <section className="mt-12">
            <h2 className="text-lg font-semibold text-white mb-6 text-center">Quick Links</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <Link
                href="/docs"
                className="p-6 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:border-indigo-500/30 hover:bg-slate-800/50 transition-all group"
              >
                <Code className="w-6 h-6 text-indigo-400 mb-3" />
                <h3 className="font-medium text-white mb-1">API Documentation</h3>
                <p className="text-sm text-slate-400">Technical guides and code examples</p>
              </Link>

              <Link
                href="/privacy"
                className="p-6 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:border-indigo-500/30 hover:bg-slate-800/50 transition-all group"
              >
                <HelpCircle className="w-6 h-6 text-purple-400 mb-3" />
                <h3 className="font-medium text-white mb-1">Privacy Policy</h3>
                <p className="text-sm text-slate-400">How we handle your data</p>
              </Link>

              <Link
                href="/refund"
                className="p-6 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:border-indigo-500/30 hover:bg-slate-800/50 transition-all group"
              >
                <RefreshCw className="w-6 h-6 text-emerald-400 mb-3" />
                <h3 className="font-medium text-white mb-1">Refund Policy</h3>
                <p className="text-sm text-slate-400">Our 30-day guarantee</p>
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
