import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getArticles } from "../lib/api";
import type { Article, Category as CategoryType } from "../types/news";
import { NewsCard } from "../components/news/NewsCard";

const validCategories: CategoryType[] = [
  "NATION",
  "ENTERTAINMENT",
  "WORLD",
  "SPORTS",
  "LIFESTYLE",
  "ASIA",
];

export function Category() {
  const { category = "" } = useParams();
  const normalized = category.toUpperCase() as CategoryType;
  const [items, setItems] = useState<Article[]>([]);

  const isValid = useMemo(() => validCategories.includes(normalized), [normalized]);

  useEffect(() => {
    if (!isValid) {
      return;
    }

    getArticles({ category: normalized, limit: 12 }).then(setItems);
  }, [isValid, normalized]);

  if (!isValid) {
    return <p className="rounded-lg bg-white p-6">Unknown category.</p>;
  }

  return (
    <section className="space-y-4">
      <h1 className="font-heading text-2xl font-black text-brand-blue sm:text-3xl">{normalized}</h1>
      <div className="grid grid-cols-2 gap-2 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((article) => (
          <NewsCard key={article.id} article={article} variant="grid" />
        ))}
      </div>
    </section>
  );
}
