-- ================================================================
-- Migration: Sprint 7 Support Center & Platform Settings
-- ================================================================

-- ----------------------------------------------------------------
-- 1. SUPPORT TICKETS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid REFERENCES public.users(id) ON DELETE SET NULL,
  type        text NOT NULL DEFAULT 'general', -- billing, technical, seo_report, scan_failure, pdf_export, account, feature_request, bug_report, general
  status      text NOT NULL DEFAULT 'open',    -- open, pending, in_progress, resolved, closed
  priority    text NOT NULL DEFAULT 'normal',  -- low, normal, high, urgent
  subject     text NOT NULL,
  description text,
  assigned_admin_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  resolved_at timestamptz,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tickets"
  ON public.support_tickets FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Users can create tickets"
  ON public.support_tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage tickets"
  ON public.support_tickets FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_ticket_timestamp()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tickets_updated_at ON public.support_tickets;
CREATE TRIGGER tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_ticket_timestamp();

-- ----------------------------------------------------------------
-- 2. SUPPORT TICKET MESSAGES
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.support_ticket_messages (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id   uuid REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
  author_id   uuid REFERENCES public.users(id) ON DELETE SET NULL,
  is_admin    boolean DEFAULT false,
  content     text NOT NULL,
  note_type   text DEFAULT 'reply',  -- reply, internal_note, escalation_note, engineering_note
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.support_ticket_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ticket participants can read messages"
  ON public.support_ticket_messages FOR SELECT
  USING (
    public.is_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.support_tickets t
      WHERE t.id = ticket_id AND t.user_id = auth.uid()
      AND note_type = 'reply'
    )
  );

CREATE POLICY "Admins can manage messages"
  ON public.support_ticket_messages FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Users can add replies to own tickets"
  ON public.support_ticket_messages FOR INSERT
  WITH CHECK (
    auth.uid() = author_id AND note_type = 'reply' AND
    EXISTS (SELECT 1 FROM public.support_tickets t WHERE t.id = ticket_id AND t.user_id = auth.uid())
  );

