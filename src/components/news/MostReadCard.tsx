import { useState } from "react";
import { ChevronUp, X } from "lucide-react";
import { Link } from "react-router-dom";
import { DateStamp } from "../common/DateStamp";
import type { Article } from "../../types/news";

interface MostReadCardProps {
  articles: Article[];
  onClose?: () => void;
}

export function MostReadCard({ articles, onClose }: MostReadCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Backdrop (only show when expanded) */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Bottom sticky card */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 lg:hidden transition-all duration-300 ${
          isExpanded ? "translate-y-0" : "translate-y-[calc(100%-3rem)]"
        }`}
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* Card */}
        <div className="rounded-t-2xl bg-slate-900 text-white shadow-2xl">
          {/* Handle/header */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex w-full items-center justify-between border-b border-white/10 px-4 py-3 hover:bg-slate-800/50"
          >
            <h3 className="font-heading text-sm font-bold tracking-wide text-brand-yellow">
              MOST READ
            </h3>
            <ChevronUp
              className={`h-5 w-5 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Content */}
          <div
            className={`overflow-hidden transition-all ${
              isExpanded ? "max-h-96" : "max-h-0"
            }`}
          >
            <div className="space-y-0 px-4 py-3">
              <ol className="space-y-3">
                {articles.slice(0, 4).map((article, index) => (
                  <li key={article.id} className="flex gap-2 pb-2 last:pb-0">
                    <span className="font-heading text-lg font-extrabold text-brand-yellow flex-shrink-0">
                      {index + 1}
                    </span>
                    <Link
                      to={`/article/${article.slug}`}
                      onClick={() => setIsExpanded(false)}
                      className="min-w-0 flex-1"
                    >
                      <p className="line-clamp-2 text-xs font-semibold leading-snug hover:text-brand-yellow">
                        {article.title}
                      </p>
                      <DateStamp date={article.publishedAt} />
                    </Link>
                  </li>
                ))}
              </ol>
            </div>

            {/* Close button */}
            {onClose && (
              <button
                onClick={() => {
                  setIsExpanded(false);
                  onClose();
                }}
                className="w-full border-t border-white/10 px-4 py-2 text-center text-xs font-semibold text-slate-400 hover:bg-slate-800/50 flex items-center justify-center gap-1"
              >
                <X className="h-4 w-4" />
                Close
              </button>
            )}
          </div>

          {/* Peek preview (when collapsed) */}
          {!isExpanded && articles.length > 0 && (
            <div className="px-4 py-2 text-xs text-slate-400 line-clamp-1 pointer-events-none">
              {articles[0]?.title}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
