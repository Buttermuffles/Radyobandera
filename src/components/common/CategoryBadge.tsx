import type { Category } from "../../types/news";

const gradients: Record<Category, string> = {
  LOCAL: "bg-gradient-to-r from-red-600 to-rose-500 bg-clip-text text-transparent",
  REGIONAL: "bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent",
  NATIONAL: "bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent",
  OTHER: "bg-gradient-to-r from-slate-600 to-slate-400 bg-clip-text text-transparent",
};

const dots: Record<Category, string> = {
  LOCAL: "bg-red-500",
  REGIONAL: "bg-blue-500",
  NATIONAL: "bg-emerald-500",
  OTHER: "bg-slate-400",
};

interface CategoryBadgeProps {
  category: Category;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.15em]">
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${dots[category]}`} />
      <span className={gradients[category]}>{category === "OTHER" ? "GENERAL" : category}</span>
    </span>
  );
}