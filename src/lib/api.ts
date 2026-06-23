import type { Article, Category, LiveStreamResponse, WeatherData } from "../types/news";
import { getCache, getCacheStale, setCache, persistCache, findInCache, hasCacheCookie } from "./cache";

const CACHE_TTL = 15 * 60 * 1000;
const HARD_TTL = 60 * 60 * 1000;
const FETCH_TIMEOUT = 5000;

const FB_PAGE_ID = import.meta.env.VITE_FACEBOOK_LOCAL_PAGE_ID;
const FB_TOKEN = import.meta.env.VITE_FACEBOOK_ACCESS_TOKEN;
const FB_API_VERSION = import.meta.env.VITE_FACEBOOK_GRAPH_API_VERSION || "v20.0";

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

// ponytail: minimal inline Facebook fallback for local dev (no Vercel server)
async function fetchFacebookFallback(_category?: string): Promise<Article[]> {
  if (!FB_PAGE_ID || !FB_TOKEN) return [];
  try {
    const url = `https://graph.facebook.com/${FB_API_VERSION}/${FB_PAGE_ID}/posts?fields=id,message,story,permalink_url,created_time,full_picture,picture,status_type,attachments{subattachments{media{image{src}}},media_type,media{image{src}},url}&access_token=${FB_TOKEN}&limit=60`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (data.error || !data.data) return [];
    return (data.data as any[]).filter((p: any) => p.message).map((post: any) => {
      const content = post.message || "";
      const [excerpt, ...bodyParts] = content.split("\n");
      const lower = content.toLowerCase();
      const tags = (content.match(/#(\w+)/g) || []).map((t: string) => t.substring(1));
      const category = lower.includes("#local") ? "LOCAL" : lower.includes("#regional") ? "REGIONAL" : lower.includes("#national") ? "NATIONAL" : "OTHER";
      const images: string[] = [];
      if (post.full_picture) images.push(post.full_picture);
      return {
        id: post.id, slug: post.id.replace("_", "-"),
        title: (excerpt || "Untitled").substring(0, 100),
        excerpt: (excerpt || "").substring(0, 160),
        body: `<p>${bodyParts.join("</p><p>")}</p>`, category: category as Category,
        author: { id: "fb-page", name: "Radyo Bandera Surallah 98.1 FM", role: "Facebook Page" },
        thumbnail: post.full_picture || post.picture || "",
        images: images.length > 1 ? images : undefined,
        publishedAt: post.created_time, tags,
        views: post.likes?.data?.length || 0, isBreaking: lower.includes("#breaking") || lower.includes("breaking news"),
        facebookUrl: post.permalink_url,
      };
    });
  } catch { return []; }
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
    // ponytail: defer localStorage write — don't block render on serialization
    queueMicrotask(() => persistCache());
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

async function fetchFresh(cacheKey: string, qs: string): Promise<{ articles: Article[]; hasMore: boolean }> {
  const url = `${BASE}?${qs}`;

  try {
    const res = await fetchWithTimeout(url);
    if (res.ok) {
      const data: ApiResponse = await res.json();
      const articles = (data.articles || []).map(toArticle);
      if (articles.length > 0) {
        storeArticles(cacheKey, articles);
        return { articles, hasMore: data.hasMore };
      }
    }
  } catch {
    /* ponytail: fallback to direct Facebook API for local dev */
    const fb = await fetchFacebookFallback();
    if (fb.length > 0) { storeArticles(cacheKey, fb); return { articles: fb, hasMore: false }; }
  }

  const stale = getCacheStale<Article[]>(cacheKey, Number.MAX_SAFE_INTEGER);
  if (stale) return { articles: stale, hasMore: false };
  return { articles: [], hasMore: false };
}

interface FetchResult {
  articles: Article[];
  hasMore: boolean;
}

async function fetchFromApi(params?: {
  category?: Category;
  limit?: number;
  search?: string;
  slug?: string;
  page?: number;
}): Promise<FetchResult> {
  const query = new URLSearchParams();
  if (params?.category) query.set("category", params.category);
  if (params?.search) query.set("search", params.search);
  if (params?.slug) query.set("slug", params.slug);
  query.set("limit", String(params?.limit || 60));
  query.set("page", String(params?.page || 1));

  const qs = query.toString();
  const page = params?.page || 1;
  const limit = params?.limit || 60;
  const cacheKey = params?.slug
    ? `article:${params.slug}`
    : `articles:${params?.category || "all"}:${params?.search || ""}:${limit}:page${page}`;

  const cached = getCache<Article[]>(cacheKey, CACHE_TTL);
  if (cached) return { articles: cached, hasMore: cached.length === limit };

  const stale = getCacheStale<Article[]>(cacheKey, HARD_TTL);
  if (stale) {
    bgRefresh(cacheKey, `${BASE}?${qs}`);
    return { articles: stale, hasMore: stale.length === limit };
  }

  // ponytail: only derive from all-cache for page 1 (subsequent pages need real fetch)
  if (page === 1 && (params?.category || params?.slug)) {
    const allKey = `articles:all:60:page1`;
    const allStale = getCacheStale<Article[]>(allKey, Number.MAX_SAFE_INTEGER);
    if (allStale) {
      const filtered = params?.slug
        ? allStale.filter((a) => a.slug === params.slug)
        : allStale.filter((a) => a.category === params.category);
      if (filtered.length > 0) {
        setCache(cacheKey, filtered);
        persistCache();
        return { articles: filtered, hasMore: false };
      }
    }
  }

  if (hasCacheCookie()) {
    const cookieStale = getCacheStale<Article[]>(cacheKey, Number.MAX_SAFE_INTEGER);
    if (cookieStale) {
      bgRefresh(cacheKey, `${BASE}?${qs}`);
      return { articles: cookieStale, hasMore: false };
    }
  }

  return fetchFresh(cacheKey, qs);
}

// ponytail: sync cache read — used by pages to show content on first render (no skeleton flash)
export function getArticlesSync(): Article[] | null {
  return getCache<Article[]>("articles:all::60:page1", HARD_TTL);
}

export async function getArticles(params?: {
  category?: Category;
  limit?: number;
  search?: string;
  page?: number;
}): Promise<{ articles: Article[]; hasMore: boolean }> {
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

  const { articles } = await fetchFromApi({ slug, limit: 1 });
  return articles[0];
}

export async function getBreakingNews(): Promise<Article[]> {
  const { articles } = await getArticles({ limit: 60 });
  return articles;
}

export async function getMostRead(hours = 24, limit = 4): Promise<Article[]> {
  const cutoff = Date.now() - hours * 60 * 60 * 1000;
  const { articles } = await getArticles({ limit: 50 });
  return articles
    .filter((article) => +new Date(article.publishedAt) >= cutoff)
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}

async function liveFromFacebook(): Promise<LiveStreamResponse> {
  const pageId = import.meta.env.VITE_FACEBOOK_LOCAL_PAGE_ID;
  const token = import.meta.env.VITE_FACEBOOK_ACCESS_TOKEN;
  const ver = import.meta.env.VITE_FACEBOOK_GRAPH_API_VERSION || "v20.0";
  if (!pageId || !token) throw new Error("Facebook env vars not set");
  const enc = encodeURIComponent;
  const liveUrl = `https://graph.facebook.com/${ver}/${pageId}/live_videos?fields=stream_url,status,permalink_url,embed_html&access_token=${enc(token)}`;
  const res = await fetch(liveUrl);
  if (!res.ok) throw new Error("Facebook API error");
  const data = await res.json();
  const liveVideo = !data.error ? data.data?.[0] : null;
  const permalink = liveVideo?.permalink_url || "";
  const fullPermalink = permalink.startsWith("/") ? `https://www.facebook.com${permalink}` : permalink;
  return {
    videoUrl: liveVideo?.stream_url || "",
    audioUrl: import.meta.env.VITE_LIVE_AUDIO_URL || "",
    isLive: liveVideo?.status === "LIVE",
    embedHtml: liveVideo?.embed_html || "",
    permalinkUrl: fullPermalink,
  };
}

export async function getLiveStream(): Promise<LiveStreamResponse> {
  if (import.meta.env.DEV) return liveFromFacebook();
  try {
    const res = await fetch("/api/live");
    if (res.ok) {
      const data = await res.json();
      return {
        videoUrl: data.videoUrl || "",
        audioUrl: import.meta.env.VITE_LIVE_AUDIO_URL || "",
        isLive: !!data.isLive,
        embedHtml: data.embedHtml || "",
        permalinkUrl: data.permalinkUrl || "",
      };
    }
  } catch { /* fall through */ }

  return {
    videoUrl: "",
    audioUrl: import.meta.env.VITE_LIVE_AUDIO_URL || "",
    isLive: false,
    embedHtml: "",
    permalinkUrl: "",
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
