import { Link } from "react-router-dom";
import { Flame } from "lucide-react";
import type { TrendingTopic } from "../../types/news";

interface TrendingTopicsProps {
  topics: TrendingTopic[];
}

export function TrendingTopics({ topics }: TrendingTopicsProps) {
  if (topics.length === 0) return null;

  return (
    <aside className="rounded-xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-4 text-white shadow-lg">
      <h3 className="flex items-center gap-2 font-heading text-lg font-bold tracking-wide">
        <Flame className="h-5 w-5 text-orange-400" />
        <span className="bg-gradient-to-r from-orange-400 to-brand-yellow bg-clip-text text-transparent">
          TRENDING
        </span>
      </h3>
      <p className="mt-1 text-xs text-slate-400">Hot topics right now</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {topics.map((topic) => (
          <Link
            key={topic.slug}
            to={`/search?q=${encodeURIComponent(topic.name)}`}
            className="group inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-slate-200 transition-all hover:bg-brand-yellow hover:text-slate-900"
          >
            <span>{topic.name}</span>
            <span className="rounded-full bg-white/20 px-1.5 text-[10px] font-bold tabular-nums text-slate-300 transition-all group-hover:bg-brand-yellow/30 group-hover:text-slate-700">
              {topic.count}
            </span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
