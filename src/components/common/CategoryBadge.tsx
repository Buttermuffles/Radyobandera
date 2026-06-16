import type { Category } from "../../types/news";
import { Badge } from "../ui/badge";

const styles: Record<Category, string> = {
  NATION: "bg-brand-red text-white",
  ENTERTAINMENT: "bg-pink-600 text-white",
  WORLD: "bg-brand-blue text-white",
  SPORTS: "bg-emerald-700 text-white",
  LIFESTYLE: "bg-amber-700 text-white",
  ASIA: "bg-indigo-700 text-white",
};

interface CategoryBadgeProps {
  category: Category;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  return <Badge className={styles[category]}>{category}</Badge>;
}
