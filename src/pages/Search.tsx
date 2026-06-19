import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Skeleton } from "boneyard-js/react";
import { getArticles } from "../lib/api";
import type { Article } from "../types/news";
import { NewsCard } from "../components/news/NewsCard";
import { SearchSkeleton } from "../components/skeletons/SearchSkeleton";
import { SEO } from "../components/common/SEO";
import { Search as SearchIcon } from "lucide-react";

export function Search() {
  const [params] = useSearchParams();
  const query = params.get("q") ?? "";
  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getArticles({ search: query, limit: 20 }).then((data) => {
      setResults(data);
      setLoading(false);
    });
  }, [query]);

  return (
    <Skeleton name="search" loading={loading} fallback={<SearchSkeleton />}>
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
          </>
        )}
      </section>
    </Skeleton>
  );
}
