import { useEffect, useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, Search } from "lucide-react";
import type { Category } from "../../types/news";
import { cn } from "../../lib/utils";

const categories: Category[] = [
  "NATION",
  "ENTERTAINMENT",
  "WORLD",
  "SPORTS",
  "LIFESTYLE",
  "ASIA",
];

interface HeaderProps {
  onSearch: (query: string) => void;
}

export function Header({ onSearch }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [weather, setWeather] = useState("Surallah · --°C");

  useEffect(() => {
    const controller = new AbortController();

    fetch("https://api.open-meteo.com/v1/forecast?latitude=6.39&longitude=124.73&current=temperature_2m&timezone=Asia%2FManila", {
      signal: controller.signal,
    })
      .then((res) => res.json() as Promise<{ current?: { temperature_2m?: number } }>)
      .then((data) => {
        const temp = Math.round(data.current?.temperature_2m ?? 31);
        setWeather(`Surallah · ${temp}°C`);
      })
      .catch(() => {
        setWeather("Surallah · 31°C");
      });

    return () => controller.abort();
  }, []);

  const today = useMemo(
    () =>
      new Intl.DateTimeFormat("en-PH", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }).format(new Date()),
    [],
  );

  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-white/80 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl gap-3 px-4 py-3 lg:grid-cols-[auto_1fr_auto] lg:items-center">
        <Link to="/" className="group flex items-center gap-3 justify-self-start lg:min-w-[240px]">
          <img
            src="/LOGO.jpg"
            alt="Radyo Bandera Surallah 98.1 FM logo"
            className="h-12 w-12 rounded-2xl object-cover shadow-[0_16px_30px_rgba(8,24,79,0.22)] transition-transform group-hover:scale-105 sm:h-14 sm:w-14"
          />
          <span className="leading-tight">
            <span className="block font-heading text-[0.94rem] font-black tracking-[0.18em] text-brand-blue sm:text-[1.02rem]">
              RADYO BANDERA
            </span>
            <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-brand-red sm:text-[0.72rem] sm:tracking-[0.3em]">
              Surallah 98.1 FM
            </span>
          </span>
        </Link>

        <button
          type="button"
          className="justify-self-end rounded-md border border-slate-300 p-2 lg:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <nav
          className={cn(
            "col-span-full grid gap-2 text-sm font-semibold lg:col-span-1 lg:flex lg:items-center lg:justify-center",
            mobileOpen ? "grid" : "hidden lg:flex",
          )}
        >
          {categories.map((category) => (
            <NavLink
              key={category}
              to={`/category/${category}`}
              className={({ isActive }) =>
                cn(
                  "rounded px-2 py-1 text-brand-dark hover:bg-brand-gray hover:text-brand-red",
                  isActive && "bg-brand-gray text-brand-red",
                )
              }
            >
              {category}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center justify-end gap-3 xl:flex">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-red/10 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-brand-red shadow-[0_0_0_6px_rgba(204,0,0,0.12)]" />
            {today} · {weather}
          </p>
          <form
            className="flex items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              onSearch(query.trim());
            }}
          >
            <label htmlFor="header-search" className="sr-only">
              Search news
            </label>
            <input
              id="header-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-44 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-brand-red focus:ring-2 focus:ring-brand-red/15"
              placeholder="Search"
            />
            <button
              type="submit"
              aria-label="Search"
              className="rounded-full bg-brand-blue p-2 text-white shadow-md shadow-brand-blue/20 transition hover:translate-y-[-1px] hover:bg-brand-red"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
