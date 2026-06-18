import type { Article, Category, LiveStreamResponse, WeatherData } from "../types/news";
import {
  getPagePosts,
  convertPostToArticle,
  searchPosts,
  getPostById,
  detectCategory,
} from "./facebook";

// Single Facebook Page ID — all posts from this page appear in every category section
const FACEBOOK_PAGE_ID: string = import.meta.env.VITE_FACEBOOK_LOCAL_PAGE_ID || "";

const useFacebookAPI = import.meta.env.VITE_USE_FACEBOOK_API === "true";

const allArticles: Article[] = [];

function delay<T>(data: T): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(data), 220);
  });
}

export async function getArticles(params?: {
  category?: Category;
  limit?: number;
  search?: string;
}): Promise<Article[]> {
  let result: Article[] = [];

  // Try to fetch from Facebook API if enabled
  // One page is used for all categories — posts are classified by hashtag
  if (useFacebookAPI && FACEBOOK_PAGE_ID && !FACEBOOK_PAGE_ID.startsWith("your_") && FACEBOOK_PAGE_ID !== "YOUR_PAGE_ID") {
    try {
      // If filtering by a specific category, fetch more posts to ensure we get enough matches
      const fetchLimit = params?.category ? 60 : (params?.limit || 20);
      const posts = await getPagePosts(FACEBOOK_PAGE_ID, fetchLimit);

      const author = {
        id: "fb-page",
        name: "Radyo Bandera Surallah 98.1 FM",
        role: "Facebook Page",
      };

      result = posts.map((post) => {
        const detected = detectCategory(post.message || post.story || "");
        return convertPostToArticle(post, detected, author);
      });

      // Filter by category if requested
      if (params?.category) {
        result = result.filter((article) => article.category === params.category);
      }
    } catch (error) {
      console.warn("Failed to fetch from Facebook API, falling back to mock data:", error);
      result = [...allArticles];
    }
  } else if (useFacebookAPI && params?.search) {
    // Try to search Facebook for user queries
    try {
      const posts = await searchPosts(params.search, params.limit || 20);

      const author = {
        id: "fb-search",
        name: "Facebook Search Results",
        role: "Social Media",
      };

      result = posts.map((post) =>
        convertPostToArticle(post, "NATIONAL", author)
      );
    } catch (error) {
      console.warn("Failed to search Facebook API, falling back to mock data:", error);
      result = [...allArticles];
    }
  } else {
    // Use mock data by default
    result = [...allArticles].sort(
      (a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt),
    );
  }

  // Apply client-side filters
  if (params?.category && (!useFacebookAPI || result.length === 0 || result[0].author.id !== "fb-page")) {
    result = result.filter((article) => article.category === params.category);
  }

  if (params?.search) {
    const query = params.search.toLowerCase();
    result = result.filter((article) => {
      return (
        article.title.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query) ||
        article.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    });
  }

  if (params?.limit) {
    result = result.slice(0, params.limit);
  }

  return delay(result);
}

export async function getMostRead(hours = 24, limit = 4): Promise<Article[]> {
  const cutoff = Date.now() - hours * 60 * 60 * 1000;
  const articles = allArticles
    .filter((article) => +new Date(article.publishedAt) >= cutoff)
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);

  return delay(articles);
}

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  // First check if it matches a local mock article
  const mockArticle = allArticles.find((item) => item.slug === slug);
  if (mockArticle) return delay(mockArticle);

  // If using Facebook API, fetch the live post from Facebook using the slug
  if (useFacebookAPI) {
    try {
      // Slug format: "{pageId}-{postId}" — reconstruct full post ID
      const postId = slug.replace(/^(\d+)-(\d+)$/, "$1_$2");
      const post = await getPostById(postId);
      if (post) {
        const author = {
          id: "fb-page",
          name: "Radyo Bandera Surallah 98.1 FM",
          role: "Facebook Page",
        };
        const detected = detectCategory(post.message || post.story || "");
        return convertPostToArticle(post, detected, author);
      }
    } catch (error) {
      console.error("Failed to fetch single Facebook post:", error);
    }
  }

  return delay(undefined);
}

export async function getBreakingNews(): Promise<Article[]> {
  if (useFacebookAPI && FACEBOOK_PAGE_ID && !FACEBOOK_PAGE_ID.startsWith("your_") && FACEBOOK_PAGE_ID !== "YOUR_PAGE_ID") {
    try {
      const posts = await getPagePosts(FACEBOOK_PAGE_ID, 20);
      const author = {
        id: "fb-page",
        name: "Radyo Bandera Surallah 98.1 FM",
        role: "Facebook Page",
      };

      const articles = posts.map((post) => {
        const detected = detectCategory(post.message || post.story || "");
        const article = convertPostToArticle(post, detected, author);

        // Mark as breaking if the post has a breaking news hashtag or starts with BREAKING
        const lowerMessage = (post.message || "").toLowerCase();
        if (
          lowerMessage.includes("#breaking") ||
          lowerMessage.includes("breaking news") ||
          lowerMessage.startsWith("breaking")
        ) {
          article.isBreaking = true;
        }
        return article;
      });

      return delay(articles.filter((article) => article.isBreaking));
    } catch (error) {
      console.warn("Failed to fetch breaking news from Facebook:", error);
    }
  }

  return delay([]);
}

export async function getLiveStream(): Promise<LiveStreamResponse> {
  return delay({
    videoUrl: import.meta.env.VITE_LIVE_VIDEO_URL || "",
    audioUrl: import.meta.env.VITE_LIVE_AUDIO_URL || "",
    isLive: import.meta.env.VITE_IS_LIVE === "true",
  });
}

// ============================================
// Weather Integration
// ============================================

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
  return delay(mockWeather);
}
