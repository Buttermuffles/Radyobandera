import type { Category } from "../../types/news";
import { Badge } from "../ui/badge";

const styles: Record<Category, string> = {
  LOCAL: "bg-brand-red text-white",
  REGIONAL: "bg-brand-blue text-white",
  NATIONAL: "bg-emerald-700 text-white",
  OTHER: "bg-slate-500 text-white",
};

interface CategoryBadgeProps {
  category: Category;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  return <Badge className={styles[category]}>{category === "OTHER" ? "GENERAL" : category}</Badge>;
}
