import { useEffect, useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, Search, X } from "lucide-react";
import type { Category } from "../../types/news";
import { cn } from "../../lib/utils";

const categories: Category[] = [
  "NATION",
  "ENTERTAINMENT",
  "WORLD",
  "SPORTS",
  "LIFESTYLE",
  "BUSINESS",
  "METRO",
  "SCIENCE",
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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/60 bg-white/80 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/40 sm:hidden" 
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr] items-center gap-2 px-3 py-2 xs:gap-3 xs:px-4 xs:py-3 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-3">
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-2 justify-self-start xs:gap-3 lg:min-w-[240px]">
          <img
            src="/LOGO.jpg"
            alt="Radyo Bandera Surallah 98.1 FM logo"
            className="h-10 w-10 rounded-lg object-cover shadow-[0_16px_30px_rgba(8,24,79,0.22)] transition-transform group-hover:scale-105 xs:h-12 xs:w-12 xs:rounded-2xl sm:h-14 sm:w-14"
          />
          <span className="leading-tight block">
            <span className="block font-heading text-[0.85rem] font-black tracking-[0.15em] text-brand-blue xs:text-[0.94rem] xs:tracking-[0.18em] sm:text-[1.02rem]">
              RADYO BANDERA
            </span>
            <span className="block text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-brand-red xs:text-[0.68rem] xs:tracking-[0.24em] sm:text-[0.72rem] sm:tracking-[0.3em]">
              Surallah 98.1 FM
            </span>
          </span>
        </Link>

        {/* Mobile menu button */}
        <button
          type="button"
          className="justify-self-end rounded-md border border-slate-300 p-1.5 xs:p-2 lg:hidden min-w-touch min-h-touch flex items-center justify-center"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Navigation - Desktop */}
        <nav className="hidden gap-1 text-xs font-semibold sm:text-sm lg:col-span-1 lg:flex lg:items-center lg:justify-center">
          {categories.map((category) => (
            <NavLink
              key={category}
              to={`/category/${category}`}
              className={({ isActive }) =>
                cn(
                  "rounded px-2 py-1 text-brand-dark hover:bg-brand-gray hover:text-brand-red transition min-w-touch min-h-touch",
                  isActive && "bg-brand-gray text-brand-red",
                )
              }
            >
              {category}
            </NavLink>
          ))}
        </nav>

        {/* Desktop search */}
        <form
          className="hidden items-center gap-2 lg:flex"
          onSubmit={(event) => {
            event.preventDefault();
            onSearch(query.trim());
            setQuery("");
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
            className="rounded-full bg-brand-blue p-2 text-white shadow-md shadow-brand-blue/20 transition hover:translate-y-[-1px] hover:bg-brand-red min-w-touch min-h-touch flex items-center justify-center"
          >
            <Search className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Mobile menu modal */}
      {mobileOpen && (
        <nav className="fixed top-[60px] left-0 right-0 z-40 bg-white shadow-lg sm:hidden max-h-[calc(100vh-60px)] overflow-y-auto">
          <div className="divide-y divide-slate-200">
            {/* Mobile search */}
            <form
              className="sticky top-0 bg-white flex items-center gap-2 p-3 xs:p-4"
              onSubmit={(event) => {
                event.preventDefault();
                onSearch(query.trim());
                setQuery("");
                setMobileOpen(false);
              }}
            >
              <label htmlFor="mobile-search" className="sr-only">
                Search news
              </label>
              <input
                id="mobile-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="flex-1 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-brand-red focus:ring-2 focus:ring-brand-red/15"
                placeholder="Search"
              />
              <button
                type="submit"
                aria-label="Search"
                className="rounded-full bg-brand-blue p-2 text-white shadow-md shadow-brand-blue/20 transition hover:bg-brand-red min-w-touch min-h-touch flex items-center justify-center flex-shrink-0"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>

            {/* Mobile categories */}
            <div className="space-y-0.5 px-3 xs:px-4 py-2 xs:py-3">
              {categories.map((category) => (
                <NavLink
                  key={category}
                  to={`/category/${category}`}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "block rounded px-3 py-2.5 text-sm font-semibold text-brand-dark hover:bg-brand-gray hover:text-brand-red transition min-h-touch",
                      isActive && "bg-brand-gray text-brand-red",
                    )
                  }
                >
                  {category}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* Weather/Date badge */}
      <div className="hidden absolute right-4 top-1/2 -translate-y-1/2 lg:flex items-center gap-2 text-xs font-semibold text-slate-600">
        <span>{today}</span>
        <span>·</span>
        <span>{weather}</span>
      </div>
    </header>
  );
}
