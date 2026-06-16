# 📰 News Portal — System Prompt README

A Filipino broadcast news web portal inspired by [DZRH News](https://www.dzrh.com.ph/), built with **React + TypeScript**, **Tailwind CSS**, and **shadcn/ui**.

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Styling | Tailwind CSS v3 |
| UI Components | shadcn/ui |
| State Management | React Context / Zustand (optional) |
| Routing | React Router v6 |
| Icons | Lucide React |
| Date Handling | date-fns |

---

## 🗂️ Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx          # Top nav: logo, nav links, date/weather badge
│   │   ├── Footer.tsx
│   │   └── LiveBar.tsx         # Bottom sticky: "WATCH LIVE" + "LISTEN LIVE"
│   ├── ui/                     # shadcn/ui primitives (auto-generated)
│   ├── news/
│   │   ├── HeroCarousel.tsx    # Featured story slideshow
│   │   ├── NewsCard.tsx        # Reusable article card
│   │   ├── SectionBlock.tsx    # Section header + card grid (NATION, ENTERTAINMENT…)
│   │   └── MostRead.tsx        # Numbered sidebar list
│   ├── media/
│   │   ├── LivePlayer.tsx      # Embedded video/audio stream player
│   │   └── AdBanner.tsx        # Top banner ad slot (e.g. PhilSec)
│   └── common/
│       ├── CategoryBadge.tsx   # NATION / WORLD pill labels
│       └── DateStamp.tsx       # Formatted publish date
├── pages/
│   ├── Home.tsx                # Main landing page
│   ├── Article.tsx             # Single article view
│   ├── Category.tsx            # Filtered news by section
│   └── Search.tsx              # Search results page
├── hooks/
│   ├── useBreakingNews.ts
│   └── useLiveStream.ts
├── lib/
│   ├── api.ts                  # News API calls (REST / CMS)
│   └── utils.ts                # shadcn cn() helper + formatters
├── types/
│   └── news.ts                 # Article, Category, Author interfaces
└── App.tsx
```

---

## 🎨 Design System

### Color Palette

```ts
// tailwind.config.ts
colors: {
  brand: {
    red:    '#CC0000',   // DZRH logo red / primary accent
    blue:   '#003087',   // Section header backgrounds
    yellow: '#FFD700',   // CTA buttons ("LISTEN LIVE", "WATCH LIVE")
    dark:   '#1A1A1A',   // Body text
    gray:   '#F4F4F4',   // Page background
    muted:  '#666666',   // Meta / timestamps
  }
}
```

### Typography

```ts
fontFamily: {
  heading: ['Montserrat', 'sans-serif'],   // Section headers, nav
  body:    ['Source Serif 4', 'serif'],    // Article body
  ui:      ['Inter', 'sans-serif'],        // Timestamps, badges, meta
}
```

---

## 📐 Page Layout — Home (`Home.tsx`)

```
┌──────────────────────────────────────────────────────┐
│ [AD BANNER]  PhilSec 2026 · Manila Marriott          │
├──────────────────────────────────────────────────────┤
│ LOGO │ NATION · ENTERTAINMENT · WORLD · SPORTS … │ 🔍 │
│                               [Date · Location · °C] │
├─────────────────────────┬────────────────────────────┤
│                         │                            │
│  DZRH NEWS              │   WATCH LIVE               │
│  [Hero Carousel]        │   [Embedded Stream Player] │
│  Headline / Date        │                            │
│                         ├────────────────────────────┤
├─────────────────────────┤   MOST READ                │
│  NATION section         │   1. Headline…             │
│  [Card Grid 2-col]      │   2. Headline…             │
├─────────────────────────┤   3. Headline…             │
│  ENTERTAINMENT section  │   4. Headline…             │
│  [Card Grid 2-col]      │                            │
└─────────────────────────┴────────────────────────────┘
│ [STICKY BOTTOM BAR] ▶ WATCH LIVE | ▶ LISTEN LIVE    │
└──────────────────────────────────────────────────────┘
```

---

## 🧩 Key Components

### `Header.tsx`
- Logo (left), horizontal nav links (center), weather/date badge + search icon (right)
- Nav categories: `NATION | ENTERTAINMENT | WORLD | SPORTS | LIFESTYLE | ASIA`
- Weather badge uses IP geolocation or a weather API
- Sticky on scroll

### `HeroCarousel.tsx`
- Full-width carousel with `<` `>` arrow controls
- Overlaid category badge (e.g. `NATION`) + headline + date
- Auto-advances every 6 seconds; pauses on hover
- Uses shadcn `Carousel` or `embla-carousel-react`

### `LivePlayer.tsx`
- Embedded `<video>` or `<iframe>` stream
- Play button overlay until user interaction
- Mute/volume control

### `LiveBar.tsx` *(sticky bottom)*
- Fixed to viewport bottom
- Left: `▶ WATCH LIVE` red pill + scrolling ticker text
- Right: volume slider + `▶ LISTEN LIVE` yellow button

### `MostRead.tsx`
- Numbered list (1–4+) in a dark sidebar card
- Pull from API sorted by `views` or `clicks` in last 24h

### `SectionBlock.tsx`
Props:
```ts
interface SectionBlockProps {
  title: string;          // "NATION", "ENTERTAINMENT"
  articles: Article[];
  columns?: 2 | 3 | 4;
  showMore?: boolean;
}
```

### `NewsCard.tsx`
```ts
interface NewsCardProps {
  article: Article;
  variant: 'hero' | 'grid' | 'list' | 'sidebar';
}
```

---

## 📡 Data / API

### Article Type
```ts
// types/news.ts
export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;            // HTML or Markdown
  category: Category;
  author: Author;
  thumbnail: string;       // URL
  publishedAt: string;     // ISO 8601
  tags: string[];
  views: number;
  isBreaking?: boolean;
  hasVideo?: boolean;
}

