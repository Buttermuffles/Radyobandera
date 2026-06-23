import { Link } from "react-router-dom";
import type { Article } from "../../types/news";
import { NewsCard } from "./NewsCard";

interface SectionBlockProps {
  title: string;
  articles: Article[];
  showMore?: boolean;
}

export function SectionBlock({ title, articles, showMore = true }: SectionBlockProps) {
  if (!articles.length) return null;

  return (
    <section>
      <header className="mb-2 flex items-center gap-3 sm:mb-3">
        <h2 className="font-heading text-lg font-black tracking-tight text-brand-blue sm:text-2xl md:text-3xl">{title}</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-slate-300 to-transparent" />
        {showMore ? (
          <Link
            to={`/category/${title}`}
            className="font-ui whitespace-nowrap text-xs font-semibold uppercase tracking-widest text-brand-red hover:underline"
          >
            View all
          </Link>
        ) : null}
      </header>

      <div className="relative">
        {/* Mobile carousel: horizontal scroll with proper snap behavior */}
        <div
          className="flex gap-4 overflow-x-auto scroll-smooth pb-2 sm:hidden"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {articles.map((article) => (
            <div
              key={article.id}
              className="w-[75vw] min-w-[75vw] flex-none snap-start"
              style={{ scrollSnapAlign: "start" }}
            >
              <NewsCard article={article} variant="grid" />
            </div>
          ))}
        </div>

        {/* Tablet/Desktop grid layout */}
        <div className="hidden gap-4 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
          {articles.map((article) => (
            <div key={article.id}>
              <NewsCard article={article} variant="grid" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
