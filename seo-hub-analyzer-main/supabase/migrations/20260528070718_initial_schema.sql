-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Enums
CREATE TYPE subscription_tier AS ENUM ('FREE', 'PRO', 'SCALE');
CREATE TYPE org_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE scan_status AS ENUM ('queued', 'fetching', 'rendering', 'analyzing', 'completed', 'failed');

-- 1. Create public.users table (extends auth.users)
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  avatar_url text,
  subscription_tier subscription_tier DEFAULT 'FREE',
  credits int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trigger to auto-create public.users on sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Create subscriptions table
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan_type subscription_tier DEFAULT 'FREE',
  status text,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 3. Create organizations and members
CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  billing_status text,
  stripe_customer_id text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.organization_members (
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  role org_role DEFAULT 'member',
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (org_id, user_id)
);

-- 4. Create scanned_websites
CREATE TABLE public.scanned_websites (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  domain text UNIQUE NOT NULL,
  favicon_url text,
  tech_stack jsonb DEFAULT '{}'::jsonb,
  last_scanned_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 5. Create scan_jobs
CREATE TABLE public.scan_jobs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  url text NOT NULL,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  status scan_status DEFAULT 'queued',
  progress int DEFAULT 0,
  error_log text,
  created_at timestamptz DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz
);

-- 6. Create reports
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id uuid REFERENCES public.scanned_websites(id) ON DELETE CASCADE,
  job_id uuid REFERENCES public.scan_jobs(id) ON DELETE SET NULL,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  overall_score int,
  pdf_url text,
  is_public boolean DEFAULT false,
  share_token text UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- 7. Create report_data
CREATE TABLE public.report_data (
  report_id uuid PRIMARY KEY REFERENCES public.reports(id) ON DELETE CASCADE,
  technical_seo jsonb DEFAULT '{}'::jsonb,
  core_web_vitals jsonb DEFAULT '{}'::jsonb,
  accessibility jsonb DEFAULT '{}'::jsonb,
  content_analysis jsonb DEFAULT '{}'::jsonb,
  ai_visibility jsonb DEFAULT '{}'::jsonb,
  issues_summary jsonb DEFAULT '{}'::jsonb
);

-- 8. Create ai_prompts
CREATE TABLE public.ai_prompts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  report_id uuid REFERENCES public.reports(id) ON DELETE CASCADE,
  issue_id text,
  prompt text,
  response text,
  model_used text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scanned_websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_prompts ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Organizations
CREATE POLICY "Users can view their organizations"
  ON public.organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE org_id = public.organizations.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view org members"
  ON public.organization_members FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.org_id = public.organization_members.org_id AND om.user_id = auth.uid()
  ));

-- Scanned Websites
CREATE POLICY "Scanned websites are public to read"
  ON public.scanned_websites FOR SELECT
  USING (true);

-- Scan Jobs
CREATE POLICY "Users can view their own scan jobs"
  ON public.scan_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create scan jobs"
  ON public.scan_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Reports
CREATE POLICY "Users can view their own reports or public reports"
  ON public.reports FOR SELECT
  USING (
    auth.uid() = user_id 
    OR is_public = true 
    OR EXISTS (
      SELECT 1 FROM public.organization_members 
      WHERE org_id = public.reports.org_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own reports"
  ON public.reports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports"
  ON public.reports FOR DELETE
  USING (auth.uid() = user_id);

-- Report Data
CREATE POLICY "Users can view report data for accessible reports"
  ON public.report_data FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.reports r
      WHERE r.id = report_id AND (
        r.user_id = auth.uid() 
        OR r.is_public = true 
        OR EXISTS (
          SELECT 1 FROM public.organization_members om 
          WHERE om.org_id = r.org_id AND om.user_id = auth.uid()
        )
      )
    )
  );

-- AI Prompts
CREATE POLICY "Users can view their own prompts"
  ON public.ai_prompts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert prompts"
  ON public.ai_prompts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Realtime Setup
ALTER PUBLICATION supabase_realtime ADD TABLE public.scan_jobs;
