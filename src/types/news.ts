export interface Author {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

export type Category =
  | "NATION"
  | "ENTERTAINMENT"
  | "WORLD"
  | "SPORTS"
  | "LIFESTYLE"
  | "ASIA";

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: Category;
  author: Author;
  thumbnail: string;
  publishedAt: string;
  tags: string[];
  views: number;
  isBreaking?: boolean;
  hasVideo?: boolean;
}

export interface LiveStreamResponse {
  videoUrl: string;
  audioUrl: string;
  isLive: boolean;
}
