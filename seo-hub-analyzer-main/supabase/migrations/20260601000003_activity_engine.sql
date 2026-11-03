-- 20260601000003_activity_engine.sql
-- Sprint 3: Activity Monitoring & User Behavior Tracking

-- 1. Create the activity logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    action text not null,
    resource_type text,
    resource_id text,
    metadata jsonb default '{}'::jsonb,
    ip_address text,
    country text,
    city text,
    device text,
    browser text,
    operating_system text,
    session_id text,
    success boolean default true,
    created_at timestamptz default now() not null
);

-- 2. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- 3. RLS Policies
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own activity logs"
    ON public.activity_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all activity logs"
    ON public.activity_logs FOR SELECT
    USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can read their own activity logs"
    ON public.activity_logs FOR SELECT
    USING (auth.uid() = user_id);

-- 4. Admin RPC: Get paginated activity feed
CREATE OR REPLACE FUNCTION admin_get_activity_feed(
    p_limit integer default 50,
    p_offset integer default 0,
    p_user_id uuid default null,
    p_action text default null
)
RETURNS TABLE (
    id uuid,
    user_id uuid,
    user_email text,
    user_name text,
    action text,
    resource_type text,
    resource_id text,
    metadata jsonb,
    success boolean,
    created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT public.is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    RETURN QUERY
    SELECT 
        a.id,
        a.user_id,
        u.email,
        u.full_name as user_name,
        a.action,
        a.resource_type,
        a.resource_id,
        a.metadata,
        a.success,
        a.created_at
    FROM public.activity_logs a
    JOIN public.users u ON u.id = a.user_id
    WHERE (p_user_id IS NULL OR a.user_id = p_user_id)
      AND (p_action IS NULL OR a.action ILIKE '%' || p_action || '%')
    ORDER BY a.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- 5. Admin RPC: Get Dashboard Stats
CREATE OR REPLACE FUNCTION admin_get_activity_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_total_today integer;
    v_active_users integer;
    v_logins_today integer;
    v_reports_today integer;
BEGIN
    IF NOT public.is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    -- Total actions today
    SELECT count(*) INTO v_total_today
    FROM public.activity_logs
    WHERE created_at > (now() - interval '24 hours');

    -- Unique active users today
    SELECT count(DISTINCT user_id) INTO v_active_users
    FROM public.activity_logs
    WHERE created_at > (now() - interval '24 hours');

    -- Logins today
    SELECT count(*) INTO v_logins_today
    FROM public.activity_logs
    WHERE action = 'LOGIN' AND created_at > (now() - interval '24 hours');

    -- Reports generated today
    SELECT count(*) INTO v_reports_today
    FROM public.reports
    WHERE created_at > (now() - interval '24 hours');

    RETURN jsonb_build_object(
        'total_actions_today', v_total_today,
        'active_users_today', v_active_users,
        'logins_today', v_logins_today,
        'reports_today', v_reports_today
    );
END;
$$;

-- Enable Realtime for activity_logs so admins get live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;
