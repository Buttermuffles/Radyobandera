import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// You will run this script via GitHub Actions or Node.js environment
// so it expects standard Node.js process.env variables, not Vite's import.meta.env
const FB_PAGE_ID = process.env.VITE_FACEBOOK_LOCAL_PAGE_ID;
const FB_TOKEN = process.env.VITE_FACEBOOK_ACCESS_TOKEN;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY; // Needs service role to bypass RLS and insert

if (!FB_PAGE_ID || !FB_TOKEN || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing required environment variables!");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function syncFacebookPosts() {
  console.log("Fetching Page Access Token...");
  try {
    // 1. Get Page Token
    const tokenUrl = `https://graph.facebook.com/v20.0/${FB_PAGE_ID}?fields=access_token&access_token=${FB_TOKEN}`;
    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      throw new Error(`Facebook Token Error: ${tokenData.error.message}`);
    }

    const pageToken = tokenData.access_token || FB_TOKEN;

    // 2. Fetch Posts
    console.log("Fetching Posts from Facebook...");
    const postsUrl = `https://graph.facebook.com/v20.0/${FB_PAGE_ID}/posts?fields=id,message,story,permalink_url,created_time,full_picture,picture,status_type,attachments{media_type,media,url}&access_token=${pageToken}&limit=60`;
    
    const postsRes = await fetch(postsUrl);
    const postsData = await postsRes.json();

    if (postsData.error) {
      throw new Error(`Facebook API Error: ${postsData.error.message}`);
    }

    const posts = postsData.data || [];
    console.log(`Successfully fetched ${posts.length} posts.`);

    // 3. Save to Supabase cache table
    console.log("Updating Supabase Cache...");
    
    // We store all the posts as a single JSON blob in row id=1
    const { error: dbError } = await supabase
      .from('facebook_cache')
      .upsert({ 
        id: 1, 
        data: posts,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (dbError) {
      throw new Error(`Supabase DB Error: ${dbError.message}`);
    }

    console.log("✅ Successfully synced Facebook posts to Supabase!");
  } catch (error) {
    console.error("❌ Sync Failed:", error);
    process.exit(1);
  }
}

syncFacebookPosts();
