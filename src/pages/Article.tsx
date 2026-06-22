import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Skeleton } from "boneyard-js/react";
import DOMPurify from "dompurify";
import { getArticleBySlug } from "../lib/api";
import type { Article as ArticleType } from "../types/news";
import { CategoryBadge } from "../components/common/CategoryBadge";
import { DateStamp } from "../components/common/DateStamp";
import { ImageLightbox } from "../components/common/ImageLightbox";
import { ArticleSkeleton } from "../components/skeletons/ArticleSkeleton";
import { SEO } from "../components/common/SEO";

const SITE_URL = "https://radyo-bandera-surallah-981-fm.vercel.app";

export function Article() {
  const { slug = "" } = useParams();
  const [article, setArticle] = useState<ArticleType | undefined | null>(undefined);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    setArticle(undefined);
    getArticleBySlug(slug).then((data) => setArticle(data ?? null));
  }, [slug]);

  const sanitizedBody = useMemo(
    () => (article ? DOMPurify.sanitize(article.body) : ""),
    [article],
  );

  // ponytail: must keep hook count stable across renders — memo before any early return
  const galleryImages = useMemo(
    () => (article?.images || []).filter((img) => img !== article?.thumbnail),
    [article?.images, article?.thumbnail],
  );

  const bodyContent = useMemo(() => {
    if (!sanitizedBody) return [];
    const paragraphRegex = /<p>[\s\S]*?<\/p>/g;
    const matches = sanitizedBody.match(paragraphRegex);
    if (!matches || matches.length === 0) {
      return [{ type: "html" as const, html: sanitizedBody }];
    }
    const items: Array<
      | { type: "para"; html: string }
      | { type: "img"; src: string }
    > = [];
    let imgIdx = 0;
    matches.forEach((para, i) => {
      items.push({ type: "para", html: para });
      if ((i + 1) % 2 === 0 && imgIdx < galleryImages.length) {
        items.push({ type: "img", src: galleryImages[imgIdx] });
        imgIdx++;
      }
    });
    return items;
  }, [sanitizedBody, galleryImages]);

  if (article === null) {
    return <p className="rounded-lg bg-white p-6 text-center text-slate-600">Article not found.</p>;
  }

  if (!article) {
    return (
      <Skeleton name="article" loading={true} fallback={<ArticleSkeleton />}>
        <SEO />
      </Skeleton>
    );
  }

  const a = article;
  const articleUrl = `${SITE_URL}/article/${a.slug}`;
  const fbShareUrl = a.facebookUrl || `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;

  return (
    <Skeleton name="article" loading={false} fallback={<ArticleSkeleton />}>
      <SEO
        title={a.title}
        description={a.excerpt}
        image={a.thumbnail || undefined}
        url={articleUrl}
        type="article"
        publishedTime={a.publishedAt}
        authorName={a.author.name}
        tags={a.tags}
      />
      <article className="mx-auto max-w-4xl space-y-6 rounded-2xl bg-white p-4 sm:p-8 shadow-[0_10px_30px_rgba(15,23,42,0.05)] border border-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CategoryBadge category={a.category} />
        {a.facebookUrl && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
            <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Facebook Source
          </span>
        )}
      </div>

      <h1 className="font-heading text-2xl font-black leading-tight text-brand-dark sm:text-4xl">
        {a.title}
      </h1>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 text-sm">
        <div className="flex items-center gap-2 text-slate-500">
          <DateStamp date={a.publishedAt} />
        </div>
        <p className="font-medium text-slate-600">By {a.author.name}</p>
      </div>

      {a.thumbnail && (
        <div
          className="cursor-pointer overflow-hidden rounded-xl bg-slate-50"
          onClick={() => setSelectedImage(a.thumbnail)}
        >
          <img
            src={a.thumbnail}
            alt={a.title}
            className="max-h-[460px] w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
            loading="eager"
            decoding="async"
            referrerPolicy="no-referrer"
            width="800"
            height="460"
          />
        </div>
      )}

      <div className="space-y-4 font-body text-base sm:text-lg leading-relaxed sm:leading-8 text-slate-800">
        {bodyContent.map((item, i) =>
          item.type === "img" ? (
            <div
              key={i}
              className="cursor-pointer overflow-hidden rounded-xl bg-slate-50"
              onClick={() => setSelectedImage(item.src)}
            >
              <img
                src={item.src}
                alt={`${a.title} — image ${i + 1}`}
                className="aspect-[16/10] w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                width="800"
                height="500"
              />
            </div>
          ) : (
            <div key={i} dangerouslySetInnerHTML={{ __html: item.html }} />
          )
        )}
      </div>

      <div className="space-y-6 border-t border-slate-100 pt-6">
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={fbShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-full bg-[#1877F2] hover:bg-[#166FE5] text-white px-5 py-2.5 text-sm font-bold shadow-md shadow-blue-500/10 hover:shadow-lg transition-all"
          >
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            {a.facebookUrl ? "View Original Post" : "Share on Facebook"}
          </a>
        </div>

        {a.tags && a.tags.length > 0 && (
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Related Topics</h3>
            <div className="flex flex-wrap gap-2">
              {a.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/search?q=${encodeURIComponent(tag)}`}
                  className="rounded-lg bg-slate-100 hover:bg-brand-red/10 text-slate-600 hover:text-brand-red px-3 py-1.5 text-xs font-semibold transition"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="pt-4">
        <Link to="/" className="inline-block text-sm font-bold text-brand-red hover:underline">
          &larr; Back to homepage
        </Link>
      </div>
    </article>

      {selectedImage && (
        <ImageLightbox src={selectedImage} alt={a.title} onClose={() => setSelectedImage(null)} />
      )}
    </Skeleton>
  );
}
