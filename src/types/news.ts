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
  | "ASIA"
  | "BUSINESS"
  | "METRO"
  | "SCIENCE";

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

export interface CurrentWeather {
  temp: number;
  feelsLike: number;
  humidity: number;
  description: string;
  icon: string;
  city: string;
}

export interface ForecastDay {
  day: string;
  high: number;
  low: number;
  icon: string;
  description: string;
}

export interface WeatherData {
  current: CurrentWeather;
  forecast: ForecastDay[];
}
