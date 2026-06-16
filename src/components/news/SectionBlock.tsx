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
      <header className="mb-2 flex items-center justify-between sm:mb-3">
        <h2 className="font-heading text-lg font-black tracking-tight text-brand-blue sm:text-2xl">{title}</h2>
        {showMore ? (
          <Link
            to={`/category/${title}`}
            className="font-ui whitespace-nowrap text-xs font-semibold uppercase tracking-widest text-brand-red hover:underline"
          >
            See all
          </Link>
        ) : null}
      </header>

      <div className="relative">
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 scroll-smooth sm:-mx-5 sm:gap-4 sm:px-5">
          {articles.map((article) => (
            <div key={article.id} className="w-[44vw] min-w-[180px] max-w-[280px] flex-none snap-start sm:w-[220px] md:w-[260px]">
              <NewsCard article={article} variant="compact" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
