import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getArticles, getArticlesSync } from "../lib/api";
import type { Article } from "../types/news";
import { HeroCarousel } from "../components/news/HeroCarousel";
import { SectionBlock } from "../components/news/SectionBlock";
import { LivePlayer } from "../components/media/LivePlayer";
import { WeatherWidget } from "../components/common/WeatherWidget";
import { HomeSkeleton } from "../components/skeletons/HomeSkeleton";
import { NewsCard } from "../components/news/NewsCard";
import { SEO } from "../components/common/SEO";
import { Globe, BookOpen } from "lucide-react";

interface HomeProps {
  videoUrl: string;
  isLive: boolean;
  embedHtml?: string;
  permalinkUrl?: string;
}

export function Home({ videoUrl, isLive, embedHtml, permalinkUrl }: HomeProps) {
  // ponytail: seed from cache synchronously — return visitors see content on first render
  const [featured, setFeatured] = useState<Article[]>(() => getArticlesSync()?.slice(0, 5) || []);
  const [local, setLocal] = useState<Article[]>(() => {
    const all = getArticlesSync();
    return all ? all.filter((a) => a.category === "LOCAL").slice(0, 4) : [];
  });
  const [regional, setRegional] = useState<Article[]>(() => {
    const all = getArticlesSync();
    return all ? all.filter((a) => a.category === "REGIONAL").slice(0, 4) : [];
  });
  const [national, setNational] = useState<Article[]>(() => {
    const all = getArticlesSync();
    return all ? all.filter((a) => a.category === "NATIONAL").slice(0, 4) : [];
  });
  const [general, setGeneral] = useState<Article[]>(() => getArticlesSync()?.slice(0, 8) || []);
  const [loading, setLoading] = useState(() => !getArticlesSync());

  useEffect(() => {
    getArticles({ limit: 60 }).then(({ articles }) => {
      setFeatured(articles.slice(0, 5));
      setLocal(articles.filter((a) => a.category === "LOCAL").slice(0, 4));
      setRegional(articles.filter((a) => a.category === "REGIONAL").slice(0, 4));
      setNational(articles.filter((a) => a.category === "NATIONAL").slice(0, 4));
      setGeneral(articles.slice(0, 8));
      setLoading(false);
    });
  }, []);

  if (loading) return <HomeSkeleton />;

  return (
    <>
      <SEO />
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="space-y-6">
          <HeroCarousel articles={featured} />
        </div>

        <aside className="hidden space-y-4 lg:block">
          <section id="watch-live" className="rounded-xl border border-white/60 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:rounded-[1.5rem] overflow-hidden">
            <div className="flex items-center justify-between px-3 pt-3 sm:px-4 sm:pt-4">
              <h2 className="font-heading text-lg font-black text-brand-red sm:text-xl">WATCH LIVE</h2>
              <p className="rounded-full bg-brand-red/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-red sm:px-3 sm:py-1 sm:text-xs">
                {isLive ? "Live now" : "Off Air"}
              </p>
            </div>
            <LivePlayer videoUrl={videoUrl} isLive={isLive} embedHtml={embedHtml} permalinkUrl={permalinkUrl} />
          </section>
          <WeatherWidget />
        </aside>
      </div>

      <SectionBlock title="LOCAL" articles={local} showMore />
      <SectionBlock title="REGIONAL" articles={regional} showMore />
      <SectionBlock title="NATIONAL" articles={national} showMore />

      <section className="relative w-screen left-1/2 -translate-x-1/2 bg-gradient-to-b from-slate-50/80 to-white py-6 sm:py-8">
        <div className="mx-auto max-w-7xl space-y-6 px-4">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-lg sm:p-8">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-red px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white">
                  <Globe className="h-3 w-3" />
                  General Feed
                </span>
                <h2 className="font-heading text-2xl font-black tracking-tight sm:text-3xl">GENERAL NEWS</h2>
                <p className="text-sm text-slate-300">All the latest posts from Radyo Bandera Surallah.</p>
              </div>
              <Link
                to="/general"
                className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-white/20"
              >
                View All →
              </Link>
            </div>
          </div>

          {general.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
              <BookOpen className="mx-auto mb-3 h-8 w-8 text-slate-400" />
              <p className="font-semibold">No general posts available yet.</p>
            </div>
          ) : (
            <>
              <div className="flex gap-4 overflow-x-auto scroll-smooth pb-2 sm:hidden" style={{ scrollSnapType: "x mandatory" }}>
                {general.map((article) => (
                  <div key={article.id} className="w-[75vw] min-w-[75vw] flex-none snap-start" style={{ scrollSnapAlign: "start" }}>
                    <NewsCard article={article} variant="grid" />
                  </div>
                ))}
              </div>
              <div className="hidden gap-4 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
                {general.map((article) => (
                  <NewsCard key={article.id} article={article} variant="grid" />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

    </div>
    </>
  );
}
