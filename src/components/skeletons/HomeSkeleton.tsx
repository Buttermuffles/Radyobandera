export function HomeSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="space-y-6">
          <div className="flex aspect-[21/9] animate-pulse items-center justify-center rounded-2xl bg-slate-200 sm:rounded-[2rem]" />

          {["LOCAL", "REGIONAL", "NATIONAL"].map((section) => (
            <section key={section} className="space-y-3">
              <header className="mb-2 flex items-center gap-3 sm:mb-3">
                <h2 className="font-heading text-lg font-black tracking-tight text-brand-blue sm:text-2xl md:text-3xl">
                  {section}
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-slate-300 to-transparent" />
              </header>
              <div className="grid gap-4 sm:grid-cols-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="flex aspect-[4/3] animate-pulse flex-col items-center justify-center gap-2 rounded-xl bg-slate-200"
                  >
                    <span className="text-xs font-semibold text-slate-400">CARD</span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="hidden space-y-4 lg:block">
          <div className="flex aspect-[16/10] animate-pulse items-center justify-center rounded-xl border border-white/60 bg-white p-3 shadow-sm sm:rounded-[1.5rem] sm:p-4" />
          <div className="flex aspect-[4/3] animate-pulse items-center justify-center rounded-xl border border-white/60 bg-white p-3 shadow-sm sm:rounded-[1.5rem] sm:p-4" />
          <div className="flex aspect-[3/4] animate-pulse items-center justify-center rounded-xl border border-white/60 bg-white p-3 shadow-sm sm:rounded-[1.5rem] sm:p-4" />
        </aside>
      </div>

      <section className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-lg sm:p-8">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-red px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white">
                General Feed
              </span>
              <h2 className="font-heading text-2xl font-black tracking-tight sm:text-3xl">
                GENERAL NEWS
              </h2>
              <p className="text-sm text-slate-300">
                All the latest posts from Radyo Bandera Surallah.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex aspect-[3/4] animate-pulse flex-col items-center justify-center gap-2 rounded-xl bg-slate-200"
            >
              <span className="text-xs font-semibold text-slate-400">STORY</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
