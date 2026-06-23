import { createClient } from "@supabase/supabase-js";

function normalizeUrl(url) {
  try { const u = new URL(url); return u.origin + u.pathname; } catch { return url; }
}

const FB_PAGE_ID = process.env.VITE_FACEBOOK_LOCAL_PAGE_ID;
const FB_TOKEN = process.env.VITE_FACEBOOK_ACCESS_TOKEN;
const API_VERSION = process.env.VITE_FACEBOOK_GRAPH_API_VERSION || "v20.0";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

const rateLimitStore = new Map();
const CACHE_CONTROL = "s-maxage=60, stale-while-revalidate=300";

function checkRateLimit(key) {
  const now = Date.now();
  const last = rateLimitStore.get(key) || 0;
  if (now - last < 30000) return false;
  rateLimitStore.set(key, now);
  return true;
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
    else if (["surallah","tboli","norala","banga","lake sebu"].some(k=>lower.includes(k))) category = "LOCAL";
    else if (["south cotabato","general santos","gensan","koronadal","soccsksargen"].some(k=>lower.includes(k))) category = "REGIONAL";
    else if (["president","senate","congress","duterte","philippines"].some(k=>lower.includes(k))) category = "NATIONAL";

    const tags = (content.match(/#(\w+)/g) || []).map((t) => t.substring(1));
    const slug = post.id.replace("_", "-");

    const images = [];
    if (post.full_picture) images.push(post.full_picture);
    if (post.attachments?.data) {
      for (const att of post.attachments.data) {
        const src = att.media?.image?.src;
        if (src && !images.some((i) => normalizeUrl(i) === normalizeUrl(src))) images.push(src);
        if (att.subattachments?.data) {
          for (const sub of att.subattachments.data) {
            const subSrc = sub.media?.image?.src;
            if (subSrc && !images.some((i) => normalizeUrl(i) === normalizeUrl(subSrc))) images.push(subSrc);
          }
        }
      }
    }

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
      images,
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
  const postsUrl = `https://graph.facebook.com/${API_VERSION}/${FB_PAGE_ID}/posts?fields=id,message,story,permalink_url,created_time,full_picture,picture,status_type,attachments{subattachments{media{image{src}}},media_type,media{image{src}},url}&access_token=${pageToken}&limit=${limit}`;
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
  if (!supabase) return null;

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
  if (error) return null;

  return slug
    ? { articles: data ? [data] : [], total: data ? 1 : 0 }
    : { articles: data || [], total: count || 0, page, hasMore: (data?.length || 0) >= limit };
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
    // Run Supabase and Facebook fetches concurrently (Facebook is rate-limited to 30s)
    const [fromSupabase, fbArticles] = await Promise.all([
      fetchFromSupabase(params),
      (FB_PAGE_ID && FB_TOKEN && checkRateLimit("fb-direct"))
        ? fetchFromFacebook(60).catch(() => null)
        : Promise.resolve(null),
    ]);

    // Merge Facebook images into Supabase data so images always show
    if (fromSupabase && fromSupabase.articles.length > 0) {
      let articles = fromSupabase.articles;

      if (fbArticles && fbArticles.length > 0) {
        // Build an id→article map from Facebook response
        const fbMap = new Map(fbArticles.map(a => [a.id, a]));
        articles = articles.map(a => ({
          ...a,
          images: (fbMap.get(a.id)?.images || a.images || []),
        }));

        // Persist Facebook data to Supabase for future requests
        if (supabase) {
          supabase.from("articles").upsert(
            fbArticles.map(a => ({ ...a, updated_at: new Date().toISOString() })),
            { onConflict: "id" },
          ).catch(() => {});
        }
      }

      res.setHeader("Cache-Control", CACHE_CONTROL);
      res.json({ ...fromSupabase, articles });
      return;
    }

    // No Supabase data — use Facebook data directly
    if (fbArticles && fbArticles.length > 0) {
      if (supabase) {
        supabase.from("articles").upsert(
          fbArticles.map(a => ({ ...a, updated_at: new Date().toISOString() })),
          { onConflict: "id" },
        ).catch(() => {});
      }

      const result = applyFilters(fbArticles, params);
      res.setHeader("Cache-Control", CACHE_CONTROL);
      res.json(result);
      return;
    }

    // Fallback: serve stale Supabase data
    const retry = await fetchFromSupabase(params);
    if (retry && retry.articles.length > 0) {
      res.setHeader("Cache-Control", CACHE_CONTROL);
      res.json(retry);
      return;
    }

    res.setHeader("Cache-Control", CACHE_CONTROL);
    res.json({ articles: [], total: 0, page: pageNum, hasMore: false });
  } catch (error) {
    console.error("API Error:", error.message);
    try {
      const cached = await fetchFromSupabase(params);
      if (cached) {
        res.setHeader("Cache-Control", CACHE_CONTROL);
        res.json(cached);
        return;
      }
    } catch { /* ignore */ }
    res.setHeader("Cache-Control", CACHE_CONTROL);
    res.status(500).json({ error: error.message });
  }
}
