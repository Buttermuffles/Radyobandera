const FB_PAGE_ID = process.env.VITE_FACEBOOK_LOCAL_PAGE_ID;
const FB_TOKEN = process.env.VITE_FACEBOOK_ACCESS_TOKEN;
const API_VERSION = process.env.VITE_FACEBOOK_GRAPH_API_VERSION || "v25.0";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const rateLimitStore = new Map();
const cacheStore = new Map();
const CACHE_TTL = 300_000;

function checkRateLimit(key) {
  const now = Date.now();
  const last = rateLimitStore.get(key) || 0;
  if (now - last < 30000) return false;
  rateLimitStore.set(key, now);
  return true;
}

function cacheKey({ category, search, slug, page, limit }) {
  if (slug) return `article:${slug}`;
  return `articles:${category || "all"}:${search || ""}:${page}:${limit}`;
}

function getCached(key) {
  const entry = cacheStore.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) {
    cacheStore.delete(key);
    return null;
  }
  return entry.data;
}

function setCached(key, data) {
  cacheStore.set(key, { data, ts: Date.now() });
}

function parsePosts(rawPosts) {
  return (rawPosts || []).filter((p) => p.message).map((post) => {
    const content = post.message || post.story || "";
    const [excerpt, ...bodyParts] = content.split("\n");
    const lower = content.toLowerCase();
    let category = "OTHER";
    if (lower.includes("#local")) category = "LOCAL";
    else if (lower.includes("#regional")) category = "REGIONAL";
    else if (lower.includes("#national")) category = "NATIONAL";

    const tags = (content.match(/#(\w+)/g) || []).map((t) => t.substring(1));
    const slug = post.id.replace("_", "-");

    return {
      id: post.id,
      slug,
      title: (excerpt || "Untitled").substring(0, 100),
      excerpt: (excerpt || "").substring(0, 160),
      body: `<p>${bodyParts.join("</p><p>")}</p>`,
      category,
      author_name: "Radyo Bandera Surallah 98.1 FM",
      author_role: "Facebook Page",
      thumbnail: post.full_picture || post.picture || "",
      published_at: post.created_time,
      tags,
      views: post.likes?.data?.length || 0,
      is_breaking: lower.includes("#breaking") || lower.includes("breaking news"),
      facebook_url: post.permalink_url,
    };
  });
}

async function fetchFromFacebook(limit = 60) {
  const tokenUrl = `https://graph.facebook.com/${API_VERSION}/${FB_PAGE_ID}?fields=access_token&access_token=${FB_TOKEN}`;
  const tokenRes = await fetch(tokenUrl);
  const tokenData = await tokenRes.json();
  if (tokenData.error) throw new Error(`Token error: ${tokenData.error.message}`);

  const pageToken = tokenData.access_token || FB_TOKEN;
  const postsUrl = `https://graph.facebook.com/${API_VERSION}/${FB_PAGE_ID}/posts?fields=id,message,story,permalink_url,created_time,full_picture,picture,status_type,attachments{media_type,media,url}&access_token=${pageToken}&limit=${limit}`;
  const postsRes = await fetch(postsUrl);
  const postsData = await postsRes.json();
  if (postsData.error) throw new Error(`API error: ${postsData.error.message}`);

  return parsePosts(postsData.data);
}

function applyFilters(articles, { category, search, slug, page, limit }) {
  let result = articles;
  const categories = ["LOCAL", "REGIONAL", "NATIONAL"];
  if (category && categories.includes(category.toUpperCase())) {
    result = result.filter((a) => a.category === category.toUpperCase());
  }
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
  if (slug) {
    result = result.filter((a) => a.slug === slug);
  }
  const total = result.length;
  result = result.slice((page - 1) * limit, page * limit);
  return { articles: result, total, page, hasMore: result.length === limit };
}

async function fetchFromSupabase({ category, search, slug, page, limit }) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;

  const key = cacheKey({ category, search, slug, page, limit });
  const cached = getCached(key);
  if (cached) return cached;

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  let query = supabase
    .from("articles")
    .select("*", { count: "exact" });

  if (slug) {
    query = query.eq("slug", slug).single();
  } else {
    if (category && category !== "ALL") query = query.eq("category", category);
    if (search) query = query.or(
      `title.ilike.%${search}%,excerpt.ilike.%${search}%,tags.cs.{${search}}`
    );
    query = query
      .order("published_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
  }

  const { data, error, count } = await query;
  if (error) throw new Error(`Supabase error: ${error.message}`);

  const result = slug
    ? { articles: data ? [data] : [], total: data ? 1 : 0 }
    : { articles: data || [], total: count || 0, page, hasMore: (data?.length || 0) >= limit };

  setCached(key, result);
  return result;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { category, search, slug, page = "1", limit = "20" } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(60, Math.max(1, parseInt(limit, 10) || 20));
  const params = { category, search, slug, page: pageNum, limit: limitNum };

  try {
    if (!FB_PAGE_ID || !FB_TOKEN) {
      const fromSupabase = await fetchFromSupabase(params);
      if (fromSupabase) {
        res.json(fromSupabase);
        return;
      }
      res.json({ articles: [], total: 0, page: pageNum, hasMore: false });
      return;
    }

    if (slug) {
      const cached = await fetchFromSupabase({ ...params, slug });
      if (cached && cached.articles.length > 0) {
        res.json(cached);
        return;
      }
    }

    const rateKey = category || "default";
    if (checkRateLimit(rateKey)) {
      let articles = await fetchFromFacebook(60);

      try {
        if (SUPABASE_URL && SUPABASE_KEY) {
          const { createClient } = await import("@supabase/supabase-js");
          const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
          for (const article of articles) {
            await supabase.from("articles").upsert(
              { ...article, updated_at: new Date().toISOString() },
              { onConflict: "id" }
            );
          }

          const fbKey = cacheKey(params);
          const result = applyFilters(articles, params);
          setCached(fbKey, result);
        }
      } catch (dbErr) {
        console.warn("Failed to cache in Supabase:", dbErr.message);
      }

      const result = applyFilters(articles, params);
      res.json(result);
    } else {
      const cached = await fetchFromSupabase(params);
      if (cached) {
        res.json(cached);
        return;
      }
      res.json({ articles: [], total: 0, page: pageNum, hasMore: false });
    }
  } catch (error) {
    console.error("API Error:", error.message);
    try {
      const cached = await fetchFromSupabase(params);
      if (cached) {
        res.json(cached);
        return;
      }
    } catch { /* ignore */ }
    const stale = getCached(cacheKey(params));
    if (stale) { res.json(stale); return; }
    res.status(500).json({ error: error.message });
  }
}
