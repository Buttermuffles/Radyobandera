import { describe, it, expect, vi, beforeEach } from "vitest";
import { getArticles, getArticleBySlug, getBreakingNews, getMostRead } from "../api";

vi.mock("../cache", () => ({
  getCache: vi.fn(() => null),
  getCacheStale: vi.fn(() => null),
  setCache: vi.fn(),
  persistCache: vi.fn(),
  hydrateCache: vi.fn(),
  clearCache: vi.fn(),
  clearStorageCache: vi.fn(),
  findInCache: vi.fn(() => null),
  hasCacheCookie: vi.fn(() => false),
  setCacheCookie: vi.fn(),
}));

const mockArticles = [
  {
    id: "123_1", slug: "breaking-news-surallah", title: "Breaking: Surallah Flood",
    excerpt: "Major flooding in Surallah", body: "<p>Full story</p>",
    category: "LOCAL", author_name: "Radyo Bandera", author_role: "Reporter",
    thumbnail: "", published_at: new Date().toISOString(),
    tags: ["Surallah", "Flood"], views: 100, is_breaking: true, facebook_url: "",
  },
  {
    id: "123_2", slug: "regional-news-koronadal", title: "Koronadal Festival",
    excerpt: "Festival in Koronadal", body: "<p>Full story</p>",
    category: "REGIONAL", author_name: "Radyo Bandera", author_role: "Reporter",
    thumbnail: "", published_at: new Date().toISOString(),
    tags: ["Koronadal", "Festival"], views: 50, is_breaking: false, facebook_url: "",
  },
  {
    id: "123_3", slug: "national-news-manila", title: "Manila Policy Change",
    excerpt: "New policy in Manila", body: "<p>Full story</p>",
    category: "NATIONAL", author_name: "Radyo Bandera", author_role: "Reporter",
    thumbnail: "", published_at: new Date().toISOString(),
    tags: ["Manila", "Policy"], views: 200, is_breaking: false, facebook_url: "",
  },
];

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ articles: mockArticles, total: 3, page: 1, hasMore: false }),
  }));
});

describe("getArticles", () => {
  it("returns articles", async () => {
    const { articles } = await getArticles({ limit: 5 });
    expect(Array.isArray(articles)).toBe(true);
    expect(articles.length).toBe(3);
  });

  it("filters by category", async () => {
    const local = mockArticles.filter((a) => a.category === "LOCAL");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ articles: local, total: local.length, page: 1, hasMore: false }),
    }));
    const { articles } = await getArticles({ category: "LOCAL", limit: 10 });
    expect(articles.length).toBeGreaterThan(0);
    articles.forEach((a) => expect(a.category).toBe("LOCAL"));
  });

  it("filters by search query", async () => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation(async (url: string) => {
      const q = url.includes("Surallah") ? "Surallah" : "";
      const filtered = mockArticles.filter((a) =>
        a.title.includes(q) || a.excerpt.includes(q) || a.tags.some((t) => t.includes(q))
      );
      return {
        ok: true,
        json: () => Promise.resolve({ articles: filtered, total: filtered.length, page: 1, hasMore: false }),
      };
    }));
    const { articles } = await getArticles({ search: "Surallah", limit: 10 });
    expect(articles.length).toBeGreaterThan(0);
    articles.forEach((a) => {
      const matches =
        a.title.toLowerCase().includes("surallah") ||
        a.excerpt.toLowerCase().includes("surallah") ||
        a.tags.some((t) => t.toLowerCase().includes("surallah"));
      expect(matches).toBe(true);
    });
  });

  it("returns empty for non-matching search", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ articles: [], total: 0, page: 1, hasMore: false }),
    }));
    const { articles } = await getArticles({ search: "xyznonexistent12345" });
    expect(articles).toHaveLength(0);
  });

  it("respects limit parameter", async () => {
    const { articles } = await getArticles({ limit: 3 });
    expect(articles.length).toBeLessThanOrEqual(3);
  });
});

describe("getArticleBySlug", () => {
  it("returns article by slug", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        articles: [mockArticles[0]], total: 1, page: 1, hasMore: false,
      }),
    }));
    const article = await getArticleBySlug("breaking-news-surallah");
    expect(article).toBeDefined();
    expect(article?.title).toContain("Surallah");
  });

  it("returns undefined for non-existent slug", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ articles: [], total: 0, page: 1, hasMore: false }),
    }));
    const article = await getArticleBySlug("non-existent-slug");
    expect(article).toBeUndefined();
  });
});

describe("getBreakingNews", () => {
  it("returns recent articles", async () => {
    const articles = await getBreakingNews();
    expect(articles.length).toBeGreaterThan(0);
  });
});

describe("getMostRead", () => {
  it("returns most read articles sorted by views", async () => {
    const articles = await getMostRead(24, 3);
    expect(articles.length).toBeLessThanOrEqual(3);
    for (let i = 1; i < articles.length; i++) {
      expect(articles[i - 1].views).toBeGreaterThanOrEqual(articles[i].views);
    }
  });
});
