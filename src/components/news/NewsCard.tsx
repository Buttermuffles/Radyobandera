import { Link } from "react-router-dom";
import { DateStamp } from "../common/DateStamp";
import { CategoryBadge } from "../common/CategoryBadge";
import { Card, CardContent } from "../ui/card";
import { cn, readingMinutes } from "../../lib/utils";
import type { Article } from "../../types/news";

interface NewsCardProps {
  article: Article;
  variant: "hero" | "grid" | "list" | "sidebar" | "compact";
}

export function NewsCard({ article, variant }: NewsCardProps) {
  const isHero = variant === "hero";
  const isList = variant === "list";
  const isCompact = variant === "compact";
  const isGrid = variant === "grid";
  const imageClass = isHero
    ? "h-[200px] sm:h-[300px] lg:h-[360px]"
    : isCompact
      ? "aspect-video"
      : isGrid
        ? "h-28 sm:h-44"
        : "h-36 sm:h-44";

  if (isCompact) {
    return (
      <Link
        to={`/article/${article.slug}`}
        className="group block w-full space-y-2 rounded-xl bg-white shadow-[0_8px_25px_rgba(15,23,42,0.06)] transition-shadow duration-200 hover:shadow-[0_16px_35px_rgba(15,23,42,0.12)]"
      >
        <div className="relative overflow-hidden rounded-t-xl">
          <img
            src={article.thumbnail}
            alt={article.title}
            className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute bottom-2 left-2">
            <CategoryBadge category={article.category} />
          </div>
        </div>
        <div className="space-y-1 px-3 pb-3">
          <h3 className="line-clamp-2 font-heading text-sm font-semibold leading-snug text-brand-dark group-hover:text-brand-red">
            {article.title}
          </h3>
          <div className="flex items-center gap-1 text-[11px] text-brand-muted">
            <DateStamp date={article.publishedAt} />
            <span aria-hidden="true">·</span>
            <span>{readingMinutes(article.body)} min</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Card
      className={cn(
        "overflow-hidden border-white/70 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.08)] transition-transform duration-200 hover:-translate-y-1",
        isGrid && "flex h-full flex-col",
        isList && "flex",
        variant === "sidebar" && "bg-slate-900 text-white",
      )}
    >
      <img
        src={article.thumbnail}
        alt={article.title}
        className={cn(
          "w-full object-cover",
          imageClass,
          isList && "h-full w-40 flex-none",
          variant === "sidebar" && "h-32",
        )}
        loading="lazy"
      />
      <CardContent
        className={cn(
          "space-y-2",
          isGrid && "flex flex-1 flex-col",
          variant === "sidebar" && "text-white",
        )}
      >
        <CategoryBadge category={article.category} />
        <Link
          to={`/article/${article.slug}`}
          className={cn(
            "block font-heading leading-tight text-brand-dark hover:text-brand-red",
            isHero ? "text-2xl sm:text-3xl font-bold" : isGrid ? "text-sm sm:text-lg font-semibold" : "text-base sm:text-lg font-semibold",
            isGrid && "line-clamp-2",
            variant === "sidebar" && "text-white hover:text-brand-yellow",
          )}
        >
          {article.title}
        </Link>
        <p
          className={cn(
            "hidden text-sm leading-6 sm:line-clamp-2",
            isGrid && "sm:line-clamp-3",
            variant === "sidebar" ? "text-white/80" : "text-slate-600",
          )}
        >
          {article.excerpt}
        </p>
        <div className={cn("flex items-center justify-between gap-1 text-xs sm:gap-2", isGrid && "mt-auto") }>
          <DateStamp date={article.publishedAt} />
          <span className={cn(variant === "sidebar" ? "text-white/80" : "text-brand-muted")}>
            {readingMinutes(article.body)} min read
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
