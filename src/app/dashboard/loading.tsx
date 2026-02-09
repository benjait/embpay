export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="h-7 w-36 bg-slate-800 rounded-lg" />
          <div className="h-4 w-64 bg-slate-800/60 rounded mt-2" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-32 bg-slate-800 rounded-lg" />
          <div className="h-10 w-32 bg-slate-800/60 rounded-lg" />
        </div>
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/[0.06] bg-slate-900/50 p-5"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="h-4 w-24 bg-slate-800 rounded" />
                <div className="h-7 w-20 bg-slate-800/80 rounded" />
                <div className="h-3 w-28 bg-slate-800/40 rounded" />
              </div>
              <div className="w-10 h-10 bg-slate-800 rounded-xl" />
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Actions skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 rounded-xl border border-white/[0.06] bg-slate-900/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="h-5 w-24 bg-slate-800 rounded" />
              <div className="h-3 w-32 bg-slate-800/40 rounded mt-2" />
            </div>
            <div className="h-6 w-16 bg-slate-800 rounded-full" />
          </div>
          <div className="flex items-end justify-between gap-2 h-48">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="h-3 w-8 bg-slate-800/40 rounded" />
                <div className="w-full relative" style={{ height: "140px" }}>
                  <div
                    className="absolute bottom-0 w-full rounded-t-md bg-slate-800/60"
                    style={{ height: `${30 + (i * 10) % 60}%` }}
                  />
                </div>
                <div className="h-3 w-8 bg-slate-800/40 rounded" />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-white/[0.06] bg-slate-900/50 p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-4 h-4 bg-slate-800 rounded" />
            <div className="h-5 w-28 bg-slate-800 rounded" />
          </div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg border border-white/[0.04]"
              >
                <div className="w-10 h-10 bg-slate-800 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-28 bg-slate-800 rounded" />
                  <div className="h-3 w-40 bg-slate-800/40 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border border-white/[0.06] bg-slate-900/50 overflow-hidden">
        <div className="p-6">
          <div className="h-5 w-32 bg-slate-800 rounded" />
          <div className="h-3 w-56 bg-slate-800/40 rounded mt-2" />
        </div>
        <div className="px-6">
          <div className="border-b border-white/[0.06] py-3 flex gap-6">
            {[80, 120, 100, 80, 80, 80].map((w, i) => (
              <div key={i} className={`h-3 bg-slate-800/40 rounded`} style={{ width: w }} />
            ))}
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border-b border-white/[0.04] py-4 flex gap-6 items-center">
              <div className="h-4 w-20 bg-slate-800/60 rounded" />
              <div className="space-y-1">
                <div className="h-4 w-28 bg-slate-800/60 rounded" />
                <div className="h-3 w-36 bg-slate-800/30 rounded" />
              </div>
              <div className="h-4 w-24 bg-slate-800/40 rounded" />
              <div className="h-4 w-16 bg-slate-800/60 rounded" />
              <div className="h-5 w-20 bg-slate-800/40 rounded-full" />
              <div className="h-4 w-20 bg-slate-800/30 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
