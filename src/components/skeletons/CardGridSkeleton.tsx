interface CardGridSkeletonProps {
  header?: boolean;
  count?: number;
}

export function CardGridSkeleton({ header = true, count = 6 }: CardGridSkeletonProps) {
  return (
    <div className="space-y-6">
      {header && (
        <div className="flex aspect-[6/1] animate-pulse flex-col items-center justify-center gap-1 rounded-2xl bg-gradient-to-r from-slate-200 to-slate-300 p-6 sm:p-10">
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(count)].map((_, i) => (
          <div
            key={i}
            className="flex aspect-[3/4] animate-pulse flex-col items-center justify-center gap-2 rounded-xl bg-slate-200"
          >
            <span className="text-xs font-semibold text-slate-400">CARD</span>
          </div>
        ))}
      </div>
    </div>
  );
}
