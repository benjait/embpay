export default function TrustedBy() {
  const logos = [
    { name: "TechCrunch", abbr: "TC" },
    { name: "Product Hunt", abbr: "PH" },
    { name: "Indie Hackers", abbr: "IH" },
    { name: "Hacker News", abbr: "HN" },
    { name: "Shopify", abbr: "SH" },
    { name: "Vercel", abbr: "VE" },
  ];

  return (
    <section className="relative py-16 sm:py-20 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center text-sm font-medium text-slate-500 uppercase tracking-widest mb-10">
          Trusted by 10,000+ creators and businesses
        </p>

        {/* Logo Marquee */}
        <div className="relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

          <div className="flex items-center justify-center gap-8 sm:gap-12 lg:gap-16 flex-wrap">
            {logos.map((logo) => (
              <div
                key={logo.name}
                className="flex items-center gap-2.5 opacity-40 hover:opacity-70 transition-opacity duration-300"
              >
                <div className="w-8 h-8 rounded-lg border border-slate-700/50 bg-slate-800/50 flex items-center justify-center">
                  <span className="text-xs font-bold text-slate-400">{logo.abbr}</span>
                </div>
                <span className="text-sm font-semibold text-slate-500 tracking-tight">
                  {logo.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 max-w-3xl mx-auto">
          {[
            { value: "$5M+", label: "Payments Processed" },
            { value: "10K+", label: "Active Creators" },
            { value: "99.9%", label: "Uptime SLA" },
            { value: "150+", label: "Countries Supported" },
          ].map((stat) => (
            <div key={stat.label} className="text-center scroll-fade-in">
              <div className="text-2xl sm:text-3xl font-extrabold gradient-text">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-slate-500 mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
