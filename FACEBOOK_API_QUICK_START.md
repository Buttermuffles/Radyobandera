# Facebook API Integration - Quick Start Guide

## What Has Been Implemented

✅ **Environment Configuration**
- `.env` and `.env.example` files with all required Facebook credentials
- Support for App ID, App Secret, Access Token, and Graph API version
- Per-category Facebook page IDs for news organization

✅ **Facebook API Module** (`src/lib/facebook.ts`)
- `getPagePosts()` - Fetch posts from Facebook pages
- `getPageInfo()` - Get page information
- `searchPosts()` - Search for posts by keywords
- `getTrendingTopics()` - Extract trending hashtags
- `convertPostToArticle()` - Convert Facebook posts to Article format
- `initializeFacebook()` - Initialize Facebook SDK

✅ **Enhanced News API** (`src/lib/api.ts`)
- Automatic fallback to mock data if Facebook API is unavailable
- Category-based news fetching from specific Facebook pages
- Search integration across Facebook posts
- Seamless integration with existing application

✅ **Testing Utilities** (`src/lib/facebook-test.ts`)
- Test Facebook API connectivity
- Verify configuration
- Debug API responses
- Run all tests from browser console

✅ **Documentation**
- Comprehensive setup guide (`FACEBOOK_API_SETUP.md`)
- This quick start guide
- Inline code comments and JSDoc documentation

## Quick Setup (5 Minutes)

### 1. Create Facebook App
```
Visit: https://developers.facebook.com/apps/
Click: Create App → Select Business
```

### 2. Get Credentials
- Copy **App ID** and **App Secret** from app dashboard
- Generate **Access Token** from Tools & Support → Access Token Tool

### 3. Find Page IDs
```
For each news category page:
1. Right-click page
2. Inspect → Search "pageID"
3. Copy the numeric ID
```

### 4. Update `.env` File
```env
VITE_FACEBOOK_APP_ID=your_app_id
VITE_FACEBOOK_APP_SECRET=your_app_secret
VITE_FACEBOOK_ACCESS_TOKEN=your_token
VITE_FACEBOOK_NATION_PAGE_ID=123456789
VITE_FACEBOOK_ENTERTAINMENT_PAGE_ID=234567890
# ... add other page IDs
VITE_USE_FACEBOOK_API=true
```

### 5. Test Integration
Open browser console and run:
```javascript
import { runAllTests } from './lib/facebook-test'
runAllTests()
```

## Files Modified/Created

### New Files:
- `.env` - Environment variables (add your credentials here)
- `.env.example` - Example environment template
- `src/lib/facebook.ts` - Facebook API integration module
- `src/lib/facebook-test.ts` - Testing and debugging utilities
- `FACEBOOK_API_SETUP.md` - Comprehensive setup documentation

### Modified Files:
- `src/lib/api.ts` - Added Facebook API support
- `src/main.tsx` - Initialize Facebook SDK on app start
- `vite.config.ts` - Configure environment variable loading
- `.gitignore` - Prevent committing .env files

## Usage Examples

### Fetch News from Facebook Category Page
```typescript
import { getArticles } from './lib/api'

const articles = await getArticles({
  category: 'NATION',
  limit: 10
})
```

### Search Across Facebook Posts
```typescript
const results = await getArticles({
  search: 'Philippine Economy',
  limit: 20
})
```

### Get Trending Topics
```typescript
import { getTrendingTopics } from './lib/facebook'

const trends = await getTrendingTopics('PH', 10)
console.log(trends) // ['#MarketUpdate', '#OFWNews', ...]
```

### Test API Connection
```typescript
import { testFacebookConnection } from './lib/facebook-test'

const result = await testFacebookConnection()
console.log(result)
// {
//   status: 'connected',
//   message: 'Successfully fetched 5 posts',
//   data: [...]
// }
```

## Configuration Options

| Variable | Required | Example | Purpose |
|----------|----------|---------|---------|
| `VITE_FACEBOOK_APP_ID` | ✅ | 123456789 | Your Facebook app ID |
| `VITE_FACEBOOK_APP_SECRET` | ✅ | abc123xyz | Your app secret |
| `VITE_FACEBOOK_ACCESS_TOKEN` | ✅ | EAAB123... | Long-lived access token |
| `VITE_FACEBOOK_GRAPH_API_VERSION` | ✅ | v19.0 | Facebook API version |
| `VITE_FACEBOOK_*_PAGE_ID` | ❌ | 987654321 | Page ID for each category |
| `VITE_USE_FACEBOOK_API` | ✅ | true/false | Enable/disable Facebook API |

## Features

🎯 **Smart Fallback**
- Uses real Facebook data when configured
- Automatically falls back to mock data if API fails
- No downtime even if API has issues

🔄 **Category Support**
- NATION, ENTERTAINMENT, WORLD, SPORTS
- LIFESTYLE, ASIA, BUSINESS, METRO, SCIENCE
- Each category can have its own Facebook page

🔍 **Search Integration**
- Search across Facebook posts
- Hashtag extraction
- Trending topic detection

📊 **Rich Metadata**
- Likes, shares, comments counts
- Author information
- Post timestamps
- Image attachments

## Development vs Production

### Development (using mock data)
```env
VITE_USE_FACEBOOK_API=false
```

### Production (using Facebook API)
```env
VITE_USE_FACEBOOK_API=true
VITE_FACEBOOK_APP_ID=your_production_app_id
VITE_FACEBOOK_ACCESS_TOKEN=your_production_token
```

## Troubleshooting

**"No posts returning"**
- Check Page ID is correct
- Verify access token permissions
- Ensure page has published posts
- Test with `testFacebookConnection()`

**"Invalid OAuth Token"**
- Token may be expired
- Generate new long-lived token
- Check token in Facebook debugger

**"Permission Denied"**
- Add necessary app roles
- Grant page read permissions
- Verify page belongs to your account

## Browser Console Testing

```javascript
// Load testing utilities
import { 
  logConfiguration, 
  testFacebookConnection,
  runAllTests 
} from '/src/lib/facebook-test'

// Check what's configured
logConfiguration()

// Test connection
testFacebookConnection().then(result => console.log(result))

// Run all tests
runAllTests()
```

## Next Steps

1. **Configure Credentials** → Update `.env` with your Facebook App credentials
2. **Add Page IDs** → Set up page IDs for each news category
3. **Test Connection** → Run tests from browser console
4. **Deploy** → Add environment variables to your hosting platform
5. **Monitor** → Check API rates and quota usage

## Support Resources

- [Facebook Graph API Docs](https://developers.facebook.com/docs/graph-api)
- [App Setup Guide](https://developers.facebook.com/docs/development/create-an-app)
- [Access Token Best Practices](https://developers.facebook.com/docs/facebook-login/access-tokens)
- [Rate Limiting](https://developers.facebook.com/docs/graph-api/overview/rate-limiting)
- [Token Debugger](https://developers.facebook.com/tools/debug/token/)

## Security Reminders

⚠️ **NEVER** commit `.env` to git
⚠️ **NEVER** share your App Secret
⚠️ **ALWAYS** use long-lived tokens in production
⚠️ **ROTATE** tokens regularly

---

For detailed setup instructions, see [FACEBOOK_API_SETUP.md](./FACEBOOK_API_SETUP.md)
