import { Quote } from "lucide-react";

const testimonials = [
  {
    content:
      "EmbPay completely transformed how I sell my digital courses. The setup was instant, and the order bumps increased my revenue by 25% in the first week.",
    author: "Sarah Jenkins",
    role: "Digital Creator",
    image: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
  },
  {
    content:
      "I needed a payment solution that I could embed directly into my Next.js app without building a backend. EmbPay was exactly what I was looking for.",
    author: "Mike Chen",
    role: "SaaS Founder",
    image: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
  },
  {
    content:
      "The subscription management features are incredible. It handles churn, failed payments, and upgrades automatically. Saved me hours of dev time.",
    author: "Jessica Lee",
    role: "Agency Owner",
    image: "https://i.pravatar.cc/150?u=a04258114e29026302d",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="relative py-24 sm:py-32 bg-slate-950">
       <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent" />
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Loved by <span className="gradient-text">founders</span> like you
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="relative flex flex-col rounded-2xl border border-white/10 bg-white/5 p-8 transition-all hover:bg-white/[0.07] hover:-translate-y-1"
            >
              <Quote className="absolute top-6 right-6 h-8 w-8 text-indigo-500/20 rotate-180" />
              
              <div className="mb-6 flex-1">
                <p className="text-lg leading-relaxed text-slate-300 italic">
                  "{t.content}"
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-slate-800 ring-2 ring-indigo-500/20 overflow-hidden">
                   {/* Placeholder avatar if image fails */}
                   <div className="h-full w-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">
                     {t.author.charAt(0)}
                   </div>
                </div>
                <div>
                  <p className="font-semibold text-white">{t.author}</p>
                  <p className="text-sm text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
