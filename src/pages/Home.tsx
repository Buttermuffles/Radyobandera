import { useEffect, useState } from "react";
import { getArticles, getMostRead } from "../lib/api";
import type { Article } from "../types/news";
import { HeroCarousel } from "../components/news/HeroCarousel";
import { SectionBlock } from "../components/news/SectionBlock";
import { MostRead } from "../components/news/MostRead";
import { MostReadCard } from "../components/news/MostReadCard";
import { LivePlayer } from "../components/media/LivePlayer";
import { WeatherWidget } from "../components/common/WeatherWidget";
import { Skeleton } from "../components/ui/skeleton";

interface HomeProps {
  videoUrl: string;
  isLive: boolean;
}

export function Home({ videoUrl, isLive }: HomeProps) {
  const [featured, setFeatured] = useState<Article[]>([]);
  const [nation, setNation] = useState<Article[]>([]);
  const [entertainment, setEntertainment] = useState<Article[]>([]);
  const [business, setBusiness] = useState<Article[]>([]);
  const [metro, setMetro] = useState<Article[]>([]);
  const [science, setScience] = useState<Article[]>([]);
  const [mostRead, setMostRead] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getArticles({ limit: 5 }),
      getArticles({ category: "NATION", limit: 4 }),
      getArticles({ category: "ENTERTAINMENT", limit: 4 }),
      getArticles({ category: "BUSINESS", limit: 4 }),
      getArticles({ category: "METRO", limit: 4 }),
      getArticles({ category: "SCIENCE", limit: 4 }),
      getMostRead(24, 4),
    ]).then(([top, nationNews, entertainmentNews, businessNews, metroNews, scienceNews, trending]) => {
      setFeatured(top);
      setNation(nationNews);
      setEntertainment(entertainmentNews);
      setBusiness(businessNews);
      setMetro(metroNews);
      setScience(scienceNews);
      setMostRead(trending);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <Skeleton className="h-[300px] rounded-2xl sm:h-[420px] sm:rounded-[2rem]" />
        <Skeleton className="h-[300px] rounded-2xl sm:h-[420px] sm:rounded-[2rem]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-brand-dark/10 bg-[linear-gradient(135deg,_#0a1a4a_0%,_#07163e_50%,_#0d1f56_100%)] p-5 shadow-[0_18px_50px_rgba(8,24,79,0.25)] sm:rounded-[2rem] sm:p-7 md:p-10">
        <div className="flex flex-col items-start gap-3 sm:gap-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[0.55rem] font-semibold uppercase tracking-wider text-white/70 sm:text-[0.6rem]">
            Surallah 98.1 FM
          </span>
          <h1 className="max-w-3xl font-heading text-2xl font-black leading-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
            Radyo Bandera Surallah
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-blue-200/80 sm:text-base md:text-lg">
            Delivering fast, local-first news with a stronger broadcast identity.
            Live updates, verified reports, and a cleaner reading experience
            built for radio audiences on any device.
          </p>
        </div>
      </section>

      {/* Main content grid: single column on mobile/tablet, two-column on lg+ */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        {/* Primary content (all screen sizes) */}
        <div className="space-y-6">
          <HeroCarousel articles={featured} />
          <SectionBlock title="NATION" articles={nation} showMore />
          <SectionBlock title="METRO" articles={metro} showMore />
          <SectionBlock title="BUSINESS" articles={business} showMore />
          <SectionBlock title="ENTERTAINMENT" articles={entertainment} showMore />
          <SectionBlock title="SCIENCE & TECH" articles={science} showMore />
        </div>

        {/* Desktop sidebar (lg+ only) */}
        <aside className="hidden space-y-4 lg:block">
          <section className="rounded-xl border border-white/60 bg-white p-3 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:rounded-[1.5rem] sm:p-4">
            <div className="mb-2 flex items-center justify-between sm:mb-3">
              <h2 className="font-heading text-lg font-black text-brand-red sm:text-xl">WATCH LIVE</h2>
              <p className="rounded-full bg-brand-red/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-red sm:px-3 sm:py-1 sm:text-xs">
                {isLive ? "Live now" : "Paused"}
              </p>
            </div>
            <LivePlayer videoUrl={videoUrl} isLive={isLive} />
          </section>
          <WeatherWidget />
          <MostRead articles={mostRead} />
        </aside>
      </div>

      {/* Mobile most-read card (<lg only) */}
      <div className="lg:hidden">
        <MostReadCard articles={mostRead} />
      </div>
    </div>
  );
}
