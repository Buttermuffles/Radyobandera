import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getArticles, getArticlesSync } from "../lib/api";
import type { Article } from "../types/news";
import { NewsCard } from "../components/news/NewsCard";
import { Pagination } from "../components/ui/Pagination";
import { SearchSkeleton } from "../components/skeletons/SearchSkeleton";
import { SEO } from "../components/common/SEO";
import { Search as SearchIcon } from "lucide-react";

const PER_PAGE = 24;

export function Search() {
  const [params] = useSearchParams();
  const query = (params.get("q") ?? "").trim().replace(/^#/, '');
  const [results, setResults] = useState<Article[]>(() => {
    if (query) return [];
    const cached = getArticlesSync();
    return cached || [];
  });
  const [loading, setLoading] = useState(() => !!(query || !getArticlesSync()));
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchPage = useCallback((p: number) => {
    setLoading(true);
    const opts = query ? { search: query, limit: PER_PAGE, page: p } : { limit: PER_PAGE, page: p };
    getArticles(opts).then(({ articles, hasMore: hm }) => {
      setResults(articles);
      setHasMore(hm);
      setLoading(false);
    });
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    fetchPage(page);
  }, [page, fetchPage]);

  if (loading) return <SearchSkeleton />;

  return (
    <section className="space-y-4">
      <SEO title={query ? `Search: ${query}` : "All Stories"} description={`Search results for ${query || "all news"} on Radyo Bandera Surallah.`} />
      <h1 className="font-heading text-2xl font-black text-brand-blue sm:text-3xl">
        {query ? `Search: "${query}"` : "All Stories"}
      </h1>

      {results.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 py-16 text-slate-400">
          <SearchIcon className="h-10 w-10 text-slate-300" />
          <p className="font-semibold text-slate-500">No matching stories found.</p>
          <p className="text-xs text-slate-400">Try a different search term or browse categories.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500">{results.length} result{results.length !== 1 ? "s" : ""} found</p>
          <div className="grid grid-cols-2 gap-2 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((article) => (
              <NewsCard key={article.id} article={article} variant="grid" />
            ))}
          </div>
          <Pagination page={page} hasMore={hasMore} onPrev={() => setPage((p) => p - 1)} onNext={() => setPage((p) => p + 1)} />
        </>
      )}
    </section>
  );
}
