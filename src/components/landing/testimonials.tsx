import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "EmbPay replaced ThriveCart, Gumroad, and half my tech stack. The embeddable checkout alone increased my conversion rate by 40%. It just works.",
    name: "Sarah Chen",
    role: "Founder, DesignMaster Pro",
    avatar: "SC",
    avatarBg: "from-indigo-500 to-violet-600",
    revenue: "$240K+ processed",
  },
  {
    quote:
      "I was spending hours fighting Stripe webhooks and building checkout flows. With EmbPay, I launched my entire course platform in an afternoon. The order bumps feature is pure money.",
    name: "Marcus Johnson",
    role: "Creator, CodeCraft Academy",
    avatar: "MJ",
    avatarBg: "from-emerald-500 to-cyan-600",
    revenue: "$180K+ processed",
  },
  {
    quote:
      "We switched from a custom-built payment system to EmbPay for our SaaS. The subscription management and analytics dashboard saved us 20+ hours a month. Best $79/mo we spend.",
    name: "Elena Kowalski",
    role: "CTO, LaunchPad SaaS",
    avatar: "EK",
    avatarBg: "from-amber-500 to-pink-600",
    revenue: "$500K+ processed",
  },
];

export default function Testimonials() {
  return (
    <section className="relative py-28 sm:py-36">
      <div className="section-divider absolute left-0 right-0 top-0" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center scroll-fade-in">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-indigo-400">
            Testimonials
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Loved by <span className="gradient-text">creators</span> worldwide
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-400">
            Thousands of creators and businesses trust EmbPay to power their
            sales.
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="mt-20 grid gap-8 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="glass-card glass-card-hover group rounded-2xl border border-white/[0.06] p-7 scroll-fade-in"
            >
              {/* Stars */}
              <div className="mb-5 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="mb-7 text-sm leading-relaxed text-slate-300">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3.5 border-t border-white/[0.06] pt-5">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${t.avatarBg} text-xs font-bold text-white`}
                >
                  {t.avatar}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
                <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                  {t.revenue}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
