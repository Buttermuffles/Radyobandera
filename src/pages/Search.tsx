import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getArticles, getArticlesSync } from "../lib/api";
import type { Article, Category } from "../types/news";
import { NewsCard } from "../components/news/NewsCard";
import { Pagination } from "../components/ui/Pagination";
import { SearchSkeleton } from "../components/skeletons/SearchSkeleton";
import { SEO } from "../components/common/SEO";
import { Search as SearchIcon, X, Tag } from "lucide-react";

const PER_PAGE = 24;
const CATEGORIES: Category[] = ["LOCAL", "REGIONAL", "NATIONAL", "OTHER"];

function normalizeQuery(raw: string): { query: string; isCategorySearch: boolean } {
  const trimmed = raw.trim();
  const withoutHash = trimmed.startsWith("#") ? trimmed.slice(1) : trimmed;
  const upper = withoutHash.toUpperCase() as Category;
  const isCategorySearch =
    trimmed.startsWith("#") || CATEGORIES.includes(upper);
  return {
    query: isCategorySearch ? upper : withoutHash,
    isCategorySearch,
  };
}

export function Search() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const raw = params.get("q") ?? "";
  const { query, isCategorySearch } = normalizeQuery(raw);

  const [results, setResults] = useState<Article[]>(() => {
    if (query) return [];
    return getArticlesSync() || [];
  });
  const [loading, setLoading] = useState(() => !!(query || !getArticlesSync()));
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [inputValue, setInputValue] = useState(
    isCategorySearch ? `#${query}` : query
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchPage = useCallback(
    (p: number) => {
      setLoading(true);
      const opts = query
        ? isCategorySearch
          ? { category: query as Category, limit: PER_PAGE, page: p }
          : { search: query, limit: PER_PAGE, page: p }
        : { limit: PER_PAGE, page: p };
      getArticles(opts).then(({ articles, hasMore: hm }) => {
        setResults(articles);
        setHasMore(hm);
        setLoading(false);
      });
    },
    [query, isCategorySearch]
  );

  useEffect(() => {
    setPage(1);
    setInputValue(isCategorySearch ? `#${query}` : query);
  }, [query, isCategorySearch]);

  useEffect(() => {
    fetchPage(page);
  }, [page, fetchPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) {
      navigate("/search");
      return;
    }
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleClear = () => {
    setInputValue("");
    navigate("/search");
    inputRef.current?.focus();
  };

  const handleCategoryClick = (cat: Category) => {
    navigate(`/search?q=%23${cat}`);
  };

  // Heading text
  const headingText = query
    ? isCategorySearch
      ? `#${query}`
      : `Results for "${query}"`
    : "All Stories";

  return (
    <section className="space-y-6">
      <SEO
        title={headingText}
        description={
          isCategorySearch
            ? `Browse ${query} news articles on Radyo Bandera Surallah.`
            : `Search results for ${query || "all news"} on Radyo Bandera Surallah.`
        }
      />

      {/* ── Inline search bar ── */}
      <form onSubmit={handleSearch} className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search stories or type #LOCAL…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-10 text-sm text-slate-800 shadow-sm outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 placeholder:text-slate-400"
          />
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-blue/90 transition"
        >
          Search
        </button>
      </form>

      {/* ── Category pill shortcuts ── */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const active = isCategorySearch && query === cat;
          return (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition ${
                active
                  ? "border-brand-blue bg-brand-blue text-white shadow"
                  : "border-slate-200 bg-white text-slate-600 hover:border-brand-blue hover:text-brand-blue"
              }`}
            >
              <Tag className="h-3 w-3" />
              {cat}
            </button>
          );
        })}
      </div>

      {/* ── Heading ── */}
      <h1 className="font-heading text-2xl font-black text-brand-blue sm:text-3xl">
        {headingText}
      </h1>

      {/* ── Results ── */}
      {loading ? (
        <SearchSkeleton />
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 py-16 text-slate-400">
          <SearchIcon className="h-10 w-10 text-slate-300" />
          <p className="font-semibold text-slate-500">No stories found.</p>
          <p className="text-xs text-slate-400">
            Try a different term or pick a category above.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile: horizontal scroll */}
          <div
            className="flex gap-4 overflow-x-auto scroll-smooth pb-2 sm:hidden"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {results.map((article) => (
              <div
                key={article.id}
                className="w-[75vw] min-w-[75vw] flex-none snap-start"
              >
                <NewsCard article={article} variant="grid" />
              </div>
            ))}
          </div>

          {/* Desktop: grid */}
          <div className="hidden gap-4 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {results.map((article) => (
              <NewsCard key={article.id} article={article} variant="grid" />
            ))}
          </div>

          <Pagination
            page={page}
            hasMore={hasMore}
            onPrev={() => setPage((p) => p - 1)}
            onNext={() => setPage((p) => p + 1)}
          />
        </>
      )}
    </section>
  );
}