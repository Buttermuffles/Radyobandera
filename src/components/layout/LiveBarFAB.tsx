import { useState, useRef } from "react";
import { Volume2, Play } from "lucide-react";

interface LiveBarFABProps {
  isLive: boolean;
  audioUrl: string;
  onWatchClick?: () => void;
  onListenClick?: () => void;
}

export function LiveBarFAB({ isLive, audioUrl, onWatchClick, onListenClick }: LiveBarFABProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  return (
    <>
      {/* Expanded panel */}
      {isExpanded && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setIsExpanded(false)} />
      )}

      {/* FAB Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 lg:hidden">
        {/* Expanded menu */}
        {isExpanded && (
          <div className="flex flex-col gap-3 rounded-2xl bg-slate-900 p-4 shadow-lg">
            {/* Top row: Watch + Listen buttons */}
            <div className="flex flex-row gap-2">
              <button
                onClick={() => {
                  onWatchClick?.();
                  setIsExpanded(false);
                }}
                className="flex min-h-touch min-w-touch flex-1 items-center justify-center gap-2 rounded-lg bg-brand-red px-3 py-2 text-xs font-bold uppercase text-white transition hover:bg-red-700"
              >
                <Play className="h-4 w-4" />
                Watch
              </button>

              <button
                onClick={() => {
                  onListenClick?.();
                  setIsExpanded(false);
                }}
                className="flex min-h-touch min-w-touch flex-1 items-center justify-center gap-2 rounded-lg bg-brand-yellow px-3 py-2 text-xs font-bold uppercase text-slate-900 transition hover:bg-yellow-500"
              >
                <Volume2 className="h-4 w-4" />
                Listen
              </button>
            </div>

            {/* Volume control */}
            <div className="flex items-center gap-2">
              <Volume2 className="h-3 w-3 text-slate-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                defaultValue="0.5"
                onChange={(e) => {
                  if (audioRef.current) {
                    audioRef.current.volume = parseFloat(e.target.value);
                  }
                }}
                className="h-1.5 w-28 rounded-full"
              />
            </div>
          </div>
        )}

        {/* Main FAB button */}
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

      {/* Hidden audio element */}
      <audio ref={audioRef} src={audioUrl} />
    </>
  );
}
