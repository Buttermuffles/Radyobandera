import type { Article, Category } from "../types/news";

const API_VERSION = import.meta.env.VITE_FACEBOOK_GRAPH_API_VERSION || "v19.0";
const ACCESS_TOKEN = import.meta.env.VITE_FACEBOOK_ACCESS_TOKEN;
const APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID;
const USE_FACEBOOK_API = import.meta.env.VITE_USE_FACEBOOK_API === "true";

interface FacebookAttachment {
  media_type?: string;
  media?: { image?: { src: string; width?: number; height?: number } };
  target?: { id?: string; url?: string };
  type?: string;
  url?: string;
}

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
  attachments?: { data: FacebookAttachment[] };
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

let cachedPageToken: string | null = null;
let tokenFetchPromise: Promise<string> | null = null;

async function getPageAccessToken(pageId: string): Promise<string> {
  if (cachedPageToken) return cachedPageToken;
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

export async function getPagePosts(pageId: string, limit = 10): Promise<FacebookPost[]> {
  if (!ACCESS_TOKEN) {
    throw new Error("Facebook access token is not configured.");
  }
  if (!pageId || pageId.startsWith("your_") || pageId === "YOUR_PAGE_ID") {
    throw new Error("Facebook page ID is not configured or still a placeholder.");
  }

  const pageToken = await getPageAccessToken(pageId);
  const url = `https://graph.facebook.com/${API_VERSION}/${pageId}/posts`;
  const params = new URLSearchParams({
    fields: "id,message,story,permalink_url,created_time,full_picture,picture,status_type,attachments{media_type,media,url}",
    access_token: pageToken,
    limit: "60",
  });

  const response = await fetch(`${url}?${params}`);
  if (!response.ok) {
    throw new Error(`Facebook API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(`Facebook API error: ${data.error.message}`);
  }

  const rawPosts: FacebookPost[] = data.data || [];

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

export async function getPageInfo(pageId: string): Promise<FacebookPageInfo | null> {
  if (!USE_FACEBOOK_API || !ACCESS_TOKEN) return null;

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

export function detectCategory(message: string): Category {
  const lower = message.toLowerCase();
  if (lower.includes("#local")) return "LOCAL";
  if (lower.includes("#regional")) return "REGIONAL";
  if (lower.includes("#national")) return "NATIONAL";
  return "OTHER";
}

export function convertPostToArticle(
  post: FacebookPost,
  category: string,
  author: { id: string; name: string; role: string }
): Article {
  const content = post.message || post.story || "";
  const [excerpt, ...bodyParts] = content.split("\n");

  const images: string[] = [];
  if (post.full_picture) images.push(post.full_picture);
  if (post.attachments?.data) {
    for (const att of post.attachments.data) {
      const src = att.media?.image?.src;
      if (src && !images.includes(src)) {
        images.push(src);
      }
    }
  }

  return {
    id: post.id,
    slug: post.id.replace("_", "-"),
    title: excerpt.substring(0, 100) || "Untitled",
    excerpt: excerpt.substring(0, 160),
    body: `<p>${bodyParts.join("</p><p>")}</p>`,
    category: category as Category,
    author,
    thumbnail: post.full_picture || post.picture || "",
    images: images.length > 1 ? images : undefined,
    publishedAt: post.created_time,
    tags: extractHashtags(content),
    views: post.likes?.data?.length || 0,
    isBreaking: false,
    facebookUrl: post.permalink_url,
  };
}

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

function extractHashtags(text: string): string[] {
  const hashtagRegex = /#(\w+)/g;
  const matches = text.match(hashtagRegex) || [];
  return matches.map((tag) => tag.substring(1));
}

function postHasHashtag(post: FacebookPost, hashtag: string): boolean {
  const content = (post.message || post.story || "").toLowerCase();
  return content.includes(`#${hashtag.toLowerCase()}`);
}

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

export async function getTrendingTopics(_country = "PH", limit = 10): Promise<string[]> {
  if (!USE_FACEBOOK_API || !ACCESS_TOKEN) return [];

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
