import { useMemo, useRef, useState } from "react";
import { Volume2 } from "lucide-react";
import type { Article } from "../../types/news";

interface LiveBarProps {
  audioUrl: string;
  items: Article[];
}

export function LiveBar({ audioUrl, items }: LiveBarProps) {
  const [showAudio, setShowAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const ticker = useMemo(() => {
    if (!items.length) {
      return "Breaking updates will appear here.";
    }
    return items.map((item) => item.title).join("   •   ");
  }, [items]);

  const scrollToLive = () => {
    const el = document.getElementById("watch-live");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleAudio = () => {
    if (showAudio) {
      audioRef.current?.pause();
    }
    setShowAudio((v) => !v);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#040b22] text-white backdrop-blur-xl">
      <div className="mx-auto flex min-w-0 max-w-7xl items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4">
        <button
          type="button"
          onClick={scrollToLive}
          className="shrink-0 rounded-full bg-brand-red px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_24px_rgba(204,0,0,0.35)] transition hover:brightness-110 sm:px-4 sm:py-1.5 sm:text-xs"
        >
          WATCH LIVE
        </button>
        <p aria-live="polite" className="ticker min-w-0 flex-1 overflow-hidden whitespace-nowrap text-[11px] sm:text-xs">
          <span className="inline-block min-w-full animate-ticker pr-12 text-slate-200">{ticker}</span>
        </p>
        {showAudio && (
          <audio
            ref={audioRef}
            controls
            autoPlay
            src={audioUrl}
            className="h-7 max-w-[140px] sm:max-w-[180px]"
            onEnded={() => setShowAudio(false)}
          />
        )}
        <button
          type="button"
          onClick={toggleAudio}
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-brand-yellow px-2.5 py-1.5 text-[11px] font-black uppercase tracking-wider text-slate-900 shadow-[0_8px_24px_rgba(255,215,0,0.28)] transition hover:brightness-110 sm:px-4 sm:py-1.5 sm:text-xs"
        >
          <Volume2 className="h-3 w-3" aria-hidden="true" />
          {showAudio ? "STOP" : "LISTEN LIVE"}
        </button>
      </div>
    </div>
  );
}
