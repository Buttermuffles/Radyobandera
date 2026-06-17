import { useEffect, useState } from "react";
import { getWeather } from "../../lib/api";
import type { WeatherData } from "../../types/news";
import { Skeleton } from "../ui/skeleton";
import { Droplets, Thermometer } from "lucide-react";

export function WeatherWidget() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchWeather = async () => {
      try {
        const result = await getWeather();
        if (!cancelled) setData(result);
      } catch {
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchWeather();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-white/60 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:rounded-[1.5rem]">
        <div className="border-b border-slate-100 px-4 py-3 sm:px-5">
          <Skeleton className="h-5 w-28" />
        </div>
        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1.5 text-center">
                <Skeleton className="mx-auto h-3 w-10" />
                <Skeleton className="mx-auto h-8 w-8 rounded-full" />
                <Skeleton className="mx-auto h-3 w-12" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { current, forecast } = data;

  return (
    <section className="overflow-hidden rounded-xl border border-white/60 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:rounded-[1.5rem]">
      <div className="border-b border-slate-100 bg-gradient-to-r from-sky-500/10 to-transparent px-4 py-3 sm:px-5">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-black text-slate-800 sm:text-lg">
            Weather
          </h2>
          <span className="text-xs font-semibold text-sky-600">{current.city}</span>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <img
            src={current.icon}
            alt={current.description}
            className="h-14 w-14 sm:h-16 sm:w-16"
          />
          <div>
            <p className="font-heading text-3xl font-black text-slate-800 sm:text-4xl">
              {current.temp}°C
            </p>
            <p className="text-xs capitalize text-slate-500 sm:text-sm">
              {current.description}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-4 text-xs text-slate-500 sm:text-sm">
          <span className="flex items-center gap-1">
            <Thermometer className="h-3.5 w-3.5 text-sky-500" />
            Feels like {current.feelsLike}°C
          </span>
          <span className="flex items-center gap-1">
            <Droplets className="h-3.5 w-3.5 text-blue-500" />
            {current.humidity}% humidity
          </span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
          {forecast.map((day: WeatherData["forecast"][number]) => (
            <div key={day.day} className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:text-xs">
                {day.day}
              </p>
              <img
                src={day.icon}
                alt={day.description}
                className="mx-auto h-8 w-8 sm:h-10 sm:w-10"
              />
              <p className="text-xs font-bold text-slate-700 sm:text-sm">
                {day.high}° / {day.low}°
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
