-- Down migration: Rollback the articles table and sync_log

DROP POLICY IF EXISTS "Allow public read access" ON articles;
DROP POLICY IF EXISTS "Allow service role all" ON articles;

DROP INDEX IF EXISTS idx_articles_category;
DROP INDEX IF EXISTS idx_articles_published_at;
DROP INDEX IF EXISTS idx_articles_is_breaking;
DROP INDEX IF EXISTS idx_articles_tags;
DROP INDEX IF EXISTS idx_articles_slug;
DROP INDEX IF EXISTS idx_sync_log_started_at;

DROP TABLE IF EXISTS articles;
DROP TABLE IF EXISTS sync_log;
