import { useEffect, useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { NewsCard } from "./NewsCard";
import type { Article } from "../../types/news";

interface HeroCarouselProps {
  articles: Article[];
}

export function HeroCarousel({ articles }: HeroCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);

  const reducedMotion = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi || paused || reducedMotion || articles.length < 2) {
      return;
    }

    const timer = window.setInterval(() => emblaApi.scrollNext(), 6000);
    return () => window.clearInterval(timer);
  }, [articles.length, emblaApi, paused, reducedMotion]);

  if (!articles.length) {
    return null;
  }

  return (
    <section
      aria-label="Top stories carousel"
      className="space-y-2 rounded-xl border border-white/70 bg-white/70 p-2 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur sm:space-y-3 sm:rounded-[2rem] sm:p-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
        <div className="flex">
          {articles.map((article) => (
            <div className="min-w-0 flex-[0_0_100%]" key={article.id}>
              <NewsCard article={article} variant="hero" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-x-2" aria-label="Carousel controls">
          <button
            type="button"
            className="rounded-full border border-slate-300 bg-white p-2.5 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 sm:p-2"
            onClick={() => emblaApi?.scrollPrev()}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="rounded-full border border-slate-300 bg-white p-2.5 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 sm:p-2"
            onClick={() => emblaApi?.scrollNext()}
            aria-label="Next slide"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <p className="font-ui text-xs text-brand-muted">
          {selected + 1} / {articles.length}
        </p>
      </div>
    </section>
  );
}
