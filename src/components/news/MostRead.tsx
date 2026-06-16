import { Link } from "react-router-dom";
import { DateStamp } from "../common/DateStamp";
import type { Article } from "../../types/news";

interface MostReadProps {
  articles: Article[];
}

export function MostRead({ articles }: MostReadProps) {
  return (
    <aside className="rounded-xl bg-slate-900 p-4 text-white">
      <h3 className="font-heading text-lg font-bold tracking-wide text-brand-yellow">MOST READ</h3>
      <ol className="mt-3 space-y-4">
        {articles.map((article, index) => (
          <li key={article.id} className="flex gap-3 border-b border-white/10 pb-3 last:border-none">
            <span className="font-heading text-2xl font-extrabold text-brand-yellow">{index + 1}</span>
            <div>
              <Link
                to={`/article/${article.slug}`}
                className="line-clamp-2 font-semibold leading-tight hover:text-brand-yellow"
              >
                {article.title}
              </Link>
              <DateStamp date={article.publishedAt} />
            </div>
          </li>
        ))}
      </ol>
    </aside>
  );
}
