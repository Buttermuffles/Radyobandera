/**
 * Facebook API Testing Utilities
 * Use these functions during development to test Facebook API integration
 */

import {
  getPagePosts,
  getPageInfo,
  searchPosts,
  getTrendingTopics,
} from "./facebook";

/**
 * Test Facebook API connectivity
 */
export async function testFacebookConnection(): Promise<{
  status: "connected" | "error";
  message: string;
  data?: any;
}> {
  // Single page ID used for all categories
  const pageId = import.meta.env.VITE_FACEBOOK_LOCAL_PAGE_ID;
  const token = import.meta.env.VITE_FACEBOOK_ACCESS_TOKEN;

  if (!token) {
    return {
      status: "error",
      message: "No Facebook access token configured. Check .env file.",
    };
  }

  if (!pageId) {
    return {
      status: "error",
      message: "No Facebook page ID configured. Check .env file.",
    };
  }

  try {
    const posts = await getPagePosts(pageId, 5);
    return {
      status: "connected",
      message: `Successfully fetched ${posts.length} posts`,
      data: posts,
    };
  } catch (error) {
    return {
      status: "error",
      message: `Connection error: ${error instanceof Error ? error.message : "Unknown error"}`,
      data: error,
    };
  }
}

/**
 * Test Facebook page info retrieval
 */
export async function testPageInfo(pageId: string) {
  try {
    const info = await getPageInfo(pageId);
    return {
      status: "success",
      data: info,
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Test Facebook search functionality
 */
export async function testSearch(query: string) {
  try {
    const results = await searchPosts(query, 10);
    return {
      status: "success",
      resultCount: results.length,
      data: results,
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Test trending topics extraction
 */
export async function testTrendingTopics() {
  try {
    const topics = await getTrendingTopics("PH", 10);
    return {
      status: "success",
      topics,
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Log all configuration values (for debugging)
 */
export function logConfiguration(): void {
  console.group("Facebook API Configuration");
  console.log("App ID:", import.meta.env.VITE_FACEBOOK_APP_ID ? "✓ Set" : "✗ Not set");
  console.log("Access Token:", import.meta.env.VITE_FACEBOOK_ACCESS_TOKEN ? "✓ Set" : "✗ Not set");
  console.log("API Enabled:", import.meta.env.VITE_USE_FACEBOOK_API);
  console.log("Graph API Version:", import.meta.env.VITE_FACEBOOK_GRAPH_API_VERSION);

  console.group("Page ID (single page, all categories)");
  console.log("Page ID:", import.meta.env.VITE_FACEBOOK_LOCAL_PAGE_ID || "Not configured");
  console.groupEnd();

  console.group("Hashtag Filters");
  console.log("Local:", `#${import.meta.env.VITE_FACEBOOK_LOCAL_HASHTAG || "Local"}`);
  console.log("Regional:", `#${import.meta.env.VITE_FACEBOOK_REGIONAL_HASHTAG || "Regional"}`);
  console.log("National:", `#${import.meta.env.VITE_FACEBOOK_NATIONAL_HASHTAG || "National"}`);
  console.groupEnd();

  console.groupEnd();
}

/**
 * Run all tests
 */
export async function runAllTests(): Promise<void> {
  console.clear();
  console.log("🧪 Running Facebook API Integration Tests...\n");

  logConfiguration();

  console.log("\n📊 Test 1: Connection Test");
  const connectionTest = await testFacebookConnection();
  console.log(connectionTest);

  console.log("\n📊 Test 2: Trending Topics");
  const trendingTest = await testTrendingTopics();
  console.log(trendingTest);

  console.log("\n✅ Tests complete!");
}

/**
 * Usage in browser console during development:
 * 
 * import { runAllTests, logConfiguration, testFacebookConnection } from './lib/facebook-test'
 * 
 * // Run all tests
 * runAllTests()
 * 
 * // Check configuration
 * logConfiguration()
 * 
 * // Test specific functionality
 * testFacebookConnection().then(console.log)
 */

export default {
  testFacebookConnection,
  testPageInfo,
  testSearch,
  testTrendingTopics,
  logConfiguration,
  runAllTests,
};
