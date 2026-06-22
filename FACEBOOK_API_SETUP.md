# Facebook API Integration Setup Guide

This guide will help you configure your AppleCider news application with Facebook Graph API for real-time news aggregation.

## Prerequisites

- Facebook Business Account
- Facebook App (create at https://developers.facebook.com/apps/)
- Access to your news organization's Facebook pages
- Basic understanding of Facebook's Graph API

## Step 1: Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/apps/)
2. Click "Create App"
3. Choose "Business" as the app type
4. Fill in the app details:
   - **App Name**: AppleCider News
   - **App Contact Email**: your-email@example.com
   - **App Purpose**: News & Media

5. Once created, you'll get your **App ID** and **App Secret**
   - Store these safely in your `.env` file

## Step 2: Get Your Access Token

### Option A: Using Access Token Tool (Recommended for Development)

1. In your Facebook App Dashboard, go to **Tools & Support** → **Access Token Tool**
2. Select your app from the dropdown
3. Copy the **User Access Token** (this is temporary for development)
4. To make it permanent for production:
   - Go to **Settings** → **Basic**
   - Copy your **App ID** and **App Secret**

### Option B: Generate Long-Lived Token (Recommended for Production)

```bash
# Use Facebook's Graph API Explorer
# URL: https://developers.facebook.com/tools/explorer/
# 1. Select your app
# 2. Select "Get User Access Token"
# 3. Grant necessary permissions
# 4. Copy the token
```

## Step 3: Find Your Facebook Page IDs

For each news category page, get the Page ID:

### Method 1: Inspect Element
1. Visit your Facebook page
2. Right-click anywhere on the page
3. Select "Inspect" or "Inspect Element"
4. Search for `"pageID"` in the HTML
5. Copy the numeric ID

### Method 2: Use Online Tools
- Visit [findmyfbid.com](https://findmyfbid.com/)
- Enter your page URL
- Get your Page ID

### Method 3: Via Graph API
```
https://graph.facebook.com/v19.0/YOUR_PAGE_NAME?access_token=YOUR_TOKEN
```

### Example Page IDs (Philippine News Context):
```
- Nation News: 123456789
- Entertainment: 234567890
- Sports: 345678901
- Business: 456789012
- Lifestyle: 567890123
- Metro Manila: 678901234
```

## Step 4: Set Up Environment Variables

1. Open `.env` file in your project root
2. Fill in your credentials:

```env
# Facebook App Credentials
VITE_FACEBOOK_APP_ID=your_app_id_here
VITE_FACEBOOK_APP_SECRET=your_app_secret_here
VITE_FACEBOOK_GRAPH_API_VERSION=v19.0
VITE_FACEBOOK_ACCESS_TOKEN=your_long_lived_token_here

# Facebook Page IDs for Each Category
VITE_FACEBOOK_NATION_PAGE_ID=your_nation_page_id
VITE_FACEBOOK_ENTERTAINMENT_PAGE_ID=your_entertainment_page_id
VITE_FACEBOOK_WORLD_PAGE_ID=your_world_page_id
VITE_FACEBOOK_SPORTS_PAGE_ID=your_sports_page_id
VITE_FACEBOOK_LIFESTYLE_PAGE_ID=your_lifestyle_page_id
VITE_FACEBOOK_ASIA_PAGE_ID=your_asia_page_id
VITE_FACEBOOK_BUSINESS_PAGE_ID=your_business_page_id
VITE_FACEBOOK_METRO_PAGE_ID=your_metro_page_id
VITE_FACEBOOK_SCIENCE_PAGE_ID=your_science_page_id

# API Settings
VITE_API_BASE_URL=https://graph.facebook.com
VITE_USE_FACEBOOK_API=true
```

## Step 5: Configure App Permissions

In your Facebook App Settings, ensure you have these permissions:

### Required Permissions:
- ✅ `pages_read_content` - Read page content
- ✅ `pages_read_engagement` - Read page engagement metrics
- ✅ `pages_read_posts` - Read page posts
- ✅ `public_content_read` - Read public content
- ✅ `instagram_basic` - (Optional) For Instagram integration

### How to Add Permissions:
1. Go to your Facebook App Dashboard
2. Select **Settings** → **Basic**
3. Scroll to **App Roles**
4. Add your account as a **Tester** or **Admin**
5. In **App Roles** → **Roles**, assign yourself the **Admin** role

## Step 6: Test the Integration

### Test in Development:
```bash
npm run dev
```

Open your browser console and check for:
- Facebook SDK initialization messages
- API call logs
- Any error messages

### Debug API Calls:
- Open **Network** tab in DevTools
- Filter for "graph.facebook.com" requests
- Check request/response data

## Step 7: Switch Between Mock and Real Data

To toggle between Facebook API and mock data:

```env
# Use real Facebook data
VITE_USE_FACEBOOK_API=true

# Use mock data for development
VITE_USE_FACEBOOK_API=false
```

## Features Enabled

✅ **Category-based News Fetching** - Pulls posts from category-specific Facebook pages
✅ **Search Integration** - Search across Facebook posts
✅ **Trending Topics** - Extract hashtags and trending content
✅ **Post to Article Conversion** - Auto-converts Facebook posts to article format
✅ **Engagement Metrics** - Shows likes, shares, and comments
✅ **Fallback to Mock Data** - If API fails, uses built-in mock articles

## API Functions

### In `src/lib/facebook.ts`:

```typescript
// Get posts from a specific page
getPagePosts(pageId: string, limit?: number)

// Get page information
getPageInfo(pageId: string)

// Convert Facebook post to Article
convertPostToArticle(post, category, author)

// Search public posts
searchPosts(query: string, limit?: number)

// Get trending topics
getTrendingTopics(country?: string, limit?: number)

// Initialize Facebook SDK
initializeFacebook()
```

## Troubleshooting

### Error: "Invalid OAuth Token"
- ✅ Check token expiration
- ✅ Generate a new long-lived token
- ✅ Verify APP_ID and APP_SECRET match

### Error: "Permission Denied"
- ✅ Add necessary app roles and permissions
- ✅ Make sure page access token has read permissions
- ✅ Verify page belongs to your account

### No Posts Returning
- ✅ Verify Page ID is correct
- ✅ Check access token permissions
- ✅ Ensure page has published posts
- ✅ Check token hasn't expired

### Images Not Loading
- ✅ Facebook may require SSL for image proxying
- ✅ Use HTTPS in production
- ✅ Check image URL in API response

## Production Deployment

### For Vercel:
1. Add environment variables in Vercel Dashboard
2. Go to **Project Settings** → **Environment Variables**
3. Add all `VITE_FACEBOOK_*` variables
4. Redeploy your project

### For Other Platforms:
1. Ensure all `VITE_*` variables are set at build time
2. Create a `.env.production` file (never commit to git)
3. Use platform-specific secret management

## Security Best Practices

⚠️ **DO NOT commit `.env` file to git!**

1. Add to `.gitignore`:
   ```
   .env
   .env.local
   .env.*.local
   ```

2. Use different tokens for:
   - Development (short-lived)
   - Staging (medium-lived)
   - Production (long-lived, rotated regularly)

3. Rotate your access tokens regularly

4. Use Facebook's Token Debugger to check token validity:
   - https://developers.facebook.com/tools/debug/token/

## Additional Resources

- [Facebook Graph API Docs](https://developers.facebook.com/docs/graph-api)
- [Page Reference](https://developers.facebook.com/docs/graph-api/reference/page/)
- [Access Token Best Practices](https://developers.facebook.com/docs/facebook-login/access-tokens)
- [Rate Limiting](https://developers.facebook.com/docs/graph-api/overview/rate-limiting)

## Support

For issues with:
- **Facebook API**: Check [Facebook Developers](https://developers.facebook.com/)
- **App Configuration**: Check Facebook App Dashboard
- **Code Issues**: Review [src/lib/facebook.ts](../lib/facebook.ts)
Every 2 paragraph or depends in the sentence structure of the news

plus add this in the different pages of the local, Regional, and National, and General make the header section dont make it skeleton loading