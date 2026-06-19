const FB_TOKEN = process.env.VITE_FACEBOOK_ACCESS_TOKEN;
const API_VERSION = process.env.VITE_FACEBOOK_GRAPH_API_VERSION || "v25.0";

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

  const { q, limit = "20" } = req.query;
  if (!q) {
    res.status(400).json({ error: "Missing search query" });
    return;
  }

  try {
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const url = `https://graph.facebook.com/${API_VERSION}/search`;
    const params = new URLSearchParams({
      q,
      type: "post",
      fields: "id,message,story,permalink_url,created_time,type,picture,full_picture,link",
      access_token: FB_TOKEN,
      limit: limitNum.toString(),
    });

    const response = await fetch(`${url}?${params}`);
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    const results = (data.data || []).map((post) => {
      const content = post.message || post.story || "";
      const tags = (content.match(/#(\w+)/g) || []).map((t) => t.substring(1));
      return {
        id: post.id,
        slug: post.id.replace("_", "-"),
        title: (content || "Untitled").substring(0, 100),
        excerpt: (content || "").substring(0, 160),
        body: "",
        category: "OTHER",
        author_name: "Facebook Search",
        author_role: "Public",
        thumbnail: post.full_picture || post.picture || "",
        published_at: post.created_time,
        tags,
        views: 0,
        is_breaking: false,
        facebook_url: post.permalink_url,
      };
    });

    res.json({ articles: results, total: results.length });
  } catch (error) {
    console.error("Search API Error:", error.message);
    res.status(500).json({ error: error.message });
  }
}
