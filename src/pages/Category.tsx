import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getArticles, getArticlesSync } from "../lib/api";
import type { Article, Category as CategoryType } from "../types/news";
import { DateStamp } from "../components/common/DateStamp";
import { readingMinutes } from "../lib/utils";
import { CardGridSkeleton } from "../components/skeletons/CardGridSkeleton";
import { Pagination } from "../components/ui/Pagination";
import { SEO } from "../components/common/SEO";
import { Card } from "../components/ui/card";
import { BookOpen } from "lucide-react";

const validCategories: CategoryType[] = ["LOCAL", "REGIONAL", "NATIONAL"];

const categoryMeta: Record<CategoryType, { label: string; description: string; accent: string }> = {
  LOCAL: {
    label: "LOCAL NEWS",
    description: "Stories from Surallah and nearby communities — happening right in your neighbourhood.",
    accent: "from-brand-red via-red-800 to-brand-red",
  },
  REGIONAL: {
    label: "REGIONAL NEWS",
    description: "Coverage spanning SOCCSKSARGEN and the broader Mindanao region.",
    accent: "from-brand-blue via-blue-900 to-brand-blue",
  },
  NATIONAL: {
    label: "NATIONAL NEWS",
    description: "Top stories shaping the Philippines — politics, economy, culture, and more.",
    accent: "from-emerald-800 via-emerald-900 to-emerald-800",
  },
  OTHER: {
    label: "GENERAL NEWS",
    description: "Latest stories, public interest posts, and broadcast announcements.",
    accent: "from-slate-800 via-slate-900 to-slate-800",
  },
};

const PER_PAGE = 24;

export function Category() {
  const { category = "" } = useParams();
  const normalized = category.toUpperCase() as CategoryType;
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const isValid = useMemo(() => validCategories.includes(normalized), [normalized]);

  // ponytail: sync cache — return visitors see content immediately, no skeleton flash (page 1 only)
  const cachedFiltered = useMemo(() => {
    if (!isValid || page !== 1) return null;
    const all = getArticlesSync();
    return all ? all.filter((a) => a.category === normalized).slice(0, PER_PAGE) : null;
  }, [isValid, normalized, page]);

  const fetchPage = useCallback((p: number) => {
    if (!isValid) return;
    setLoading(true);
    getArticles({ category: normalized, limit: PER_PAGE, page: p }).then(({ articles, hasMore: hm }) => {
      setItems(articles);
      setHasMore(hm);
      setLoading(false);
    });
  }, [isValid, normalized]);

  useEffect(() => {
    fetchPage(page);
  }, [page, fetchPage]);

  const displayItems = cachedFiltered ?? items;
  const showSkeleton = loading && !cachedFiltered;

  if (!isValid) {
    return <p className="rounded-lg bg-white p-6">Unknown category.</p>;
  }

  const meta = categoryMeta[normalized] ?? categoryMeta.OTHER;

  return (
    <section className="space-y-8">
      <SEO title={meta.label.replace(" NEWS", "") + " News"} description={meta.description} />
      {/* ponytail: header banner renders immediately, no skeleton */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${meta.accent} p-6 text-white shadow-lg sm:p-10`}>
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
        <div className="relative z-10 flex flex-col gap-2">
          <span className="inline-flex w-fit items-center rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white/90">
            {meta.label}
          </span>
          <h1 className="font-heading text-3xl font-black tracking-tight sm:text-5xl">{meta.label}</h1>
          <p className="max-w-xl text-sm text-white/70 sm:text-base">{meta.description}</p>
        </div>
      </div>

      {showSkeleton ? (
        <CardGridSkeleton />
      ) : displayItems.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
          <BookOpen className="mx-auto mb-3 h-8 w-8 text-slate-400" />
          <p className="font-semibold">No articles available in this category yet.</p>
          <p className="mt-1 text-xs text-slate-400">Check back later for updates.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayItems.map((article) => (
            <Card
              key={article.id}
              className="group flex h-full flex-col overflow-hidden rounded-xl border-slate-100 bg-white shadow-sm transition-all duration-300 hover:shadow-md"
            >
              <Link to={`/article/${article.slug}`} className="block">
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-50">
                  <img
                    src={article.thumbnail || "/LOGO.jpg"}
                    alt={article.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    width="400"
                    height="250"
                  />
                </div>
              </Link>
              <div className="flex flex-1 flex-col space-y-3 p-4">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                  <DateStamp date={article.publishedAt} />
                  <span>{readingMinutes(article.body)} min read</span>
                </div>
                <Link
                  to={`/article/${article.slug}`}
                  className="block flex-1 font-heading text-base font-bold leading-snug text-slate-800 transition line-clamp-3 hover:text-brand-red"
                >
                  {article.title}
                </Link>
                <p className="text-xs leading-relaxed text-slate-500 line-clamp-2">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between border-t border-slate-50 pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    By {article.author.name}
                  </span>
                  <Link
                    to={`/article/${article.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-red hover:underline"
                  >
                    Read More &rarr;
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      {!showSkeleton && displayItems.length > 0 && (
        <Pagination page={page} hasMore={hasMore} onPrev={() => setPage((p) => p - 1)} onNext={() => setPage((p) => p + 1)} />
      )}
    </section>
  );
}
