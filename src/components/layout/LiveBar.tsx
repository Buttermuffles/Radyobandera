import { useMemo } from "react";
import { Volume2 } from "lucide-react";
import type { Article } from "../../types/news";

interface LiveBarProps {
  audioUrl: string;
  items: Article[];
}

export function LiveBar({ audioUrl, items }: LiveBarProps) {
  const ticker = useMemo(() => {
    if (!items.length) {
      return "Breaking updates will appear here.";
    }

    return items.map((item) => item.title).join("   •   ");
  }, [items]);

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-slate-950/96 text-white backdrop-blur-xl">
      <div className="mx-auto flex min-w-0 max-w-7xl items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4">
        <button
          type="button"
          className="shrink-0 rounded-full bg-brand-red px-2 py-1 text-[10px] font-bold uppercase tracking-wider shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_24px_rgba(204,0,0,0.35)] sm:px-3 sm:text-xs"
        >
          ▶ WATCH LIVE
        </button>
        <p aria-live="polite" className="ticker min-w-0 flex-1 overflow-hidden whitespace-nowrap text-[11px] sm:text-xs">
          <span className="inline-block min-w-full animate-ticker pr-12 text-slate-200">{ticker}</span>
        </p>
        <div className="hidden items-center gap-2 sm:flex">
          <Volume2 className="h-4 w-4" aria-hidden="true" />
          <audio controls src={audioUrl} className="h-7" />
        </div>
        <button
          type="button"
          className="shrink-0 rounded-full bg-brand-yellow px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-900 shadow-[0_8px_24px_rgba(255,215,0,0.28)] sm:px-3 sm:text-xs"
        >
          ▶ LISTEN LIVE
        </button>
      </div>
    </div>
  );
}
