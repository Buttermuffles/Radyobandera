function CardSkeleton() {
  return (
    <div className="animate-pulse space-y-3 rounded-xl border border-slate-100 bg-white p-4">
      <div className="aspect-[16/10] rounded-lg bg-slate-200" />
      <div className="space-y-2">
        <div className="h-3 w-3/4 rounded bg-slate-200" />
        <div className="h-3 w-1/2 rounded bg-slate-200" />
      </div>
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="space-y-6">
          <div className="aspect-[21/9] animate-pulse rounded-2xl bg-slate-200 sm:rounded-[2rem]" />

          {["LOCAL", "REGIONAL", "NATIONAL"].map((section) => (
            <section key={section} className="space-y-3">
              <div className="mb-2 h-5 w-20 animate-pulse rounded bg-slate-200 sm:mb-3 sm:h-7 sm:w-28" />
              <div className="grid gap-4 sm:grid-cols-2">
                {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
              </div>
            </section>
          ))}
        </div>

        <aside className="hidden space-y-4 lg:block">
          <div className="animate-pulse space-y-3 rounded-xl border border-white/60 bg-white p-3 sm:rounded-[1.5rem] sm:p-4">
            <div className="aspect-video rounded-lg bg-slate-200" />
            <div className="h-3 w-1/2 rounded bg-slate-200" />
          </div>
          <div className="animate-pulse space-y-3 rounded-xl border border-white/60 bg-white p-3 sm:rounded-[1.5rem] sm:p-4">
            <div className="aspect-square rounded-lg bg-slate-200" />
            <div className="space-y-2">
              <div className="h-4 w-20 rounded bg-slate-200" />
              <div className="h-8 w-16 rounded bg-slate-200" />
            </div>
          </div>
          <div className="aspect-[3/4] animate-pulse rounded-xl border border-white/60 bg-white sm:rounded-[1.5rem]" />
        </aside>
      </div>

      <section className="space-y-6">
        <div className="animate-pulse space-y-3 overflow-hidden rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 p-6 sm:p-8">
          <div className="h-4 w-24 rounded bg-white/10" />
          <div className="h-8 w-48 rounded bg-white/10" />
          <div className="h-4 w-72 rounded bg-white/10" />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </section>
    </div>
  );
}
