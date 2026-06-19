import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Skeleton } from "boneyard-js/react";
import { getArticles, getTrendingTopics } from "../lib/api";
import type { Article, TrendingTopic } from "../types/news";
import { HeroCarousel } from "../components/news/HeroCarousel";
import { SectionBlock } from "../components/news/SectionBlock";
import { TrendingTopics } from "../components/news/TrendingTopics";
import { TrendingTopicsCard } from "../components/news/TrendingTopicsCard";
import { LivePlayer } from "../components/media/LivePlayer";
import { WeatherWidget } from "../components/common/WeatherWidget";
import { HomeSkeleton } from "../components/skeletons/HomeSkeleton";
import { Card } from "../components/ui/card";
import { DateStamp } from "../components/common/DateStamp";
import { readingMinutes } from "../lib/utils";
import { SEO } from "../components/common/SEO";
import { Globe, BookOpen } from "lucide-react";

interface HomeProps {
  videoUrl: string;
  isLive: boolean;
  audioUrl?: string;
}

export function Home({ videoUrl, isLive, audioUrl }: HomeProps) {
  const [featured, setFeatured] = useState<Article[]>([]);
  const [local, setLocal] = useState<Article[]>([]);
  const [regional, setRegional] = useState<Article[]>([]);
  const [national, setNational] = useState<Article[]>([]);
  const [general, setGeneral] = useState<Article[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getArticles({ limit: 60 }).then((all) => {
      const top = all.slice(0, 5);
      const localNews = all.filter((a) => a.category === "LOCAL").slice(0, 4);
      const regionalNews = all.filter((a) => a.category === "REGIONAL").slice(0, 4);
      const nationalNews = all.filter((a) => a.category === "NATIONAL").slice(0, 4);
      const generalNews = all.slice(0, 8);

      setFeatured(top);
      setLocal(localNews);
      setRegional(regionalNews);
      setNational(nationalNews);
      setGeneral(generalNews);

      getTrendingTopics(6, all).then(setTrendingTopics);
      setLoading(false);
    });
  }, []);

  const trendingTopicsMemo = useMemo(() => trendingTopics, [trendingTopics]);

  return (
    <Skeleton name="home" loading={loading} fallback={<HomeSkeleton />}>
      <SEO />
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="space-y-6">
          <HeroCarousel articles={featured} />
          <SectionBlock title="LOCAL" articles={local} showMore />
          <SectionBlock title="REGIONAL" articles={regional} showMore />
          <SectionBlock title="NATIONAL" articles={national} showMore />
        </div>

        <aside className="hidden space-y-4 lg:block">
          <section className="rounded-xl border border-white/60 bg-white p-3 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:rounded-[1.5rem] sm:p-4">
            <div className="mb-2 flex items-center justify-between sm:mb-3">
              <h2 className="font-heading text-lg font-black text-brand-red sm:text-xl">WATCH LIVE</h2>
              <p className="rounded-full bg-brand-red/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-red sm:px-3 sm:py-1 sm:text-xs">
                {isLive ? "Live now" : "Off Air"}
              </p>
            </div>
            <LivePlayer videoUrl={videoUrl} isLive={isLive} audioUrl={audioUrl} />
          </section>
          <WeatherWidget />
          <TrendingTopics topics={trendingTopicsMemo} />
        </aside>
      </div>

      <section className="space-y-6">
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
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {general.map((article) => (
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
                    decoding="async"
                    width="400"
                    height="250"
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
                      Read More →
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <div className="lg:hidden">
        <TrendingTopicsCard topics={trendingTopicsMemo} />
      </div>
    </div>
    </Skeleton>
  );
}
