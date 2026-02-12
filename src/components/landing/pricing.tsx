"use client";

import { Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const frequencies = [
  { value: 'monthly', label: 'Monthly', priceSuffix: '/month' },
  { value: 'yearly', label: 'Yearly', priceSuffix: '/year' },
];

const tiers = [
  {
    name: 'Starter',
    id: 'tier-starter',
    href: '/auth/register',
    price: { monthly: 'Free', yearly: 'Free' },
    description: 'Perfect for testing ideas and side projects.',
    features: [
      '10 Products',
      '100 Orders / month',
      'Basic Analytics',
      'Stripe Connect',
      'Standard Support',
    ],
    mostPopular: false,
  },
  {
    name: 'Pro',
    id: 'tier-pro',
    href: '/auth/register',
    price: { monthly: '$29', yearly: '$290' },
    description: 'For serious creators scaling their business.',
    features: [
      'Unlimited Products',
      'Unlimited Orders',
      'Advanced Analytics',
      'Order Bumps & Upsells',
      'Priority Support',
      '0% Transaction Fee',
      'Custom Domains',
    ],
    mostPopular: true,
  },
  {
    name: 'Scale',
    id: 'tier-scale',
    href: '/auth/register',
    price: { monthly: '$79', yearly: '$790' },
    description: 'For agencies and high-volume sellers.',
    features: [
      'Everything in Pro',
      'White-Label Checkout',
      'API Access',
      'Team Members',
      'Dedicated Success Manager',
      'Multi-Currency Support',
      'SLA Guarantee',
    ],
    mostPopular: false,
  },
];

export default function Pricing() {
  const [frequency, setFrequency] = useState(frequencies[0]);

  return (
    <div className="py-24 sm:py-32" id="pricing">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-base font-semibold leading-7 text-indigo-400"
          >
            Pricing
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl"
          >
            Simple, transparent pricing
          </motion.p>
          <motion.p 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.2 }}
             className="mt-6 text-lg leading-8 text-slate-400"
          >
             Start free, scale as you grow. No hidden fees, no surprises.
          </motion.p>
        </div>

        {/* Pricing Toggle */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-16 flex justify-center"
        >
          <div className="grid grid-cols-2 gap-x-1 rounded-full bg-white/5 p-1 text-center text-xs font-semibold leading-5 text-white ring-1 ring-inset ring-white/10">
             {frequencies.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFrequency(option)}
                  className={`${
                    frequency.value === option.value ? 'bg-indigo-500 shadow-sm' : 'hover:bg-white/10'
                  } cursor-pointer rounded-full px-4 py-2 transition-all duration-200`}
                >
                  {option.label}
                </button>
             ))}
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.15
              }
            }
          }}
          className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3"
        >
          {tiers.map((tier) => (
            <motion.div
              key={tier.id}
              variants={{
                hidden: { opacity: 0, y: 30 },
                show: { opacity: 1, y: 0 }
              }}
              whileHover={{ y: -10 }}
              className={`relative rounded-3xl p-8 ring-1 transition-all duration-300 xl:p-10 ${
                tier.mostPopular 
                  ? 'bg-slate-900/80 ring-2 ring-indigo-500 shadow-2xl shadow-indigo-500/20 z-10 scale-105' 
                  : 'ring-white/10 bg-white/5 hover:bg-white/[0.07]'
              }`}
            >
              {tier.mostPopular && (
                 <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-3 py-1 text-center text-sm font-medium text-white shadow-lg">
                    Most Popular
                 </div>
              )}

              <div className="flex items-center justify-between gap-x-4">
                <h3 id={tier.id} className="text-lg font-semibold leading-8 text-white">
                  {tier.name}
                </h3>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-400">
                {tier.description}
              </p>
              
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-white">{tier.price[frequency.value as keyof typeof tier.price]}</span>
                <span className="text-sm font-semibold leading-6 text-slate-400">{frequency.priceSuffix}</span>
              </p>

              <a
                href={tier.href}
                aria-describedby={tier.id}
                className={`mt-6 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-all ${
                  tier.mostPopular
                    ? 'bg-indigo-500 text-white shadow-sm hover:bg-indigo-400 focus-visible:outline-indigo-500 hover:shadow-indigo-500/25 hover:scale-105'
                    : 'bg-white/10 text-white hover:bg-white/20 focus-visible:outline-white'
                }`}
              >
                {tier.mostPopular ? 'Start 14-Day Trial' : 'Start for Free'}
              </a>

              <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-slate-300 xl:mt-10">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <Check className="h-6 w-5 flex-none text-indigo-400" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
