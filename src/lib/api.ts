import type { Article, Category, LiveStreamResponse, WeatherData, TrendingTopic } from "../types/news";
import { getCache, getCacheStale, setCache, persistCache, findInCache, hasCacheCookie } from "./cache";
import { getPagePosts, convertPostToArticle, detectCategory } from "./facebook";

const CACHE_TTL = 5 * 60 * 1000;
const HARD_TTL = 30 * 60 * 1000;
const FETCH_TIMEOUT = 5000;
const FB_PAGE_ID = import.meta.env.VITE_FACEBOOK_LOCAL_PAGE_ID;

interface ApiArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  author_name: string;
  author_role: string;
  thumbnail: string;
  published_at: string;
  tags: string[];
  views: number;
  is_breaking: boolean;
  facebook_url: string;
  images?: string[];
}

interface ApiResponse {
  articles: ApiArticle[];
  total: number;
  page: number;
  hasMore: boolean;
}

const BASE = "/api/news";

function toArticle(a: ApiArticle): Article {
  return {
    id: a.id,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    body: a.body,
    category: a.category as Category,
    author: { id: "fb-page", name: a.author_name, role: a.author_role },
    thumbnail: a.thumbnail,
    publishedAt: a.published_at,
    tags: a.tags,
    views: a.views,
    isBreaking: a.is_breaking,
    facebookUrl: a.facebook_url,
    images: a.images,
  };
}

async function fetchFromFacebook(): Promise<Article[]> {
  if (!FB_PAGE_ID) return [];
  try {
    const posts = await getPagePosts(FB_PAGE_ID, 60);
    return posts.map((post) =>
      convertPostToArticle(post, detectCategory(post.message || ""), {
        id: "fb-page",
        name: "Radyo Bandera Surallah 98.1 FM",
        role: "admin",
      })
    );
  } catch (e) {
    console.warn("Facebook fallback failed:", e);
    return [];
  }
}

const inflightRefreshes = new Set<string>();

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

function storeArticles(cacheKey: string, articles: Article[]): void {
  if (articles.length > 0) {
    setCache(cacheKey, articles);
    persistCache();
  }
}

function bgRefresh(cacheKey: string, url: string): void {
  if (inflightRefreshes.has(cacheKey)) return;
  inflightRefreshes.add(cacheKey);
  fetchWithTimeout(url)
    .then(async (res) => {
      if (!res.ok) return;
      const data: ApiResponse = await res.json();
      storeArticles(cacheKey, (data.articles || []).map(toArticle));
    })
    .catch(() => {})
    .finally(() => inflightRefreshes.delete(cacheKey));
}

async function fetchFresh(cacheKey: string, qs: string, slug?: string): Promise<Article[]> {
  const url = `${BASE}?${qs}`;

  try {
    const res = await fetchWithTimeout(url);
    if (res.ok) {
      const data: ApiResponse = await res.json();
      const articles = (data.articles || []).map(toArticle);
      if (articles.length > 0) {
        storeArticles(cacheKey, articles);
        return articles;
      }
    }
  } catch {
    /* API failed, try Facebook fallback */
  }

  const fbArticles = await fetchFromFacebook();
  if (fbArticles.length > 0) {
    const matched = slug ? fbArticles.filter((a) => a.slug === slug) : fbArticles;
    if (matched.length > 0) {
      storeArticles(cacheKey, matched);
      return matched;
    }
  }

  const stale = getCacheStale<Article[]>(cacheKey, Number.MAX_SAFE_INTEGER);
  if (stale) return stale;
  return [];
}

