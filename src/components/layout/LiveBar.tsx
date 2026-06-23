import { useMemo } from "react";
import type { Article } from "../../types/news";

interface LiveBarProps {
  audioUrl: string;
  items: Article[];
}

export function LiveBar({ audioUrl: _audioUrl, items }: LiveBarProps) {
  const ticker = useMemo(() => {
    if (!items.length) {
      return "No recent posts";
    }
    const joined = items.map((item) => item.title).join("   •   ");
    return `${joined}   •   ${joined}`;
  }, [items]);

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#040b22] text-white backdrop-blur-xl">
      <div className="mx-auto flex min-w-0 max-w-7xl items-center gap-3 px-3 py-2 sm:px-4">
        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-brand-red/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-red-400 sm:px-3 sm:text-xs">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
          LIVE
        </span>
        <div className="relative min-w-0 flex-1 overflow-hidden">
          {/* gradient fade on edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-[#040b22] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-[#040b22] to-transparent" />
          <p
            aria-live="polite"
            className="whitespace-nowrap text-[12px] font-semibold tracking-wide text-slate-200 sm:text-sm"
          >
            <span className="inline-block min-w-full animate-ticker">{ticker}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
