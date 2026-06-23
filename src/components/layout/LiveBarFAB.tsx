import { useState } from "react";
import { Play } from "lucide-react";

interface LiveBarFABProps {
  isLive: boolean;
  onWatchClick?: () => void;
}

export function LiveBarFAB({ isLive, onWatchClick }: LiveBarFABProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {isExpanded && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setIsExpanded(false)} />
      )}

      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 lg:hidden">
        {isExpanded && (
          <div className="flex flex-col gap-3 rounded-2xl bg-slate-900 p-4 shadow-lg">
            <div className="flex flex-row gap-2">
              <button
                onClick={() => {
                  onWatchClick?.();
                  setIsExpanded(false);
                }}
                className="flex min-h-touch min-w-touch items-center justify-center gap-2 rounded-lg bg-brand-red px-5 py-2 text-xs font-bold uppercase text-white transition hover:bg-red-700"
              >
                <Play className="h-4 w-4" />
                Watch
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex min-h-touch min-w-touch items-center justify-center rounded-full shadow-lg transition-all active:scale-95 ${
            isLive
              ? "animate-pulse bg-brand-red text-white"
              : "bg-slate-700 text-slate-300"
          }`}
          title={isLive ? "LIVE NOW" : "OFF AIR"}
        >
          <div className="flex flex-col items-center gap-0.5">
            <span className={`text-lg font-bold ${isLive ? "text-white" : "text-slate-400"}`}>
              {isLive ? "●" : "○"}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider">
              {isLive ? "Live" : "Off"}
            </span>
          </div>
        </button>
      </div>
    </>
  );
}
