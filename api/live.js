const FB_PAGE_ID = process.env.VITE_FACEBOOK_LOCAL_PAGE_ID;
const FB_TOKEN = process.env.VITE_FACEBOOK_ACCESS_TOKEN;
const API_VERSION = process.env.VITE_FACEBOOK_GRAPH_API_VERSION || "v20.0";

const CACHE_CONTROL = "s-maxage=30, stale-while-revalidate=120";
const FB_DOMAIN = "https://www.facebook.com";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  if (req.method !== "GET") { res.status(405).json({ error: "Method not allowed" }); return; }
  if (!FB_PAGE_ID || !FB_TOKEN) {
    res.setHeader("Cache-Control", CACHE_CONTROL);
    res.json({ videoUrl: "", embedHtml: "", permalinkUrl: "", isLive: false });
    return;
  }

  try {
    // Try live_videos edge first
    const enc = encodeURIComponent;
    const liveUrl = `https://graph.facebook.com/${API_VERSION}/${FB_PAGE_ID}/live_videos?fields=stream_url,status,permalink_url,embed_html&access_token=${enc(FB_TOKEN)}`;
    let fbRes = await fetch(liveUrl);
    let data = await fbRes.json();

    let liveVideo = !data.error ? data.data?.[0] : null;

    // If nothing found, try videos?type=live as fallback
    if (!liveVideo || liveVideo.status !== "LIVE") {
      const videosUrl = `https://graph.facebook.com/${API_VERSION}/${FB_PAGE_ID}/videos?type=live&fields=stream_url,status,permalink_url,embed_html,live_status&access_token=${enc(FB_TOKEN)}`;
      fbRes = await fetch(videosUrl);
      data = await fbRes.json();
      if (!data.error) {
        liveVideo = data.data?.find((v) => v.live_status === "LIVE_NOW") || null;
      }
    }

    const isLive = liveVideo?.status === "LIVE" || liveVideo?.live_status === "LIVE_NOW";

    const permalink = liveVideo?.permalink_url || "";
    const fullPermalink = permalink.startsWith("/") ? `${FB_DOMAIN}${permalink}` : permalink;

    res.setHeader("Cache-Control", CACHE_CONTROL);
    res.json({
      videoUrl: liveVideo?.stream_url || "",
      embedHtml: liveVideo?.embed_html || "",
      permalinkUrl: fullPermalink,
      isLive,
    });
  } catch (error) {
    console.error("Live API error:", error.message);
    res.setHeader("Cache-Control", CACHE_CONTROL);
    res.json({ videoUrl: "", embedHtml: "", permalinkUrl: "", isLive: false });
  }
}
