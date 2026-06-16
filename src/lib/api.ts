import type { Article, Category, LiveStreamResponse } from "../types/news";

const fallbackImage =
  "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80";

const now = new Date();

const authors = [
  { id: "a1", name: "Rica Mendoza", role: "Senior Correspondent" },
  { id: "a2", name: "Marco Reyes", role: "Political Editor" },
  { id: "a3", name: "Jill Santos", role: "Entertainment Writer" },
  { id: "a4", name: "Nico Dela Cruz", role: "Sports Anchor" },
];

function hoursAgo(hours: number): string {
  return new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
}

const allArticles: Article[] = [
  {
    id: "1",
    slug: "senate-opens-flood-control-inquiry",
    title: "Senate opens flood-control inquiry after back-to-back storms",
    excerpt:
      "Lawmakers seek a full audit of delayed pump stations and drainage upgrades in Metro Manila.",
    body: "<p>The Senate public works committee opened hearings Monday to review stalled flood-control projects after two typhoons caused week-long disruptions.</p><p>Officials from DPWH and local government units were asked to submit updated procurement records and completion timelines.</p><p>Community leaders said repeated inundation has shuttered schools and displaced families in low-lying barangays.</p>",
    category: "NATION",
    author: authors[1],
    thumbnail:
      "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1200&q=80",
    publishedAt: hoursAgo(2),
    tags: ["policy", "climate", "metro manila"],
    views: 10234,
    isBreaking: true,
    hasVideo: true,
  },
  {
    id: "2",
    slug: "local-film-festival-breakout-hit",
    title: "Indie drama becomes breakout hit in local film festival",
    excerpt:
      "A first-time director wins critics over with a story set across three generations of OFW families.",
    body: "<p>The weekend premiere drew long queues in Quezon City and Cebu, with additional screenings added overnight.</p><p>Critics praised the film's grounded writing and nuanced performances, calling it one of the strongest local releases this year.</p>",
    category: "ENTERTAINMENT",
    author: authors[2],
    thumbnail:
      "https://images.unsplash.com/photo-1489599735734-79b4ee7f4f87?auto=format&fit=crop&w=1200&q=80",
    publishedAt: hoursAgo(5),
    tags: ["cinema", "culture"],
    views: 8240,
  },
  {
    id: "3",
    slug: "asean-trade-talks-priority-sectors",
    title: "ASEAN trade talks prioritize food security and digital standards",
    excerpt:
      "Negotiators are drafting common export safeguards for rice, corn, and cross-border logistics software.",
    body: "<p>Delegates from six member states proposed a shared compliance model for digital customs declarations.</p><p>Analysts say alignment could lower processing costs for small exporters within two years.</p>",
    category: "ASIA",
    author: authors[0],
    thumbnail:
      "https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?auto=format&fit=crop&w=1200&q=80",
    publishedAt: hoursAgo(10),
    tags: ["asean", "trade"],
    views: 6901,
  },
  {
    id: "4",
    slug: "gilas-prepares-for-qualifier",
    title: "Gilas finalizes roster ahead of regional qualifier",
    excerpt:
      "The coaching staff confirms a balanced lineup with stronger perimeter defense and faster rotations.",
    body: "<p>The national squad's final training block focuses on transition defense and late-clock execution.</p><p>Ticket sales for the opening game sold out in under six hours, organizers said.</p>",
    category: "SPORTS",
    author: authors[3],
    thumbnail:
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80",
    publishedAt: hoursAgo(7),
    tags: ["basketball", "national team"],
    views: 9655,
    hasVideo: true,
  },
  {
    id: "5",
    slug: "heritage-district-night-market",
    title: "Restored heritage district launches night market for local makers",
    excerpt:
      "The pilot program blends food stalls, live music, and artisan booths every Friday through August.",
    body: "<p>City officials expect the event to boost tourism and create temporary jobs for nearby communities.</p>",
    category: "LIFESTYLE",
    author: authors[0],
    thumbnail:
      "https://images.unsplash.com/photo-1481437156560-3205f6a55735?auto=format&fit=crop&w=1200&q=80",
    publishedAt: hoursAgo(14),
    tags: ["culture", "travel"],
    views: 4332,
  },
  {
    id: "6",
    slug: "peso-closes-stronger-on-export-data",
    title: "Peso closes stronger after upbeat export data",
    excerpt:
      "Traders cite resilient electronics shipments and easing fuel volatility in regional markets.",
    body: "<p>The local currency ended at its strongest level in three weeks as manufacturing orders improved.</p>",
    category: "WORLD",
    author: authors[1],
    thumbnail:
      "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80",
    publishedAt: hoursAgo(4),
    tags: ["economy", "currency"],
    views: 7780,
  },
  {
    id: "7",
    slug: "coastal-cleanup-draws-thousands",
    title: "Coastal cleanup drive draws thousands of student volunteers",
    excerpt:
      "Environmental groups call for permanent waste interception systems in river outlets.",
    body: "<p>Organizers collected more than 40 tons of mixed waste across six coastal zones in one day.</p>",
    category: "NATION",
    author: authors[0],
    thumbnail:
      "https://images.unsplash.com/photo-1618477462146-050d2767eac4?auto=format&fit=crop&w=1200&q=80",
    publishedAt: hoursAgo(20),
    tags: ["environment", "youth"],
    views: 5120,
  },
  {
    id: "8",
    slug: "comedy-series-returns-with-new-cast",
    title: "Popular comedy series returns with new cast lineup",
    excerpt:
      "Producers say the relaunch keeps the original format while adding younger story arcs.",
    body: "<p>The network announced a weekly primetime slot and a companion podcast for behind-the-scenes interviews.</p>",
    category: "ENTERTAINMENT",
    author: authors[2],
    thumbnail:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=80",
    publishedAt: hoursAgo(18),
    tags: ["tv", "streaming"],
    views: 6041,
  },
  {
    id: "9",
    slug: "regional-rail-expansion-begins",
    title: "Regional rail expansion begins in Central Luzon corridor",
    excerpt:
      "Transport authorities estimate travel time cuts of up to 35% once phase one is completed.",
    body: "<p>Construction starts this quarter with station upgrades and integrated bus terminals.</p>",
    category: "NATION",
    author: authors[1],
    thumbnail: fallbackImage,
    publishedAt: hoursAgo(26),
    tags: ["infrastructure", "transport"],
    views: 3480,
  },
  {
    id: "10",
    slug: "women-volleyball-league-finals",
    title: "Women’s volleyball league heads to sold-out finals week",
    excerpt:
      "Both finalists are entering with 10-match winning streaks after dominant semifinal runs.",
    body: "<p>Broadcast partners confirmed extended pre-game coverage and post-match analysis panels.</p>",
    category: "SPORTS",
    author: authors[3],
    thumbnail:
      "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1200&q=80",
    publishedAt: hoursAgo(22),
    tags: ["volleyball", "women in sports"],
    views: 8872,
  },
];

function delay<T>(data: T): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(data), 220);
  });
}

export async function getArticles(params?: {
  category?: Category;
  limit?: number;
  search?: string;
}): Promise<Article[]> {
  let result = [...allArticles].sort(
    (a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt),
  );

  if (params?.category) {
    result = result.filter((article) => article.category === params.category);
  }

  if (params?.search) {
    const query = params.search.toLowerCase();
    result = result.filter((article) => {
      return (
        article.title.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query) ||
        article.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    });
  }

  if (params?.limit) {
    result = result.slice(0, params.limit);
  }

  return delay(result);
}

export async function getMostRead(hours = 24, limit = 4): Promise<Article[]> {
  const cutoff = Date.now() - hours * 60 * 60 * 1000;
  const articles = allArticles
    .filter((article) => +new Date(article.publishedAt) >= cutoff)
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);

  return delay(articles);
}

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  const article = allArticles.find((item) => item.slug === slug);
  return delay(article);
}

export async function getBreakingNews(): Promise<Article[]> {
  return delay(allArticles.filter((article) => article.isBreaking));
}

export async function getLiveStream(): Promise<LiveStreamResponse> {
  return delay({
    videoUrl:
      "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    audioUrl:
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    isLive: true,
  });
}
