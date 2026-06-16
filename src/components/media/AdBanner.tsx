export function AdBanner() {
  return (
    <aside className="relative overflow-hidden border-b border-brand-blue/20 bg-[linear-gradient(90deg,_#08184f_0%,_#0f2e85_45%,_#cc0000_100%)] px-5 py-3 text-left text-white shadow-[0_18px_40px_rgba(0,48,135,0.18)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-white/70">On air now</p>
          <p className="font-heading text-lg font-semibold">Radyo Bandera Surallah 98.1 FM · Trusted local broadcast</p>
        </div>
        <p className="hidden rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 sm:block">
          Surallah, South Cotabato
        </p>
      </div>
    </aside>
  );
}
