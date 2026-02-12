"use client";

export default function TrustedBy() {
  const brands = [
    "Acme Corp",
    "GlobalTech",
    "Nebula",
    "Vertex",
    "Horizon",
    "Elevate",
    "Pinnacle",
    "Zenith",
  ];

  return (
    <section className="border-y border-white/[0.05] bg-slate-950/50 py-10">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <p className="mb-6 text-sm font-medium text-slate-500">
          Trusted by 10,000+ creators and businesses worldwide
        </p>

        <div className="relative flex overflow-hidden">
          {/* Gradients to fade edges */}
          <div className="absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r from-slate-950 to-transparent" />
          <div className="absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-slate-950 to-transparent" />

          {/* Marquee Container */}
          <div className="flex animate-marquee gap-16 whitespace-nowrap py-2">
            {[...brands, ...brands].map((brand, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-xl font-bold text-slate-700 transition-colors hover:text-slate-500"
              >
                <div className="h-6 w-6 rounded-full bg-current opacity-20" />
                <span>{brand}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}
