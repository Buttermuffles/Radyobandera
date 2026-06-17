import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReduced ? "auto" : "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      className={[
        "fixed bottom-20 right-4 z-[60] flex items-center gap-2 rounded-full bg-brand-blue px-4 py-3 text-white shadow-[0_4px_16px_rgba(0,48,135,0.35)] transition-all hover:bg-brand-red hover:shadow-[0_4px_16px_rgba(204,0,0,0.4)] focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 sm:bottom-6 sm:right-6",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0",
      ].join(" ")}
    >
      <ArrowUp className="h-5 w-5" />
      <span className="hidden text-sm font-semibold sm:inline">Top</span>
    </button>
  );
}
