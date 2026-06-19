-- Migration: Create normalized articles table
-- Replaces the single-row JSONB facebook_cache with a proper relational table

CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  body TEXT,
  category TEXT NOT NULL DEFAULT 'OTHER',
  author_name TEXT,
  author_role TEXT,
  thumbnail TEXT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tags TEXT[] DEFAULT '{}',
  views INTEGER DEFAULT 0,
  is_breaking BOOLEAN DEFAULT FALSE,
  facebook_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_is_breaking ON articles(is_breaking) WHERE is_breaking = TRUE;
CREATE INDEX IF NOT EXISTS idx_articles_tags ON articles USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);

-- Enable Row Level Security
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for anon key)
CREATE POLICY "Allow public read access" ON articles
  FOR SELECT USING (true);

-- Allow service role full access (for sync.js and api functions)
CREATE POLICY "Allow service role all" ON articles
  USING (true)
  WITH CHECK (true);

-- Sync status tracking table
CREATE TABLE IF NOT EXISTS sync_log (
  id BIGSERIAL PRIMARY KEY,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  articles_fetched INTEGER DEFAULT 0,
  articles_inserted INTEGER DEFAULT 0,
  articles_updated INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'running',
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_sync_log_started_at ON sync_log(started_at DESC);
