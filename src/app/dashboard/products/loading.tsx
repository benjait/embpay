export default function ProductsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="h-7 w-28 bg-slate-800 rounded-lg" />
          <div className="h-4 w-52 bg-slate-800/60 rounded mt-2" />
        </div>
        <div className="h-10 w-36 bg-slate-800 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-xl border border-white/[0.06] bg-slate-900/50 p-5 space-y-4">
            <div className="aspect-video bg-slate-800/60 rounded-lg" />
            <div className="space-y-2">
              <div className="h-5 w-3/4 bg-slate-800 rounded" />
              <div className="h-3 w-full bg-slate-800/40 rounded" />
              <div className="h-3 w-2/3 bg-slate-800/40 rounded" />
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="h-6 w-16 bg-slate-800/60 rounded" />
              <div className="h-5 w-20 bg-slate-800/40 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
