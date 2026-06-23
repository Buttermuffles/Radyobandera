export function ArticleSkeleton() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse space-y-6 rounded-2xl border border-slate-100 bg-white p-4 sm:p-8">
      <div className="h-6 w-24 rounded-full bg-slate-200" />

      <div className="space-y-3">
        <div className="h-10 rounded bg-slate-200 sm:h-14" />
        <div className="h-10 w-3/4 rounded bg-slate-200 sm:h-14" />
      </div>

      <div className="h-4 w-48 rounded bg-slate-200" />

      <div className="aspect-[16/9] rounded-xl bg-slate-200" />

      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-4 rounded bg-slate-200"
            style={{ width: `${[100, 92, 85, 78, 95][i]}%` }}
          />
        ))}
      </div>

      <div className="h-10 w-40 rounded-full bg-slate-200" />
    </div>
  );
}
