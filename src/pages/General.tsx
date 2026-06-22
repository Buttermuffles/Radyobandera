import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getArticles, getArticlesSync } from "../lib/api";
import type { Article } from "../types/news";
import { DateStamp } from "../components/common/DateStamp";
import { readingMinutes } from "../lib/utils";
import { CardGridSkeleton } from "../components/skeletons/CardGridSkeleton";
import { Pagination } from "../components/ui/Pagination";
import { SEO } from "../components/common/SEO";
import { Card } from "../components/ui/card";
import { Globe, BookOpen } from "lucide-react";

const PER_PAGE = 24;

export function General() {
  // ponytail: seed from cache — return visitors see all categories on first render
  const [items, setItems] = useState<Article[]>(() => getArticlesSync() || []);
  const [loading, setLoading] = useState(() => !getArticlesSync());
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchPage = useCallback((p: number) => {
    setLoading(true);
    getArticles({ limit: PER_PAGE, page: p }).then(({ articles, hasMore: hm }) => {
      setItems(articles);
      setHasMore(hm);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    fetchPage(page);
  }, [page, fetchPage]);

  return (
    <section className="space-y-8">
      <SEO title="General News" description="Latest stories, public interest posts, and broadcast announcements from Radyo Bandera Surallah." />
      {/* ponytail: header banner renders immediately, no skeleton */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-lg sm:p-10">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
        <div className="relative z-10 flex flex-col gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-red px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white">
            <Globe className="h-3 w-3" />
            General Feed
          </span>
          <h1 className="font-heading text-3xl font-black tracking-tight sm:text-5xl">GENERAL NEWS</h1>
          <p className="max-w-xl text-sm text-slate-300 sm:text-base">
            Latest stories, public interest posts, and broadcast announcements from Radyo Bandera Surallah.
          </p>
        </div>
      </div>

      {loading ? (
        <CardGridSkeleton header={false} />
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
          <BookOpen className="mx-auto mb-3 h-8 w-8 text-slate-400" />
          <p className="font-semibold">No general articles available at the moment.</p>
          <p className="text-xs text-slate-400 mt-1">Check back later for updates.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((article) => (
            <Card
              key={article.id}
              className="group overflow-hidden border-slate-100 bg-white shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full rounded-xl"
            >
              <Link to={`/article/${article.slug}`} className="block">
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-50">
                  <img
                    src={article.thumbnail || "/LOGO.jpg"}
                    alt={article.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                    width="400"
                    height="250"
                  />
                </div>
              </Link>
              <div className="flex flex-1 flex-col p-4 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                  <DateStamp date={article.publishedAt} />
                  <span>{readingMinutes(article.body)} min read</span>
                </div>
                <Link
                  to={`/article/${article.slug}`}
                  className="block font-heading text-base font-bold text-slate-800 hover:text-brand-red transition line-clamp-3 leading-snug flex-1"
                >
                  {article.title}
                </Link>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {article.excerpt}
                </p>
                <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    By {article.author.name}
                  </span>
                  <Link
                    to={`/article/${article.slug}`}
                    className="text-xs font-bold text-brand-red hover:underline inline-flex items-center gap-1"
                  >
                    Read More &rarr;
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      {!loading && items.length > 0 && (
        <Pagination page={page} hasMore={hasMore} onPrev={() => setPage((p) => p - 1)} onNext={() => setPage((p) => p + 1)} />
      )}
    </section>
  );
}