-- ----------------------------------------------------------------
-- 3. PLATFORM SETTINGS (key/value store)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.platform_settings (
  key         text PRIMARY KEY,
  value       jsonb NOT NULL DEFAULT 'null'::jsonb,
  category    text NOT NULL DEFAULT 'general', -- general, seo_engine, scan_engine, ai, email, security, notifications
  label       text,
  description text,
  updated_at  timestamptz DEFAULT now(),
  updated_by  uuid REFERENCES public.users(id) ON DELETE SET NULL
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage platform settings"
  ON public.platform_settings FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Seed default platform settings
INSERT INTO public.platform_settings (key, value, category, label, description) VALUES

-- General
('platform_name',        '"SEO Hub"',           'general',    'Platform Name',       'The name shown across the UI'),
('platform_description', '"Enterprise SEO Analysis Platform"', 'general', 'Description', 'Short platform description'),
('support_email',        '"support@seohub.com"','general',    'Support Email',       'Default reply-to for all emails'),
('brand_color',          '"#c96442"',           'general',    'Brand Color',         'Primary accent color (hex)'),

-- SEO Engine
('seo_max_crawl_depth',       '3',      'seo_engine', 'Max Crawl Depth',        'Maximum page depth to crawl'),
('seo_max_pages_per_scan',    '100',    'seo_engine', 'Max Pages Per Scan',     'Page crawl limit per analysis'),
('seo_scan_timeout_secs',     '120',    'seo_engine', 'Scan Timeout (s)',       'Seconds before a scan times out'),
('seo_screenshot_capture',    'true',   'seo_engine', 'Screenshot Capture',     'Capture page screenshots'),
('seo_mobile_analysis',       'true',   'seo_engine', 'Mobile Analysis',        'Run mobile viewport analysis'),
('seo_desktop_analysis',      'true',   'seo_engine', 'Desktop Analysis',       'Run desktop viewport analysis'),
('seo_schema_analysis',       'true',   'seo_engine', 'Schema Analysis',        'Analyse structured data / JSON-LD'),
('seo_accessibility_analysis','true',   'seo_engine', 'Accessibility Analysis', 'Run WCAG accessibility checks'),
('seo_ai_visibility',         'true',   'seo_engine', 'AI Visibility Analysis', 'Check AI-search optimisation'),
('seo_keyword_analysis',      'true',   'seo_engine', 'Keyword Analysis',       'Extract and analyse keywords'),
('seo_competitor_analysis',   'false',  'seo_engine', 'Competitor Analysis',    'Compare against competitor pages'),

-- Scan Engine
('scan_concurrent_limit',     '5',      'scan_engine','Concurrent Scans',       'Max parallel scan jobs'),
('scan_queue_limit',          '50',     'scan_engine','Queue Limit',            'Max queued scans at once'),
('scan_retry_attempts',       '3',      'scan_engine','Retry Attempts',         'How many times to retry a failed scan'),
('scan_retry_delay_secs',     '10',     'scan_engine','Retry Delay (s)',        'Delay between retry attempts'),
('scan_cache_duration_hours', '24',     'scan_engine','Cache Duration (hr)',    'Hours to cache scan results'),
('scan_screenshot_quality',   '80',     'scan_engine','Screenshot Quality (%)', 'JPEG quality for screenshots'),
('scan_pdf_quality',          '90',     'scan_engine','PDF Quality (%)',        'PDF render quality'),
('scan_report_retention_days','90',     'scan_engine','Report Retention (days)','Days before old reports are pruned'),

-- AI
('ai_provider',               '"openai"',     'ai', 'Active Provider',    'openai | anthropic | google | deepseek'),
('ai_model',                  '"gpt-4o-mini"','ai', 'Primary Model',      'Model name for the active provider'),
('ai_fallback_model',         '"gpt-3.5-turbo"','ai','Fallback Model',   'Model to use if primary fails'),
('ai_temperature',            '0.7',          'ai', 'Temperature',        '0.0 = deterministic, 1.0 = creative'),
('ai_max_tokens',             '2000',         'ai', 'Max Tokens',         'Max output tokens per AI call'),
('ai_rate_limit_per_min',     '60',           'ai', 'Rate Limit (rpm)',   'Requests per minute cap'),

-- Security
('security_admin_session_timeout_mins', '480',   'security', 'Admin Session Timeout (min)', 'Admin session length in minutes'),
('security_user_session_timeout_mins',  '1440',  'security', 'User Session Timeout (min)',  'User session length in minutes'),
('security_require_2fa_admin',          'false', 'security', 'Require 2FA for Admins',     'Force 2FA on all admin accounts'),
('security_min_password_length',        '8',     'security', 'Min Password Length',         'Minimum characters for passwords')

ON CONFLICT (key) DO NOTHING;

-- ----------------------------------------------------------------
-- 4. FEATURE FLAGS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        text UNIQUE NOT NULL,
  label       text NOT NULL,
  description text,
  enabled     boolean DEFAULT false,
  target_plans jsonb DEFAULT '["free","pro","scale"]'::jsonb,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage feature flags"
  ON public.feature_flags FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Public read for feature checking by app
CREATE POLICY "All users can read feature flags"
  ON public.feature_flags FOR SELECT
  USING (true);

-- Seed default feature flags
INSERT INTO public.feature_flags (name, label, description, enabled, target_plans) VALUES
('blog_cms',            'Blog CMS',              'Admin blog creation and publishing system',       true,  '["pro","scale"]'),
('ai_visibility',       'AI Visibility Analysis','AI search engine visibility scoring',             true,  '["pro","scale"]'),
('deep_crawl',          'Deep Crawl',            'Crawl more than 50 pages per scan',               false, '["scale"]'),
('competitor_analysis', 'Competitor Analysis',   'Side-by-side competitor SEO comparison',          false, '["scale"]'),
('pdf_export',          'PDF Export',            'Download full reports as PDF',                    true,  '["pro","scale"]'),
('historical_tracking', 'Historical Tracking',   'Track SEO score changes over time',               false, '["scale"]'),
('team_workspaces',     'Team Workspaces',       'Multiple users per account',                      false, '["scale"]'),
('api_access',          'API Access',            'Programmatic access via REST API',                false, '["scale"]'),
('white_label',         'White Label',           'Remove SEO Hub branding from reports',            false, '["scale"]')
ON CONFLICT (name) DO NOTHING;
