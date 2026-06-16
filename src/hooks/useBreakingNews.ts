import { useEffect, useState } from "react";
import { getBreakingNews } from "../lib/api";
import type { Article } from "../types/news";

export function useBreakingNews() {
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    getBreakingNews().then((news) => {
      if (mounted) {
        setItems(news);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  return { items, loading };
}
