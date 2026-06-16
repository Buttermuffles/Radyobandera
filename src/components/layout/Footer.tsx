export function Footer() {
  return (
    <footer className="border-t border-white/60 bg-[linear-gradient(180deg,_#07163e_0%,_#040b22_100%)] px-4 py-10 text-center text-sm text-slate-300">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4">
        <img
          src="/LOGO.jpg"
          alt="Radyo Bandera Surallah 98.1 FM logo"
          className="h-20 w-20 rounded-2xl object-cover shadow-[0_16px_30px_rgba(8,24,79,0.35)]"
        />
        <p className="font-heading text-lg font-black tracking-[0.2em] text-white">RADYO BANDERA SURALLAH 98.1 FM</p>
        <p className="text-slate-400">
          Delivering verified local, national, and global stories with a stronger on-air identity.
        </p>
        <p className="text-xs text-slate-500">© {new Date().getFullYear()} Radyo Bandera Surallah 98.1 FM</p>
      </div>
    </footer>
  );
}
