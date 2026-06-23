export function SearchSkeleton() {
  return (
    <section className="space-y-4">
      <div className="flex h-8 w-64 animate-pulse rounded bg-slate-200 sm:h-10" />

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse space-y-3 rounded-xl border border-slate-100 bg-white p-4">
            <div className="aspect-[16/10] rounded-lg bg-slate-200" />
            <div className="space-y-2">
              <div className="h-3 w-3/4 rounded bg-slate-200" />
              <div className="h-3 w-1/2 rounded bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
