import { createClient } from "@supabase/supabase-js";

process.loadEnvFile();

const FB_PAGE_ID = process.env.VITE_FACEBOOK_LOCAL_PAGE_ID;
const FB_TOKEN = process.env.VITE_FACEBOOK_ACCESS_TOKEN;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!FB_PAGE_ID || !FB_TOKEN || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing required environment variables!");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function parsePosts(rawPosts) {
  return (rawPosts || [])
    .filter((post) => post.message && post.message.trim() !== "")
    .filter((post) => post.status_type !== "shared_story")
    .filter((post) => {
      if (!post.story) return true;
      const lower = post.story.toLowerCase();
      return (
        !lower.includes("updated their") &&
        !lower.includes("changed their") &&
        !lower.includes("updated its") &&
        !lower.includes("changed its")
      );
    })
    .map((post) => {
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
        updated_at: new Date().toISOString(),
      };
    });
}

async function syncFacebookPosts() {
  const startTime = Date.now();
  console.log("Starting Facebook sync...");

  try {
    const tokenUrl = `https://graph.facebook.com/v20.0/${FB_PAGE_ID}?fields=access_token&access_token=${FB_TOKEN}`;
    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      throw new Error(`Facebook Token Error: ${tokenData.error.message}`);
    }

    const pageToken = tokenData.access_token || FB_TOKEN;

    console.log("Fetching posts from Facebook...");
    const postsUrl = `https://graph.facebook.com/v20.0/${FB_PAGE_ID}/posts?fields=id,message,story,permalink_url,created_time,full_picture,picture,status_type,attachments{media_type,media,url},shares,likes.summary(true),comments.summary(true)&access_token=${pageToken}&limit=100`;

    const postsRes = await fetch(postsUrl);
    const postsData = await postsRes.json();

    if (postsData.error) {
      throw new Error(`Facebook API Error: ${postsData.error.message}`);
    }

    const articles = parsePosts(postsData.data);
    console.log(`Fetched ${articles.length} valid articles from Facebook.`);

    let inserted = 0;
    let updated = 0;

    for (const article of articles) {
      const { data: existing } = await supabase
        .from("articles")
        .select("id")
        .eq("id", article.id)
        .single();

      const { error } = await supabase.from("articles").upsert(article, {
        onConflict: "id",
        ignoreDuplicates: false,
      });

      if (error) {
        console.error(`Error saving article ${article.id}:`, error.message);
      } else if (existing) {
        updated++;
      } else {
        inserted++;
      }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ Sync complete in ${elapsed}s: ${inserted} new, ${updated} updated, ${articles.length} total`);

    await supabase.from("sync_log").insert({
      status: "success",
      articles_fetched: articles.length,
      articles_inserted: inserted,
      articles_updated: updated,
      completed_at: new Date().toISOString(),
    });

  } catch (error) {
    console.error("❌ Sync Failed:", error.message);

    try {
      await supabase.from("sync_log").insert({
        status: "failed",
        error_message: error.message,
        completed_at: new Date().toISOString(),
      });
    } catch { /* ignore */ }

    process.exit(1);
  }
}

syncFacebookPosts();
