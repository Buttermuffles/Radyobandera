import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getArticles } from "../lib/api";
import type { Article, Category as CategoryType } from "../types/news";
import { DateStamp } from "../components/common/DateStamp";
import { readingMinutes } from "../lib/utils";
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

export function Category() {
  const { category = "" } = useParams();
  const normalized = category.toUpperCase() as CategoryType;
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const isValid = useMemo(() => validCategories.includes(normalized), [normalized]);

  useEffect(() => {
    if (!isValid) return;
    setLoading(true);
    getArticles({ category: normalized, limit: 24 }).then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, [isValid, normalized]);

  if (!isValid) {
    return <p className="rounded-lg bg-white p-6">Unknown category.</p>;
  }

  const meta = categoryMeta[normalized] ?? categoryMeta.OTHER;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-40 animate-pulse rounded-2xl bg-slate-200" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 animate-pulse rounded-xl bg-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-8">
      {/* Header Banner */}
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

      {/* Grid gallery */}
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
          <BookOpen className="mx-auto mb-3 h-8 w-8 text-slate-400" />
          <p className="font-semibold">No articles available in this category yet.</p>
          <p className="mt-1 text-xs text-slate-400">Check back later for updates.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((article) => (
            <Card
              key={article.id}
              className="group flex h-full flex-col overflow-hidden rounded-xl border-slate-100 bg-white shadow-sm transition-all duration-300 hover:shadow-md"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-50">
                <img
                  src={article.thumbnail || "/LOGO.jpg"}
                  alt={article.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
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
    </section>
  );
}
