import { Shield, Lock, Eye, Users, Database, Mail, ExternalLink } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";

export const metadata = {
  title: "Privacy Policy | EmbPay",
  description: "EmbPay's privacy policy - how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  const sections = [
    {
      icon: Database,
      title: "Information We Collect",
      content: [
        "Account information (name, email, business details)",
        "Payment and billing information (processed securely via Stripe)",
        "Transaction data (products sold, order history)",
        "Usage data (how you interact with our platform)",
        "Device and browser information",
        "Cookies and similar tracking technologies",
      ],
    },
    {
      icon: Eye,
      title: "How We Use Your Information",
      content: [
        "To provide and maintain our payment processing services",
        "To process transactions and send confirmations",
        "To detect and prevent fraud and security incidents",
        "To communicate with you about your account and updates",
        "To improve our platform and develop new features",
        "To comply with legal obligations",
      ],
    },
    {
      icon: Users,
      title: "Third-Party Services",
      content: [
        "Stripe - Payment processing and merchant services",
        "Cloud infrastructure providers (hosting and data storage)",
        "Analytics services (usage patterns, performance monitoring)",
        "Email service providers (transactional communications)",
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
              <Shield className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
            <p className="text-slate-400">Last updated: February 8, 2026</p>
          </div>

          {/* Introduction */}
          <div className="glass-card rounded-2xl p-8 mb-8">
            <p className="text-slate-300 leading-relaxed mb-4">
              EmbPay (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
              when you use our website and payment processing services.
            </p>
            <p className="text-slate-300 leading-relaxed">
              By using EmbPay, you consent to the data practices described in this policy. 
              If you do not agree with the data practices described in this policy, you should not use our services.
            </p>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            {sections.map((section) => (
              <section key={section.title} className="glass-card rounded-2xl p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                    <section.icon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white mt-2">{section.title}</h2>
                </div>
                <ul className="space-y-3">
                  {section.content.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            {/* Cookies Section */}
            <section className="glass-card rounded-2xl p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mt-2">Cookies & Tracking</h2>
              </div>
              <p className="text-slate-300 leading-relaxed mb-4">
                We use cookies and similar tracking technologies to enhance your experience on our platform. 
                These include:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                  <span><strong className="text-white">Essential cookies</strong> - Required for the platform to function properly</span>
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                  <span><strong className="text-white">Analytics cookies</strong> - Help us understand how visitors interact with our site</span>
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                  <span><strong className="text-white">Preference cookies</strong> - Remember your settings and preferences</span>
                </li>
              </ul>
            </section>

            {/* Your Rights Section */}
            <section className="glass-card rounded-2xl p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-cyan-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mt-2">Your Privacy Rights</h2>
              </div>
              <p className="text-slate-300 leading-relaxed mb-4">
                Depending on your location, you may have the following rights regarding your personal data:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2 flex-shrink-0" />
                  Right to access and receive a copy of your personal data
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2 flex-shrink-0" />
                  Right to correct inaccurate or incomplete information
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2 flex-shrink-0" />
                  Right to delete your personal data (subject to legal obligations)
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2 flex-shrink-0" />
                  Right to object to or restrict certain processing activities
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2 flex-shrink-0" />
                  Right to data portability
                </li>
              </ul>
            </section>

            {/* Data Security Section */}
            <section className="glass-card rounded-2xl p-8">
              <h2 className="text-xl font-semibold text-white mb-4">Data Security</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                We implement appropriate technical and organizational measures to protect your personal data 
                against unauthorized access, alteration, disclosure, or destruction. This includes:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                  Encryption of data in transit and at rest
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                  Regular security assessments and penetration testing
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                  PCI DSS compliance for payment processing
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                  Access controls and authentication requirements
                </li>
              </ul>
            </section>

            {/* Contact Section */}
            <section className="glass-card rounded-2xl p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-emerald-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mt-2">Contact Us</h2>
              </div>
              <p className="text-slate-300 leading-relaxed mb-6">
                If you have any questions about this Privacy Policy or our data practices, 
                please contact us:
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="mailto:boka@agentmail.to"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl btn-primary text-white font-medium transition-all"
                >
                  <Mail className="w-4 h-4" />
                  boka@agentmail.to
                </a>
                <Link
                  href="/help"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl btn-secondary text-slate-300 font-medium transition-all"
                >
                  Visit Help Center
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </section>
          </div>

          {/* Footer Note */}
          <div className="mt-12 text-center">
            <p className="text-slate-500 text-sm">
              EmbPay is committed to transparency and protecting your privacy. 
              This policy may be updated periodically, and we will notify you of any material changes.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
