export default function OrdersLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="h-7 w-24 bg-slate-800 rounded-lg" />
          <div className="h-4 w-48 bg-slate-800/60 rounded mt-2" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-28 bg-slate-800/60 rounded-lg" />
          <div className="h-10 w-28 bg-slate-800/60 rounded-lg" />
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-slate-900/50 overflow-hidden">
        <div className="px-6 py-3 border-b border-white/[0.06] flex gap-6">
          {[60, 100, 80, 60, 70, 70].map((w, i) => (
            <div key={i} className="h-3 bg-slate-800/40 rounded" style={{ width: w }} />
          ))}
        </div>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="border-b border-white/[0.04] px-6 py-4 flex gap-6 items-center">
            <div className="h-4 w-20 bg-slate-800/60 rounded" />
            <div className="space-y-1 flex-1">
              <div className="h-4 w-32 bg-slate-800/60 rounded" />
              <div className="h-3 w-40 bg-slate-800/30 rounded" />
            </div>
            <div className="h-4 w-24 bg-slate-800/40 rounded" />
            <div className="h-4 w-16 bg-slate-800/60 rounded" />
            <div className="h-5 w-20 bg-slate-800/40 rounded-full" />
            <div className="h-4 w-20 bg-slate-800/30 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
