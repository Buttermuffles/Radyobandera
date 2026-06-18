import type { Article, Category } from "../types/news";
import { supabase } from "./supabase";

/**
 * Facebook Graph API Integration for News Aggregation
 * This module handles fetching news content from Facebook pages and feeds
 */

const API_VERSION = import.meta.env.VITE_FACEBOOK_GRAPH_API_VERSION || "v19.0";
const ACCESS_TOKEN = import.meta.env.VITE_FACEBOOK_ACCESS_TOKEN;
const APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID;
const USE_FACEBOOK_API = import.meta.env.VITE_USE_FACEBOOK_API === "true";

interface FacebookPost {
  id: string;
  message: string;
  story: string;
  permalink_url: string;
  created_time: string;
  type: string;
  picture?: string;
  full_picture?: string;
  link?: string;
  status_type?: string;
  shares?: { count: number };
  likes?: { data: Array<{ name: string }> };
  comments?: { data: Array<{ message: string }> };
}

interface FacebookPageInfo {
  id: string;
  name: string;
  description: string;
  picture: {
    data: {
      height: number;
      width: number;
      is_silhouette: boolean;
      url: string;
    };
  };
}

/**
 * Fetch posts from a specific Facebook page
 * @param pageId - Facebook page ID
 * @param limit - Number of posts to fetch
 */
// Cache the page access token — use a promise singleton to avoid race conditions
let cachedPageToken: string | null = null;
let tokenFetchPromise: Promise<string> | null = null;

/**
 * Exchange the User Access Token for a Page Access Token.
 * Uses a promise singleton so multiple simultaneous callers share one request.
 */
async function getPageAccessToken(pageId: string): Promise<string> {
  if (cachedPageToken) return cachedPageToken;

  // If a fetch is already in-flight, wait for it instead of firing another
  if (tokenFetchPromise) return tokenFetchPromise;

  tokenFetchPromise = (async () => {
    const url = `https://graph.facebook.com/${API_VERSION}/${pageId}`;
    const params = new URLSearchParams({
      fields: "access_token",
      access_token: ACCESS_TOKEN,
    });

    const response = await fetch(`${url}?${params}`);
    const data = await response.json();

    if (data.error) {
      tokenFetchPromise = null;
      throw new Error(`Failed to get Page Access Token: ${data.error.message}`);
    }

    if (!data.access_token) {
      console.warn("Page access token not returned — using user token as fallback.");
      cachedPageToken = ACCESS_TOKEN;
    } else {
      cachedPageToken = data.access_token;
    }

    tokenFetchPromise = null;
    return cachedPageToken!;
  })();

  return tokenFetchPromise;
}

// Cache posts to avoid hitting rate limits (especially when Home.tsx makes 5 concurrent requests)
let cachedPosts: FacebookPost[] | null = null;
let postsFetchPromise: Promise<FacebookPost[]> | null = null;
let lastPostsFetch = 0;
const CACHE_TTL = 60 * 1000; // 60 seconds