async function fetchFromApi(params?: {
  category?: Category;
  limit?: number;
  search?: string;
  slug?: string;
}): Promise<Article[]> {
  const query = new URLSearchParams();
  if (params?.category) query.set("category", params.category);
  if (params?.search) query.set("search", params.search);
  if (params?.slug) query.set("slug", params.slug);
  query.set("limit", String(params?.limit || 60));
  query.set("page", "1");

  const qs = query.toString();
  const cacheKey = params?.slug
    ? `article:${params.slug}`
    : `articles:${params?.category || "all"}:${params?.search || ""}:${params?.limit || 60}`;

  const cached = getCache<Article[]>(cacheKey, CACHE_TTL);
  if (cached) return cached;

  const stale = getCacheStale<Article[]>(cacheKey, HARD_TTL);
  if (stale) {
    bgRefresh(cacheKey, `${BASE}?${qs}`);
    return stale;
  }

  if (params?.category || params?.slug) {
    const allKey = `articles:all:60`;
    const allStale = getCacheStale<Article[]>(allKey, Number.MAX_SAFE_INTEGER);
    if (allStale) {
      const filtered = params?.slug
        ? allStale.filter((a) => a.slug === params.slug)
        : allStale.filter((a) => a.category === params.category);
      if (filtered.length > 0) {
        setCache(cacheKey, filtered);
        persistCache();
        return filtered;
      }
    }
  }

  if (hasCacheCookie()) {
    const cookieStale = getCacheStale<Article[]>(cacheKey, Number.MAX_SAFE_INTEGER);
    if (cookieStale) {
      bgRefresh(cacheKey, `${BASE}?${qs}`);
      return cookieStale;
    }
  }

  return fetchFresh(cacheKey, qs, params?.slug);
}

export async function getArticles(params?: {
  category?: Category;
  limit?: number;
  search?: string;
}): Promise<Article[]> {
  return fetchFromApi(params);
}

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  const cached = findInCache<Article[]>((data) => {
    if (!Array.isArray(data)) return false;
    return data.some((a) => a.slug === slug);
  });
  if (cached) {
    const found = cached.find((a) => a.slug === slug);
    if (found) {
      setCache(`article:${slug}`, [found]);
      return found;
    }
  }

  const articles = await fetchFromApi({ slug, limit: 1 });
  return articles[0];
}

export async function getBreakingNews(): Promise<Article[]> {
  const all = await getArticles({ limit: 30 });
  return all.filter((article) => article.isBreaking);
}

export async function getMostRead(hours = 24, limit = 4): Promise<Article[]> {
  const cutoff = Date.now() - hours * 60 * 60 * 1000;
  const all = await getArticles({ limit: 50 });
  return all
    .filter((article) => +new Date(article.publishedAt) >= cutoff)
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}

export async function getTrendingTopics(limit = 6, articles?: Article[]): Promise<TrendingTopic[]> {
  if (!articles) articles = await getArticles({ limit: 50 });

  const tagCount = new Map<string, number>();
  for (const article of articles) {
    for (const tag of article.tags) {
      tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
    }
  }

  return Array.from(tagCount.entries())
    .map(([name, count]) => ({
      name,
      count,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export async function getLiveStream(): Promise<LiveStreamResponse> {
  return {
    videoUrl: import.meta.env.VITE_LIVE_VIDEO_URL || "",
    audioUrl: import.meta.env.VITE_LIVE_AUDIO_URL || "",
    isLive: import.meta.env.VITE_IS_LIVE === "true",
  };
}

const mockWeather: WeatherData = {
  current: {
    temp: 31,
    feelsLike: 34,
    humidity: 72,
    description: "scattered clouds",
    icon: "https://openweathermap.org/img/wn/02d@2x.png",
    city: "Surallah",
  },
  forecast: [
    {
      day: "Tomorrow",
      high: 32,
      low: 24,
      icon: "https://openweathermap.org/img/wn/10d@2x.png",
      description: "thunderstorm",
    },
    {
      day: new Date(Date.now() + 2 * 86400000).toLocaleDateString("en-PH", { weekday: "short" }),
      high: 30,
      low: 23,
      icon: "https://openweathermap.org/img/wn/04d@2x.png",
      description: "overcast clouds",
    },
    {
      day: new Date(Date.now() + 3 * 86400000).toLocaleDateString("en-PH", { weekday: "short" }),
      high: 31,
      low: 24,
      icon: "https://openweathermap.org/img/wn/02d@2x.png",
      description: "few clouds",
    },
  ],
};

export async function getWeather(): Promise<WeatherData> {
  return mockWeather;
}
