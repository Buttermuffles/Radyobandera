export function SearchSkeleton() {
  return (
    <section className="space-y-4">
      <div className="flex h-8 w-64 animate-pulse items-center rounded bg-slate-200 px-3 sm:h-10">
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flex aspect-[3/4] animate-pulse flex-col items-center justify-center gap-2 rounded-xl bg-slate-200"
          >
            <span className="text-xs font-semibold text-slate-400">RESULT</span>
          </div>
        ))}
      </div>
    </section>
  );
}
