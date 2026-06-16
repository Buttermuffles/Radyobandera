import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getArticles } from "../lib/api";
import type { Article } from "../types/news";
import { NewsCard } from "../components/news/NewsCard";

export function Search() {
  const [params] = useSearchParams();
  const query = params.get("q") ?? "";
  const [results, setResults] = useState<Article[]>([]);

  useEffect(() => {
    getArticles({ search: query, limit: 20 }).then(setResults);
  }, [query]);

  return (
    <section className="space-y-4">
      <h1 className="font-heading text-2xl font-black text-brand-blue sm:text-3xl">Search: {query || "All"}</h1>
      {results.length === 0 ? <p className="rounded-lg bg-white p-6">No matching stories found.</p> : null}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((article) => (
          <NewsCard key={article.id} article={article} variant="grid" />
        ))}
      </div>
    </section>
  );
}
