import { FileText, AlertCircle, CheckCircle, CreditCard, Ban, Scale, Mail } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";

export const metadata = {
  title: "Terms of Service | EmbPay",
  description: "EmbPay's terms of service - the rules and guidelines for using our platform.",
};

export default function TermsPage() {
  const sections = [
    {
      icon: CheckCircle,
      title: "1. Acceptance of Terms",
      content: `By accessing or using EmbPay's services, you agree to be bound by these Terms of Service. 
      If you do not agree to all the terms and conditions, you must not access or use our services. 
      These terms constitute a legally binding agreement between you and EmbPay regarding your use of the platform.`,
    },
    {
      icon: FileText,
      title: "2. Account Registration",
      content: `To use certain features of EmbPay, you must register for an account. You agree to provide 
      accurate, current, and complete information during the registration process and to update 
      such information to keep it accurate, current, and complete. You are responsible for 
      safeguarding your password and for all activities that occur under your account. 
      You must notify us immediately of any unauthorized use of your account.`,
    },
    {
      icon: CreditCard,
      title: "3. Payment Processing",
      content: `EmbPay uses Stripe to process payments. By using our payment services, you agree to comply 
      with Stripe's terms of service. You are responsible for all fees associated with your use of 
      the services, including transaction fees charged by Stripe. All payments are processed in 
      accordance with our pricing terms, which may be updated from time to time.`,
    },
    {
      icon: Ban,
      title: "4. Prohibited Uses",
      content: `You may not use EmbPay for any illegal or unauthorized purpose. Prohibited activities include:
      
      • Selling illegal goods or services
      • Engaging in fraudulent transactions
      • Violating intellectual property rights
      • Distributing malware or harmful code
      • Attempting to breach our security systems
      • Using the platform to harass or abuse others
      • Any activity that violates applicable laws or regulations`,
    },
    {
      icon: AlertCircle,
      title: "5. Termination",
      content: `We may terminate or suspend your account immediately, without prior notice or liability, 
      for any reason whatsoever, including without limitation if you breach these Terms. 
      Upon termination, your right to use the service will immediately cease. 
      All provisions of the Terms which by their nature should survive termination shall survive 
      termination, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.`,
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
              <FileText className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
            <p className="text-slate-400">Last updated: February 8, 2026</p>
          </div>

          {/* Introduction */}
          <div className="glass-card rounded-2xl p-8 mb-8">
            <p className="text-slate-300 leading-relaxed">
              These Terms of Service (&quot;Terms&quot;) govern your access to and use of EmbPay's 
              website, products, and services (&quot;Services&quot;). Please read these Terms carefully 
              before using our Services. By using our Services, you agree to be bound by these Terms.
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
                <div className="text-slate-300 leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </section>
            ))}

            {/* Liability Section */}
            <section className="glass-card rounded-2xl p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mt-2">6. Limitation of Liability</h2>
              </div>
              <p className="text-slate-300 leading-relaxed mb-4">
                To the maximum extent permitted by applicable law, EmbPay and its affiliates, 
                officers, employees, agents, suppliers, and licensors shall not be liable for 
                any indirect, incidental, special, consequential, or punitive damages, including 
                without limitation, loss of profits, data, use, goodwill, or other intangible losses, 
                resulting from:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                  Your access to or use of or inability to access or use the Services
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                  Any conduct or content of any third party on the Services
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                  Any content obtained from the Services
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                  Unauthorized access, use, or alteration of your transmissions or content
                </li>
              </ul>
            </section>

            {/* Indemnification Section */}
            <section className="glass-card rounded-2xl p-8">
              <h2 className="text-xl font-semibold text-white mb-4">7. Indemnification</h2>
              <p className="text-slate-300 leading-relaxed">
                You agree to defend, indemnify, and hold harmless EmbPay and its affiliates, 
                officers, employees, agents, suppliers, and licensors from and against any claims, 
                liabilities, damages, judgments, awards, losses, costs, expenses, or fees 
                (including reasonable attorneys' fees) arising out of or relating to your violation 
                of these Terms or your use of the Services.
              </p>
            </section>

            {/* Governing Law Section */}
            <section className="glass-card rounded-2xl p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Scale className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mt-2">8. Governing Law</h2>
              </div>
              <p className="text-slate-300 leading-relaxed">
                These Terms shall be governed and construed in accordance with the laws of the 
                United States, without regard to its conflict of law provisions. Our failure to 
                enforce any right or provision of these Terms will not be considered a waiver of 
                those rights. If any provision of these Terms is held to be invalid or unenforceable, 
                the remaining provisions will remain in effect.
              </p>
            </section>

            {/* Changes Section */}
            <section className="glass-card rounded-2xl p-8">
              <h2 className="text-xl font-semibold text-white mb-4">9. Changes to Terms</h2>
              <p className="text-slate-300 leading-relaxed">
                We reserve the right, at our sole discretion, to modify or replace these Terms at 
                any time. If a revision is material, we will try to provide at least 30 days' notice 
                prior to any new terms taking effect. What constitutes a material change will be 
                determined at our sole discretion. By continuing to access or use our Services 
                after those revisions become effective, you agree to be bound by the revised terms.
              </p>
            </section>

            {/* Contact Section */}
            <section className="glass-card rounded-2xl p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-emerald-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mt-2">10. Contact Us</h2>
              </div>
              <p className="text-slate-300 leading-relaxed mb-6">
                If you have any questions about these Terms, please contact us at:
              </p>
              <a
                href="mailto:boka@agentmail.to"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-primary text-white font-medium transition-all"
              >
                <Mail className="w-4 h-4" />
                boka@agentmail.to
              </a>
            </section>
          </div>

          {/* Footer Note */}
          <div className="mt-12 text-center">
            <p className="text-slate-500 text-sm">
              By using EmbPay, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
