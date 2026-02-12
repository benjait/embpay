import { Zap, Check, X } from "lucide-react";

const comparisonData = [
  { feature: "Setup Time", us: "5 minutes", them: "Days/Weeks" },
  { feature: "Transaction Fees", us: "0% (Pro)", them: "1% - 5%" },
  { feature: "Order Bumps", us: "Included", them: "$29/mo extra" },
  { feature: "Custom Branding", us: "Full White-label", them: "Limited" },
  { feature: "Subscription Logic", us: "Built-in", them: "Complex API" },
  { feature: "Global Payments", us: "135+ Countries", them: "Limited" },
];

export default function Comparison() {
  return (
    <section className="relative py-24 bg-slate-900/30 border-y border-white/5">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Why creators choose <span className="text-indigo-400">EmbPay</span>
          </h2>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/50 backdrop-blur-sm">
          <div className="grid grid-cols-3 border-b border-white/10 bg-white/5 p-4 text-sm font-semibold text-slate-300">
            <div className="pl-4">Feature</div>
            <div className="text-center text-indigo-400">EmbPay</div>
            <div className="text-center text-slate-500">Others</div>
          </div>
          
          <div className="divide-y divide-white/5">
            {comparisonData.map((row, idx) => (
              <div
                key={row.feature}
                className="grid grid-cols-3 items-center p-4 text-sm transition-colors hover:bg-white/[0.02]"
              >
                <div className="pl-4 font-medium text-slate-200">{row.feature}</div>
                <div className="flex justify-center font-bold text-white">
                  {row.us === "Included" || row.us === "Built-in" ? (
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Check className="h-4 w-4" />
                      <span>{row.us}</span>
                    </div>
                  ) : (
                    row.us
                  )}
                </div>
                <div className="flex justify-center text-slate-500">
                  {row.them.includes("extra") ? (
                    <div className="flex items-center gap-2 text-rose-400/80">
                      <X className="h-4 w-4" />
                      <span>{row.them}</span>
                    </div>
                  ) : (
                    row.them
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
