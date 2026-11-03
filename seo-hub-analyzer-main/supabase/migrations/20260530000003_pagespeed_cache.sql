-- ============================================================
-- CACHE LAYER: pagespeed_cache
-- Stores Google PageSpeed Insights results by (url, strategy)
-- TTL enforced at application level (24h)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.pagespeed_cache (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  url         text        NOT NULL,
  strategy    text        NOT NULL CHECK (strategy IN ('mobile', 'desktop')),
  snapshot    jsonb       NOT NULL,
  created_at  timestamptz DEFAULT now()
);

-- Unique constraint: one cached result per URL + strategy combination
ALTER TABLE public.pagespeed_cache
  ADD CONSTRAINT pagespeed_cache_url_strategy_unique UNIQUE (url, strategy);

-- Index for fast URL-based lookups
CREATE INDEX IF NOT EXISTS idx_pagespeed_cache_url
  ON public.pagespeed_cache (url);

CREATE INDEX IF NOT EXISTS idx_pagespeed_cache_created_at
  ON public.pagespeed_cache (created_at DESC);

-- Enable RLS
ALTER TABLE public.pagespeed_cache ENABLE ROW LEVEL SECURITY;

-- Anyone can read the cache (performance data is not sensitive)
CREATE POLICY "Public read access to pagespeed_cache"
  ON public.pagespeed_cache FOR SELECT
  USING (true);

-- Authenticated users can insert cache entries
CREATE POLICY "Authenticated users can insert pagespeed_cache"
  ON public.pagespeed_cache FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated users can update cache entries (for upsert)
CREATE POLICY "Authenticated users can update pagespeed_cache"
  ON public.pagespeed_cache FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- ============================================================
-- CACHE LAYER: scan_result_cache
-- Stores full forensic report results by URL for domain-level
-- TTL deduplication to avoid re-scanning the same site within 24h
-- ============================================================

-- Add a cache_key column to scan_jobs for normalized URL matching
ALTER TABLE public.scan_jobs
  ADD COLUMN IF NOT EXISTS cache_key text GENERATED ALWAYS AS (
    lower(regexp_replace(url, '^https?://(www\.)?', '', 'i'))
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_scan_jobs_cache_key
  ON public.scan_jobs (cache_key);
