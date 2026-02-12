"use client";

import { motion } from "framer-motion";
import { 
  CreditCard, 
  Globe, 
  Zap, 
  BarChart3, 
  ShieldCheck, 
  Code2, 
  Smartphone, 
  Repeat 
} from "lucide-react";

const features = [
  {
    name: "Global Payments",
    description: "Accept payments from 135+ countries in 30+ currencies with automatic conversion.",
    icon: Globe,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    name: "Instant Checkout",
    description: "One-click checkout optimization designed to increase conversion by up to 40%.",
    icon: Zap,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    name: "Subscription Management",
    description: "Built-in recurring billing, churn recovery, and customer portal for subscriptions.",
    icon: Repeat,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    name: "Fraud Protection",
    description: "AI-powered fraud detection that blocks risky transactions before they happen.",
    icon: ShieldCheck,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    name: "Developer API",
    description: "Robust, well-documented API and webhooks for custom integrations.",
    icon: Code2,
    color: "text-pink-400",
    bg: "bg-pink-500/10",
  },
  {
    name: "Real-time Analytics",
    description: "Track revenue, MRR, and customer growth with our beautiful dashboard.",
    icon: BarChart3,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/5 blur-[100px]" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-base font-semibold leading-7 text-indigo-400"
          >
            Powerful Features
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Everything you need to sell online
          </motion.p>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg leading-8 text-slate-400"
          >
            A complete payment platform built for creators, SaaS founders, and digital businesses. No code. No complexity.
          </motion.p>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none"
        >
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <motion.div 
                key={feature.name} 
                variants={item}
                whileHover={{ y: -5, scale: 1.02 }}
                className="relative pl-16 group"
              >
                <div className={`absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg ${feature.bg} ring-1 ring-inset ring-white/10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} aria-hidden="true" />
                </div>
                <dt className="text-base font-semibold leading-7 text-white group-hover:text-indigo-300 transition-colors">
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base leading-7 text-slate-400 group-hover:text-slate-300 transition-colors">
                  {feature.description}
                </dd>
              </motion.div>
            ))}
          </dl>
        </motion.div>
      </div>
    </section>
  );
}
