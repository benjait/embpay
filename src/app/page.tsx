'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { 
  Rocket, 
  Key, 
  BarChart3, 
  Palette, 
  CreditCard, 
  Lock,
  ArrowRight,
  Check,
  Twitter,
  Github,
  Linkedin
} from 'lucide-react';

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-amber-400 bg-clip-text text-transparent">
              EmbPay
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-slate-300 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-slate-300 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="/docs" className="text-slate-300 hover:text-white transition-colors">
                Docs
              </Link>
              <Link 
                href="/auth/login" 
                className="text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/register" 
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                Start Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div 
              id="hero-text"
              data-animate
              className={`transition-all duration-1000 ${
                isVisible['hero-text'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
                Accept Payments in{' '}
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-amber-400 bg-clip-text text-transparent">
                  Minutes, Not Days
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-400 mb-8">
                The simplest way to sell digital products. No coding required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/auth/register"
                  className="px-8 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 rounded-lg font-semibold text-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2"
                >
                  Start Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link 
                  href="/demo"
                  className="px-8 py-4 bg-slate-800 hover:bg-slate-700 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2 border border-slate-700"
                >
                  View Demo
                </Link>
              </div>
            </div>
            <div 
              id="hero-image"
              data-animate
              className={`transition-all duration-1000 delay-300 ${
                isVisible['hero-image'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 rounded-2xl blur-3xl opacity-20"></div>
                <div className="relative bg-slate-900 rounded-2xl p-8 border border-slate-800">
                  <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 rounded-2xl flex items-center justify-center">
                        <CreditCard className="w-10 h-10" />
                      </div>
                      <p className="text-slate-400">Beautiful Payment Experience</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div 
            id="features-header"
            data-animate
            className={`text-center mb-16 transition-all duration-1000 ${
              isVisible['features-header'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything you need to{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-amber-400 bg-clip-text text-transparent">
                start selling
              </span>
            </h2>
            <p className="text-xl text-slate-400">
              Powerful features that help you sell more, faster
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Rocket className="w-8 h-8" />,
                title: 'Quick Setup',
                description: 'Connect Stripe, add products, start selling. Get up and running in minutes.',
                gradient: 'from-indigo-500 to-purple-500'
              },
              {
                icon: <Key className="w-8 h-8" />,
                title: 'License Keys',
                description: 'Auto-generate software licenses for your products. Instant delivery on purchase.',
                gradient: 'from-purple-500 to-pink-500'
              },
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: 'Analytics',
                description: 'Track sales, revenue, conversions. Make data-driven decisions with powerful insights.',
                gradient: 'from-pink-500 to-amber-500'
              },
              {
                icon: <Palette className="w-8 h-8" />,
                title: 'Embeddable',
                description: 'WordPress plugin, JS SDK, simple links. Integrate anywhere your customers are.',
                gradient: 'from-amber-500 to-orange-500'
              },
              {
                icon: <CreditCard className="w-8 h-8" />,
                title: 'Stripe Connect',
                description: 'Keep 100% of your revenue. We charge $0 in fees. You only pay Stripe\'s fees.',
                gradient: 'from-orange-500 to-red-500'
              },
              {
                icon: <Lock className="w-8 h-8" />,
                title: 'Secure',
                description: 'Built on Supabase + Vercel. Enterprise-grade security and 99.9% uptime.',
                gradient: 'from-red-500 to-indigo-500'
              }
            ].map((feature, index) => (
              <div
                key={index}
                id={`feature-${index}`}
                data-animate
                className={`transition-all duration-1000 ${
                  isVisible[`feature-${index}`] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 hover:border-slate-700 transition-all h-full hover:shadow-xl hover:shadow-purple-500/10">
                  <div className={`w-14 h-14 rounded-lg bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-slate-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div 
            id="how-header"
            data-animate
            className={`text-center mb-16 transition-all duration-1000 ${
              isVisible['how-header'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-400">
              Start selling in four simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Connect your Stripe account' },
              { step: '2', title: 'Add your products' },
              { step: '3', title: 'Share payment links or embed checkout' },
              { step: '4', title: 'Get paid instantly' }
            ].map((item, index) => (
              <div
                key={index}
                id={`step-${index}`}
                data-animate
                className={`text-center transition-all duration-1000 ${
                  isVisible[`step-${index}`] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 flex items-center justify-center text-2xl font-bold">
                  {item.step}
                </div>
                <p className="text-lg">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div 
            id="pricing-header"
            data-animate
            className={`text-center mb-16 transition-all duration-1000 ${
              isVisible['pricing-header'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-slate-400">
              Choose the plan that fits your needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: 'Free',
                price: '$0',
                period: 'forever',
                description: 'Perfect for getting started',
                features: [
                  'Up to 10 products',
                  'Basic analytics',
                  'Payment links',
                  'Email support',
                  'Stripe Connect'
                ],
                cta: 'Start Free',
                popular: false
              },
              {
                name: 'Pro',
                price: '$29',
                period: '/month',
                description: 'For growing businesses',
                features: [
                  'Unlimited products',
                  'Advanced analytics',
                  'Payment links + embeds',
                  'Priority support',
                  'License key generation',
                  'Custom branding',
                  'Webhooks'
                ],
                cta: 'Start Free',
                popular: true
              },
              {
                name: 'Scale',
                price: '$79',
                period: '/month',
                description: 'For high-volume sellers',
                features: [
                  'Everything in Pro',
                  'Custom domains',
                  'White-label options',
                  'Dedicated support',
                  'Advanced security',
                  'API access',
                  'Team collaboration',
                  'SLA guarantee'
                ],
                cta: 'Start Free',
                popular: false
              }
            ].map((plan, index) => (
              <div
                key={index}
                id={`pricing-${index}`}
                data-animate
                className={`transition-all duration-1000 ${
                  isVisible[`pricing-${index}`] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className={`relative bg-slate-900 rounded-2xl p-8 border h-full flex flex-col ${
                  plan.popular 
                    ? 'border-purple-500 shadow-xl shadow-purple-500/20' 
                    : 'border-slate-800'
                }`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-slate-400">{plan.period}</span>
                    </div>
                    <p className="text-slate-400">{plan.description}</p>
                  </div>
                  <ul className="space-y-3 mb-8 flex-grow">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link 
                    href="/auth/register"
                    className={`w-full py-3 rounded-lg font-semibold transition-all text-center block ${
                      plan.popular
                        ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 hover:shadow-lg hover:shadow-purple-500/50'
                        : 'bg-slate-800 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div 
            id="cta"
            data-animate
            className={`bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 rounded-3xl p-12 transition-all duration-1000 ${
              isVisible['cta'] ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Ready to start selling?
            </h2>
            <p className="text-xl mb-8 text-slate-100">
              Join thousands of creators already using EmbPay
            </p>
            <Link 
              href="/auth/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-lg font-semibold text-lg hover:shadow-xl transition-all"
            >
              Start Free Today
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-amber-400 bg-clip-text text-transparent mb-4">
                EmbPay
              </div>
              <p className="text-slate-400">
                The simplest way to sell digital products
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="#features" className="text-slate-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="text-slate-400 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/demo" className="text-slate-400 hover:text-white transition-colors">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link href="/docs" className="text-slate-400 hover:text-white transition-colors">Docs</Link></li>
                <li><Link href="/sdk" className="text-slate-400 hover:text-white transition-colors">SDK</Link></li>
                <li><Link href="/help" className="text-slate-400 hover:text-white transition-colors">Help</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="text-slate-400 hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400">
              © 2026 EmbPay. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link href="https://twitter.com" className="text-slate-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="https://github.com" className="text-slate-400 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </Link>
              <Link href="https://linkedin.com" className="text-slate-400 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