export type Category =
  | 'NATION'
  | 'ENTERTAINMENT'
  | 'WORLD'
  | 'SPORTS'
  | 'LIFESTYLE'
  | 'ASIA';
```

### Endpoints (example REST)
```
GET /api/articles?category=NATION&limit=6
GET /api/articles/most-read?hours=24&limit=4
GET /api/articles/:slug
GET /api/articles?search=query
GET /api/live-stream           → { videoUrl, audioUrl, isLive }
```

---

## 🔴 Live Stream

- Video stream: HLS (`.m3u8`) via `hls.js` or native `<video>`
- Audio stream: Icecast/Shoutcast MP3 via `<audio>`
- Stream status badge: `● LIVE` (red pulse) or `○ OFF AIR` (gray)

---

## 📱 Responsive Behavior

| Breakpoint | Layout |
|---|---|
| `sm` (< 640px) | Single column; hero full-width; nav collapses to hamburger |
| `md` (640–1024px) | 2-col grid; sidebar stacks below main content |
| `lg` (> 1024px) | 3-col layout: main content + sidebar + most-read |

---

## ♿ Accessibility

- All images: `alt` attributes with article title
- Keyboard-navigable carousel (arrow keys)
- `aria-live="polite"` on breaking news ticker
- Color contrast meets WCAG AA (especially red on white)
- Reduced motion: carousel auto-play disabled via `prefers-reduced-motion`

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

### shadcn/ui Setup
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add carousel card badge separator skeleton
```

---

## 📦 Recommended Packages

```json
{
  "dependencies": {
    "react": "^18",
    "react-router-dom": "^6",
    "embla-carousel-react": "^8",
    "hls.js": "^1",
    "date-fns": "^3",
    "lucide-react": "latest",
    "clsx": "^2",
    "tailwind-merge": "^2"
  }
}
```

---

## 📋 Development Checklist

- [ ] Header with sticky nav + weather badge
- [ ] Hero carousel with category overlay
- [ ] WATCH LIVE embedded player section
- [ ] MOST READ numbered sidebar
- [ ] NATION section card grid
- [ ] ENTERTAINMENT section card grid
- [ ] Sticky bottom live bar
- [ ] Ad banner slot (top)
- [ ] Article detail page
- [ ] Category filter pages
- [ ] Search page
- [ ] Mobile responsive layout
- [ ] Dark mode (optional)
- [ ] SEO meta tags (React Helmet or Vite plugin)
