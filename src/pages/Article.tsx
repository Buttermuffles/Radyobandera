import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getArticleBySlug } from "../lib/api";
import type { Article as ArticleType } from "../types/news";
import { CategoryBadge } from "../components/common/CategoryBadge";
import { DateStamp } from "../components/common/DateStamp";

export function Article() {
  const { slug = "" } = useParams();
  const [article, setArticle] = useState<ArticleType | null>(null);

  useEffect(() => {
    getArticleBySlug(slug).then((data) => setArticle(data ?? null));
  }, [slug]);

  if (!article) {
    return <p className="rounded-lg bg-white p-6 text-center text-slate-600">Article not found.</p>;
  }

  return (
    <article className="mx-auto max-w-4xl space-y-4 rounded-xl bg-white p-6 shadow-sm">
      <CategoryBadge category={article.category} />
      <h1 className="font-heading text-4xl font-black leading-tight text-brand-dark">{article.title}</h1>
      <div className="flex items-center justify-between text-sm">
        <DateStamp date={article.publishedAt} />
        <p className="text-brand-muted">By {article.author.name}</p>
      </div>
      <img src={article.thumbnail} alt={article.title} className="h-[380px] w-full rounded-xl object-cover" />
      <div
        className="space-y-3 font-body text-lg leading-8 text-brand-dark"
        dangerouslySetInnerHTML={{ __html: article.body }}
      />
      <Link to="/" className="inline-block text-sm font-semibold text-brand-red hover:underline">
        Back to homepage
      </Link>
    </article>
  );
}
