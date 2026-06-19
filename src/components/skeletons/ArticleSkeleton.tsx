export function ArticleSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-8">
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-24 animate-pulse items-center justify-center rounded-full bg-slate-200">
          <span className="text-[10px] font-semibold text-slate-400">CATEGORY</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex h-10 animate-pulse items-center rounded bg-slate-200 px-3 sm:h-14">
          <span className="text-xs font-semibold text-slate-400">TITLE</span>
        </div>
        <div className="flex h-10 w-3/4 animate-pulse items-center rounded bg-slate-200 px-3 sm:h-14">
          <span className="text-xs font-semibold text-slate-400">SUBTITLE</span>
        </div>
      </div>

      <div className="flex h-4 w-48 animate-pulse items-center rounded bg-slate-200 px-2">
        <span className="text-[10px] font-semibold text-slate-400">BY AUTHOR · DATE</span>
      </div>

      <div className="flex aspect-[16/9] animate-pulse items-center justify-center rounded-xl bg-slate-200">
        <span className="text-xs font-semibold text-slate-400">IMAGE</span>
      </div>

      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex h-4 animate-pulse items-center rounded bg-slate-200 px-2"
            style={{ width: `${[100, 92, 85, 78, 95][i]}%` }}
          >
            <span className="text-[10px] font-semibold text-slate-400">BODY TEXT</span>
          </div>
        ))}
      </div>

      <div className="flex h-10 w-40 animate-pulse items-center justify-center rounded-full bg-slate-200">
        <span className="text-[10px] font-semibold text-slate-400">SHARE BUTTON</span>
      </div>
    </div>
  );
}
