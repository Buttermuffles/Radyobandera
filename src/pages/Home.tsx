import { useEffect, useState } from "react";
import { getArticles, getMostRead } from "../lib/api";
import type { Article } from "../types/news";
import { HeroCarousel } from "../components/news/HeroCarousel";
import { SectionBlock } from "../components/news/SectionBlock";
import { MostRead } from "../components/news/MostRead";
import { LivePlayer } from "../components/media/LivePlayer";
import { Skeleton } from "../components/ui/skeleton";

interface HomeProps {
  videoUrl: string;
  isLive: boolean;
}

export function Home({ videoUrl, isLive }: HomeProps) {
  const [featured, setFeatured] = useState<Article[]>([]);
  const [nation, setNation] = useState<Article[]>([]);
  const [entertainment, setEntertainment] = useState<Article[]>([]);
  const [mostRead, setMostRead] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getArticles({ limit: 5 }),
      getArticles({ category: "NATION", limit: 4 }),
      getArticles({ category: "ENTERTAINMENT", limit: 4 }),
      getMostRead(24, 4),
    ]).then(([top, nationNews, entertainmentNews, trending]) => {
      setFeatured(top);
      setNation(nationNews);
      setEntertainment(entertainmentNews);
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
      <section className="overflow-hidden rounded-2xl border border-white/70 bg-white/80 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur sm:rounded-[2rem] sm:p-5">
        <div className="grid gap-5 lg:grid-cols-[1.8fr_1fr] lg:items-center">
          <div className="space-y-2 sm:space-y-3">
            <p className="inline-flex rounded-full bg-brand-red px-2 py-0.5 text-[0.6rem] font-black uppercase tracking-[0.3em] text-white sm:px-3 sm:py-1 sm:text-[0.7rem]">
              Breaking broadcast
            </p>
            <h1 className="max-w-3xl font-heading text-xl font-black leading-tight text-brand-dark sm:text-4xl md:text-5xl">
              Radyo Bandera Surallah 98.1 FM delivers fast, local-first news with a stronger broadcast identity.
            </h1>
            <p className="max-w-2xl text-xs leading-6 text-slate-600 sm:text-base md:text-lg">
              Live updates, verified reports, and a cleaner reading experience built for radio audiences on any device.
            </p>
          </div>
          <div className="grid gap-2 rounded-xl bg-slate-950 p-3 text-white shadow-[0_16px_35px_rgba(15,23,42,0.18)] sm:gap-3 sm:rounded-[1.5rem] sm:p-5">
            <p className="text-[10px] uppercase tracking-[0.28em] text-brand-yellow sm:text-xs">Station status</p>
            <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 sm:rounded-2xl sm:px-4 sm:py-3">
              <div>
                <p className="text-xs font-semibold text-slate-300 sm:text-sm">Live stream</p>
                <p className="text-lg font-black text-white sm:text-2xl">{isLive ? "ON AIR" : "OFF AIR"}</p>
              </div>
              <div className={`h-2.5 w-2.5 rounded-full sm:h-3 sm:w-3 ${isLive ? "bg-emerald-400" : "bg-slate-500"}`} />
            </div>
            <p className="text-xs leading-5 text-slate-300 sm:text-sm sm:leading-6">
              Audio stream and headline ticker are pinned to the bottom rail for easy listening.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="space-y-6">
          <HeroCarousel articles={featured} />
          <SectionBlock title="NATION" articles={nation} columns={2} showMore />
          <SectionBlock title="ENTERTAINMENT" articles={entertainment} columns={2} showMore />
        </div>

        <aside className="space-y-4">
          <section className="rounded-xl border border-white/60 bg-white p-3 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:rounded-[1.5rem] sm:p-4">
            <div className="mb-2 flex items-center justify-between sm:mb-3">
              <h2 className="font-heading text-lg font-black text-brand-red sm:text-xl">WATCH LIVE</h2>
              <p className="rounded-full bg-brand-red/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-red sm:px-3 sm:py-1 sm:text-xs">
                {isLive ? "Live now" : "Paused"}
              </p>
            </div>
            <LivePlayer videoUrl={videoUrl} isLive={isLive} />
          </section>
          <MostRead articles={mostRead} />
        </aside>
      </div>
    </div>
  );
}
