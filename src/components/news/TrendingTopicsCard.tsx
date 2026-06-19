import { useState } from "react";
import { ChevronUp, X, Flame } from "lucide-react";
import { Link } from "react-router-dom";
import type { TrendingTopic } from "../../types/news";

interface TrendingTopicsCardProps {
  topics: TrendingTopic[];
  onClose?: () => void;
}

export function TrendingTopicsCard({ topics, onClose }: TrendingTopicsCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (topics.length === 0) return null;

  return (
    <>
      {isExpanded && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}

      <div
        className={`fixed bottom-0 left-0 right-0 z-40 lg:hidden transition-all duration-300 ${
          isExpanded ? "translate-y-0" : "translate-y-[calc(100%-3rem)]"
        }`}
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="rounded-t-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white shadow-2xl">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex w-full items-center justify-between border-b border-white/10 px-4 py-3 hover:bg-slate-800/50"
          >
            <h3 className="flex items-center gap-1.5 font-heading text-sm font-bold tracking-wide">
              <Flame className="h-4 w-4 text-orange-400" />
              <span className="bg-gradient-to-r from-orange-400 to-brand-yellow bg-clip-text text-transparent">
                TRENDING
              </span>
            </h3>
            <ChevronUp
              className={`h-5 w-5 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>

          <div
            className={`overflow-hidden transition-all ${
              isExpanded ? "max-h-96" : "max-h-0"
            }`}
          >
            <div className="space-y-2 px-4 py-3">
              <p className="text-xs text-slate-400">Hot topics right now</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {topics.map((topic) => (
                  <Link
                    key={topic.slug}
                    to={`/search?q=${encodeURIComponent(topic.name)}`}
                    onClick={() => setIsExpanded(false)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-slate-200 transition-all hover:bg-brand-yellow hover:text-slate-900"
                  >
                    <span>{topic.name}</span>
                    <span className="rounded-full bg-white/20 px-1.5 text-[10px] font-bold tabular-nums text-slate-300">
                      {topic.count}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {onClose && (
              <button
                onClick={() => {
                  setIsExpanded(false);
                  onClose();
                }}
                className="flex w-full items-center justify-center gap-1 border-t border-white/10 px-4 py-2 text-center text-xs font-semibold text-slate-400 hover:bg-slate-800/50"
              >
                <X className="h-4 w-4" />
                Close
              </button>
            )}
          </div>

          {!isExpanded && topics.length > 0 && (
            <div className="flex items-center gap-1 px-4 py-2 text-xs text-slate-400 pointer-events-none">
              <Flame className="h-3 w-3 flex-shrink-0 text-orange-400" />
              <span className="truncate">
                {topics.slice(0, 3).map((t) => t.name).join(", ")}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
