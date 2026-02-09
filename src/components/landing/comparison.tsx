import { Check, X, Minus } from "lucide-react";

type CellValue = boolean | string;

interface ComparisonRow {
  feature: string;
  embpay: CellValue;
  thrivecart: CellValue;
  samcart: CellValue;
  gumroad: CellValue;
}

const comparisonData: ComparisonRow[] = [
  {
    feature: "Free plan available",
    embpay: true,
    thrivecart: false,
    samcart: false,
    gumroad: true,
  },
  {
    feature: "Embeddable checkout",
    embpay: true,
    thrivecart: true,
    samcart: false,
    gumroad: false,
  },
  {
    feature: "Order bumps & upsells",
    embpay: true,
    thrivecart: true,
    samcart: true,
    gumroad: false,
  },
  {
    feature: "Subscription billing",
    embpay: true,
    thrivecart: true,
    samcart: true,
    gumroad: true,
  },
  {
    feature: "Custom branding",
    embpay: true,
    thrivecart: true,
    samcart: true,
    gumroad: false,
  },
  {
    feature: "Real-time analytics",
    embpay: true,
    thrivecart: true,
    samcart: true,
    gumroad: "Basic",
  },
  {
    feature: "Zero monthly fee option",
    embpay: true,
    thrivecart: false,
    samcart: false,
    gumroad: true,
  },
  {
    feature: "Coupon codes",
    embpay: true,
    thrivecart: true,
    samcart: true,
    gumroad: true,
  },
  {
    feature: "Affiliate management",
    embpay: true,
    thrivecart: true,
    samcart: true,
    gumroad: false,
  },
  {
    feature: "API access",
    embpay: true,
    thrivecart: "Limited",
    samcart: true,
    gumroad: true,
  },
  {
    feature: "No platform transaction fee",
    embpay: "From 2%",
    thrivecart: true,
    samcart: false,
    gumroad: "10%",
  },
  {
    feature: "Starting price",
    embpay: "$0/mo",
    thrivecart: "$495 once",
    samcart: "$79/mo",
    gumroad: "$0/mo",
  },
];

function CellDisplay({ value }: { value: CellValue }) {
  if (typeof value === "string") {
    return <span className="text-sm text-slate-400">{value}</span>;
  }
  if (value === true) {
    return (
      <div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto">
        <Check className="w-3.5 h-3.5 text-emerald-400" />
      </div>
    );
  }
  return (
    <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
      <X className="w-3.5 h-3.5 text-red-400/70" />
    </div>
  );
}

export default function Comparison() {
  return (
    <section className="relative py-28 sm:py-36">
      <div className="section-divider absolute left-0 right-0 top-0" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center scroll-fade-in">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-indigo-400">
            Compare
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            How EmbPay{" "}
            <span className="gradient-text">stacks up</span>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-400">
            See why thousands of creators choose EmbPay over the competition.
          </p>
        </div>

        {/* Desktop Comparison Table */}
        <div className="mt-16 hidden md:block scroll-fade-in">
          <div className="glass-card rounded-2xl border border-white/[0.06] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left text-sm font-medium text-slate-400 px-6 py-5 w-[30%]">
                    Feature
                  </th>
                  <th className="text-center px-4 py-5 w-[17.5%]">
                    <div className="inline-flex flex-col items-center gap-1">
                      <span className="text-sm font-bold gradient-text">EmbPay</span>
                      <span className="text-[10px] text-indigo-400/80 font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                        You are here
                      </span>
                    </div>
                  </th>
                  <th className="text-center text-sm font-medium text-slate-500 px-4 py-5 w-[17.5%]">
                    ThriveCart
                  </th>
                  <th className="text-center text-sm font-medium text-slate-500 px-4 py-5 w-[17.5%]">
                    SamCart
                  </th>
                  <th className="text-center text-sm font-medium text-slate-500 px-4 py-5 w-[17.5%]">
                    Gumroad
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${
                      i === comparisonData.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    <td className="px-6 py-4 text-sm text-slate-300 font-medium">
                      {row.feature}
                    </td>
                    <td className="px-4 py-4 text-center bg-indigo-500/[0.03]">
                      <CellDisplay value={row.embpay} />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <CellDisplay value={row.thrivecart} />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <CellDisplay value={row.samcart} />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <CellDisplay value={row.gumroad} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Comparison Cards */}
        <div className="mt-12 md:hidden space-y-4">
          {comparisonData.map((row) => (
            <div
              key={row.feature}
              className="glass-card rounded-xl border border-white/[0.06] p-4"
            >
              <p className="text-sm font-medium text-white mb-3">{row.feature}</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: "EmbPay", value: row.embpay, highlight: true },
                  { name: "ThriveCart", value: row.thrivecart, highlight: false },
                  { name: "SamCart", value: row.samcart, highlight: false },
                  { name: "Gumroad", value: row.gumroad, highlight: false },
                ].map((item) => (
                  <div
                    key={item.name}
                    className={`flex items-center gap-2 text-xs p-2 rounded-lg ${
                      item.highlight ? "bg-indigo-500/10 border border-indigo-500/20" : "bg-slate-800/30"
                    }`}
                  >
                    <span className={`font-medium ${item.highlight ? "text-indigo-300" : "text-slate-500"}`}>
                      {item.name}:
                    </span>
                    {typeof item.value === "boolean" ? (
                      item.value ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-red-400/70" />
                      )
                    ) : (
                      <span className="text-slate-400">{item.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
