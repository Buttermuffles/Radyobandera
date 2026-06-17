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
  
  // Responsive image heights: mobile-optimized
  const imageClass = isHero
    ? "h-44 sm:h-56 md:h-72 lg:h-96"  // Responsive hero heights
    : isCompact
      ? "aspect-video"
      : isGrid
        ? "h-24 sm:h-32 md:h-40 lg:h-52"  // Better mobile scaling
        : "h-32 sm:h-40 md:h-48 lg:h-56";  // Sidebar responsive

  if (isCompact) {
    return (
      <Link
        to={`/article/${article.slug}`}
        className="group block w-full space-y-2 rounded-lg xs:rounded-xl bg-white shadow-card hover:shadow-card-hover transition-shadow duration-200"
      >
        <div className="relative overflow-hidden rounded-t-lg xs:rounded-t-xl">
          <img
            src={article.thumbnail}
            alt={article.title}
            className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute bottom-1 left-1 xs:bottom-2 xs:left-2">
            <CategoryBadge category={article.category} />
          </div>
        </div>
        <div className="space-y-1 px-2 pb-2 xs:px-3 xs:pb-3">
          <h3 className="line-clamp-2 font-heading text-xs xs:text-sm font-semibold leading-snug text-brand-dark group-hover:text-brand-red">
            {article.title}
          </h3>
          <div className="flex items-center gap-1 text-[10px] xs:text-[11px] text-brand-muted">
            <DateStamp date={article.publishedAt} />
            <span aria-hidden="true">·</span>
            <span>{readingMinutes(article.body)} min</span>
          </div>
        </div>
      </Link>
    );
  }

  // List variant: stack on mobile, side-by-side on sm+
  if (isList) {
    return (
      <Card
        className="overflow-hidden border-white/70 bg-white shadow-card hover:shadow-card-hover transition-transform duration-200 hover:-translate-y-1 flex flex-col xs:flex-row"
      >
        <img
          src={article.thumbnail}
          alt={article.title}
          className={cn(
            "w-full object-cover",
            imageClass,
            "xs:h-32 xs:w-32 xs:flex-none sm:h-40 sm:w-40"
          )}
          loading="lazy"
        />
        <CardContent className="space-y-2 flex-1 min-w-0">
          <CategoryBadge category={article.category} />
          <Link
            to={`/article/${article.slug}`}
            className="block font-heading leading-tight text-brand-dark hover:text-brand-red text-sm xs:text-base font-semibold line-clamp-2"
          >
            {article.title}
          </Link>
          <p className="hidden text-xs xs:text-sm leading-5 line-clamp-2 text-slate-600">
            {article.excerpt}
          </p>
          <div className="flex items-center justify-between gap-1 text-xs">
            <DateStamp date={article.publishedAt} />
            <span className="text-brand-muted">{readingMinutes(article.body)} min</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default: hero, grid, and sidebar variants
  return (
    <Card
      className={cn(
        "overflow-hidden border-white/70 bg-white shadow-card hover:shadow-card-hover transition-transform duration-200 hover:-translate-y-1",
        isGrid && "flex h-full flex-col",
        variant === "sidebar" && "bg-slate-900 text-white border-white/20",
      )}
    >
      <img
        src={article.thumbnail}
        alt={article.title}
        className={cn(
          "w-full object-cover",
          imageClass,
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
            "block font-heading leading-tight text-brand-dark hover:text-brand-red transition",
            isHero ? "text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold" 
            : isGrid ? "text-xs xs:text-sm sm:text-base md:text-lg font-semibold line-clamp-2"
            : "text-base sm:text-lg font-semibold",
            variant === "sidebar" && "text-white hover:text-brand-yellow",
          )}
        >
          {article.title}
        </Link>
        <p
          className={cn(
            "hidden text-xs xs:text-sm leading-5 sm:leading-6",
            isHero ? "sm:line-clamp-3" : isGrid ? "sm:line-clamp-2" : "sm:line-clamp-2",
            variant === "sidebar" ? "text-white/80" : "text-slate-600",
          )}
        >
          {article.excerpt}
        </p>
        <div className={cn("flex items-center justify-between gap-1 text-[11px] xs:text-xs sm:gap-2", isGrid && "mt-auto")}>
          <DateStamp date={article.publishedAt} />
          <span className={cn(variant === "sidebar" ? "text-white/80" : "text-brand-muted")}>
            {readingMinutes(article.body)} min read
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
