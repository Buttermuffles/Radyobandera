interface CardGridSkeletonProps {
  header?: boolean;
  count?: number;
}

export function CardGridSkeleton({ header = true, count = 6 }: CardGridSkeletonProps) {
  return (
    <div className="space-y-6">
      {header && (
        <div className="aspect-[6/1] animate-pulse rounded-2xl bg-gradient-to-r from-slate-200 to-slate-300" />
      )}

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="animate-pulse space-y-3 rounded-xl border border-slate-100 bg-white p-4">
            <div className="aspect-[16/10] rounded-lg bg-slate-200" />
            <div className="space-y-2">
              <div className="h-3 w-3/4 rounded bg-slate-200" />
              <div className="h-3 w-1/2 rounded bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