export async function getPagePosts(pageId: string, limit = 10): Promise<FacebookPost[]> {
  if (!ACCESS_TOKEN) {
    throw new Error("Facebook access token is not configured.");
  }
  if (!pageId || pageId.startsWith("your_") || pageId === "YOUR_PAGE_ID") {
    throw new Error("Facebook page ID is not configured or still a placeholder.");
  }

  let rawPosts: FacebookPost[] = [];

  // Use cached posts if still valid
  if (cachedPosts && Date.now() - lastPostsFetch < CACHE_TTL) {
    rawPosts = cachedPosts;
  } else {
    // If a fetch is already happening, wait for it
    if (!postsFetchPromise) {
      postsFetchPromise = (async () => {
        try {
          // 1. Try to fetch from Supabase (Middleman Cache) first if configured
          if (supabase) {
            const { data, error } = await supabase
              .from('facebook_cache')
              .select('data')
              .eq('id', 1)
              .single();

            if (!error && data && data.data) {
              cachedPosts = data.data;
              lastPostsFetch = Date.now();
              postsFetchPromise = null;
              return cachedPosts!;
            }
          }

          // 2. Fallback to Facebook API if Supabase is not configured or failed
          const pageToken = await getPageAccessToken(pageId);
          const url = `https://graph.facebook.com/${API_VERSION}/${pageId}/posts`;
          const params = new URLSearchParams({
            fields: "id,message,story,permalink_url,created_time,full_picture,picture,status_type,attachments{media_type,media,url}",
            access_token: pageToken,
            limit: "60", // Fetch enough to cache for all categories
          });

          const response = await fetch(`${url}?${params}`);
          if (!response.ok) {
            throw new Error(`Facebook API error: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          if (data.error) {
            throw new Error(`Facebook API error: ${data.error.message}`);
          }

          cachedPosts = data.data || [];
          lastPostsFetch = Date.now();
          postsFetchPromise = null;
          return cachedPosts!;
        } catch (err) {
          postsFetchPromise = null;
          throw err;
        }
      })();
    }
    rawPosts = await postsFetchPromise;
  }

  // Filter to only include actual news posts (has message) and exclude status updates & shared posts
  const newsPosts = rawPosts.filter((post) => {
    if (!post.message || post.message.trim() === "") return false;
    if (post.status_type === "shared_story") return false;
    if (post.story) {
      const lowerStory = post.story.toLowerCase();
      if (
        lowerStory.includes("updated their") ||
        lowerStory.includes("changed their") ||
        lowerStory.includes("updated its") ||
        lowerStory.includes("changed its")
      ) {
        return false;
      }
    }
    return true;
  });

  return newsPosts.slice(0, limit);
}

/**
 * Fetch page information
 * @param pageId - Facebook page ID
 */
export async function getPageInfo(pageId: string): Promise<FacebookPageInfo | null> {
  if (!USE_FACEBOOK_API || !ACCESS_TOKEN) {
    return null;
  }

  try {
    const url = `https://graph.facebook.com/${API_VERSION}/${pageId}`;
    const params = new URLSearchParams({
      fields: "id,name,description,picture",
      access_token: ACCESS_TOKEN,
    });

    const response = await fetch(`${url}?${params}`);
    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching Facebook page info:", error);
    return null;
  }
}

/**
 * Convert Facebook post to Article format
 * @param post - Facebook post object
 * @param category - News category
 * @param author - Author information
 */
/**
 * Detect news category from post hashtags
 */
export function detectCategory(message: string): Category {
  const lower = message.toLowerCase();
  if (lower.includes("#local")) return "LOCAL";
  if (lower.includes("#regional")) return "REGIONAL";
  if (lower.includes("#national")) return "NATIONAL";
  return "OTHER";
}

/**
 * Convert Facebook post to Article format
 * @param post - Facebook post object
 * @param category - News category
 * @param author - Author information
 */
export function convertPostToArticle(
  post: FacebookPost,
  category: string,
  author: { id: string; name: string; role: string }
): Article {
  const content = post.message || post.story || "";
  const [excerpt, ...bodyParts] = content.split("\n");

  return {
    id: post.id,
    slug: post.id.replace("_", "-"),
    title: excerpt.substring(0, 100) || "Untitled",
    excerpt: excerpt.substring(0, 160),
    body: `<p>${bodyParts.join("</p><p>")}</p>`,
    category: category as any,
    author,
    thumbnail: post.full_picture || post.picture || "",
    publishedAt: post.created_time,
    tags: extractHashtags(content),
    views: post.likes?.data?.length || 0,
    isBreaking: false,
    facebookUrl: post.permalink_url,
  };
}

/**
 * Fetch a single post by ID and convert it
 */
export async function getPostById(postId: string): Promise<FacebookPost | null> {
  if (!ACCESS_TOKEN) return null;

  try {
    const pageId = postId.split("_")[0];
    const pageToken = await getPageAccessToken(pageId);

    const url = `https://graph.facebook.com/${API_VERSION}/${postId}`;
    const params = new URLSearchParams({
      fields: "id,message,story,permalink_url,created_time,full_picture,picture,status_type,attachments{media_type,media,url}",
      access_token: pageToken,
    });

    const response = await fetch(`${url}?${params}`);
    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching single post by ID:", error);
    return null;
  }
}

/**
 * Extract hashtags from Facebook post content
 */
function extractHashtags(text: string): string[] {
  const hashtagRegex = /#(\w+)/g;
  const matches = text.match(hashtagRegex) || [];
  return matches.map((tag) => tag.substring(1));
}

/**
 * Check if a post contains a specific hashtag (case-insensitive)
 * @param post - Facebook post object
 * @param hashtag - Hashtag to look for (without the # symbol)
 */
function postHasHashtag(post: FacebookPost, hashtag: string): boolean {
  const content = (post.message || post.story || "").toLowerCase();
  return content.includes(`#${hashtag.toLowerCase()}`);
}

/**
 * Fetch posts from a specific Facebook page and filter by hashtag.
 * Use this when one page hosts all categories, differentiated by hashtags.
 * @param pageId - Facebook page ID
 * @param hashtag - Hashtag to filter by (without the # symbol, e.g. "Local")
 * @param limit - Max number of matching posts to return
 * @param fetchLimit - How many posts to pull from the API before filtering (fetch more to ensure enough matches)
 */
export async function getPagePostsByHashtag(
  pageId: string,
  hashtag: string,
  limit = 10,
  fetchLimit = 50
): Promise<FacebookPost[]> {
  const posts = await getPagePosts(pageId, fetchLimit);
  const filtered = posts.filter((post) => postHasHashtag(post, hashtag));
  return filtered.slice(0, limit);
}

/**
 * Search for public posts by keywords
 * @param query - Search query
 * @param limit - Number of results
 */
export async function searchPosts(query: string, limit = 10): Promise<FacebookPost[]> {
  if (!USE_FACEBOOK_API || !ACCESS_TOKEN || ACCESS_TOKEN.startsWith("your_")) {
    throw new Error("Facebook API not configured or using placeholder credentials.");
  }

  try {
    const url = `https://graph.facebook.com/${API_VERSION}/search`;
    const params = new URLSearchParams({
      q: query,
      type: "post",
      fields: "id,message,story,permalink_url,created_time,type,picture,full_picture,link,shares.limit(1),likes.limit(1),comments.limit(1)",
      access_token: ACCESS_TOKEN,
      limit: limit.toString(),
    });

    const response = await fetch(`${url}?${params}`);
    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(`Facebook API error: ${data.error.message}`);
    }
    return data.data || [];
  } catch (error) {
    console.error("Error searching Facebook posts:", error);
    throw error;
  }
}

/**
 * Get trending topics from Facebook
 */
export async function getTrendingTopics(_country = "PH", limit = 10): Promise<string[]> {
  if (!USE_FACEBOOK_API || !ACCESS_TOKEN) {
    return [];
  }

  try {
    const url = `https://graph.facebook.com/${API_VERSION}/me/feed`;
    const params = new URLSearchParams({
      fields: "story,permalink_url",
      access_token: ACCESS_TOKEN,
      limit: (limit * 3).toString(),
    });

    const response = await fetch(`${url}?${params}`);
    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.statusText}`);
    }

    const data = await response.json();
    const posts = data.data || [];

    // Extract topics from stories
    const topics = new Set<string>();
    posts.forEach((post: any) => {
      const text = post.story || "";
      const words = text.split(/\s+/);
      words.forEach((word: string) => {
        if (word.startsWith("#")) {
          topics.add(word.substring(1));
        }
      });
    });

    return Array.from(topics).slice(0, limit);
  } catch (error) {
    console.error("Error fetching trending topics:", error);
    return [];
  }
}

/**
 * Initialize Facebook SDK
 * Call this once on app startup
 */
export function initializeFacebook(): void {
  if (!USE_FACEBOOK_API || !APP_ID) {
    console.log("Facebook SDK initialization skipped");
    return;
  }

  window.fbAsyncInit = function () {
    window.FB.init({
      appId: APP_ID,
      xfbml: true,
      version: API_VERSION,
    });
  };

  // Load the Facebook SDK
  const script = document.createElement("script");
  script.async = true;
  script.defer = true;
  script.crossOrigin = "anonymous";
  script.src = `https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=${API_VERSION}&appId=${APP_ID}`;
  document.body.appendChild(script);
}

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}
