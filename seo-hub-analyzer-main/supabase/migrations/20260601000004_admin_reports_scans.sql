-- 20260601000004_admin_reports_scans.sql
-- Sprint 4: Report Management, Scan Operations, PDF, and AI Intelligence

-- 1. Modify Reports Table
ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS pdf_size_bytes bigint DEFAULT 0,
ADD COLUMN IF NOT EXISTS pdf_generated_at timestamptz;

-- 2. Scan Dashboard Stats
CREATE OR REPLACE FUNCTION admin_get_scan_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_total bigint;
    v_queued bigint;
    v_running bigint;
    v_completed bigint;
    v_failed bigint;
    v_avg_duration_sec numeric;
BEGIN
    IF NOT public.is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    SELECT count(*) INTO v_total FROM public.scan_jobs;
    SELECT count(*) INTO v_queued FROM public.scan_jobs WHERE status = 'queued';
    SELECT count(*) INTO v_running FROM public.scan_jobs WHERE status = 'running';
    SELECT count(*) INTO v_completed FROM public.scan_jobs WHERE status = 'completed';
    SELECT count(*) INTO v_failed FROM public.scan_jobs WHERE status = 'failed';
    
    SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (completed_at - started_at))), 0) INTO v_avg_duration_sec
    FROM public.scan_jobs 
    WHERE status = 'completed' AND started_at IS NOT NULL AND completed_at IS NOT NULL;

    RETURN jsonb_build_object(
        'total', v_total,
        'queued', v_queued,
        'running', v_running,
        'completed', v_completed,
        'failed', v_failed,
        'avg_duration_sec', v_avg_duration_sec
    );
END;
$$;

-- 3. Get Scans (Paginated)
CREATE OR REPLACE FUNCTION admin_get_scans(
    p_limit integer default 50,
    p_offset integer default 0,
    p_status public.scan_status default null,
    p_user_id uuid default null,
    p_url text default null
)
RETURNS TABLE (
    id uuid,
    url text,
    user_id uuid,
    user_email text,
    status public.scan_status,
    progress int,
    error_log text,
    created_at timestamptz,
    started_at timestamptz,
    completed_at timestamptz,
    duration_sec numeric
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
        s.id,
        s.url,
        s.user_id,
        u.email,
        s.status,
        s.progress,
        s.error_log,
        s.created_at,
        s.started_at,
        s.completed_at,
        CASE 
            WHEN s.started_at IS NOT NULL AND s.completed_at IS NOT NULL THEN
                EXTRACT(EPOCH FROM (s.completed_at - s.started_at))
            ELSE null
        END as duration_sec
    FROM public.scan_jobs s
    JOIN public.users u ON u.id = s.user_id
    WHERE (p_status IS NULL OR s.status = p_status)
      AND (p_user_id IS NULL OR s.user_id = p_user_id)
      AND (p_url IS NULL OR s.url ILIKE '%' || p_url || '%')
    ORDER BY s.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- 4. Report Dashboard Stats
CREATE OR REPLACE FUNCTION admin_get_reports_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_total bigint;
    v_today bigint;
    v_shared bigint;
    v_with_pdf bigint;
    v_avg_score numeric;
    v_total_storage bigint;
BEGIN
    IF NOT public.is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    SELECT count(*) INTO v_total FROM public.reports;
    SELECT count(*) INTO v_today FROM public.reports WHERE created_at > (now() - interval '24 hours');
    SELECT count(*) INTO v_shared FROM public.reports WHERE is_public = true;
    SELECT count(*) INTO v_with_pdf FROM public.reports WHERE pdf_url IS NOT NULL;
    SELECT COALESCE(AVG(overall_score), 0) INTO v_avg_score FROM public.reports WHERE overall_score IS NOT NULL;
    SELECT COALESCE(SUM(pdf_size_bytes), 0) INTO v_total_storage FROM public.reports;

    RETURN jsonb_build_object(
        'total', v_total,
        'today', v_today,
        'shared', v_shared,
        'with_pdf', v_with_pdf,
        'avg_score', v_avg_score,
        'total_pdf_storage_bytes', v_total_storage
    );
END;
$$;

-- 5. Get Reports (Paginated)
CREATE OR REPLACE FUNCTION admin_get_reports(
    p_limit integer default 50,
    p_offset integer default 0,
    p_user_id uuid default null,
    p_domain text default null
)
RETURNS TABLE (
    id uuid,
    website_id uuid,
    domain text,
    job_id uuid,
    user_id uuid,
    user_email text,
    overall_score int,
    pdf_url text,
    pdf_size_bytes bigint,
    is_public boolean,
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
        r.id,
        r.website_id,
        w.domain,
        r.job_id,
        r.user_id,
        u.email,
        r.overall_score,
        r.pdf_url,
        r.pdf_size_bytes,
        r.is_public,
        r.created_at
    FROM public.reports r
    JOIN public.users u ON u.id = r.user_id
    JOIN public.scanned_websites w ON w.id = r.website_id
    WHERE (p_user_id IS NULL OR r.user_id = p_user_id)
      AND (p_domain IS NULL OR w.domain ILIKE '%' || p_domain || '%')
    ORDER BY r.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- 6. Get Report Details (Raw Metadata/Payload)
CREATE OR REPLACE FUNCTION admin_get_report_details(p_report_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_report jsonb;
    v_data jsonb;
BEGIN
    IF NOT public.is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    SELECT row_to_json(r)::jsonb INTO v_report
    FROM (
        SELECT r.*, w.domain, u.email as user_email
        FROM public.reports r
        JOIN public.scanned_websites w ON w.id = r.website_id
        JOIN public.users u ON u.id = r.user_id
        WHERE r.id = p_report_id
    ) r;

    IF v_report IS NULL THEN
        RETURN NULL;
    END IF;

    SELECT row_to_json(rd)::jsonb INTO v_data
    FROM public.report_data rd
    WHERE rd.report_id = p_report_id;

    RETURN v_report || jsonb_build_object('data', COALESCE(v_data, '{}'::jsonb));
END;
$$;

-- 7. Get AI Prompts (Paginated)
CREATE OR REPLACE FUNCTION admin_get_ai_prompts(
    p_limit integer default 50,
    p_offset integer default 0
)
RETURNS TABLE (
    id uuid,
    user_id uuid,
    user_email text,
    report_id uuid,
    domain text,
    issue_id text,
    prompt text,
    response text,
    model_used text,
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
        a.report_id,
        w.domain,
        a.issue_id,
        a.prompt,
        a.response,
        a.model_used,
        a.created_at
    FROM public.ai_prompts a
    JOIN public.users u ON u.id = a.user_id
    JOIN public.reports r ON r.id = a.report_id
    JOIN public.scanned_websites w ON w.id = r.website_id
    ORDER BY a.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- 8. Actions
CREATE OR REPLACE FUNCTION admin_retry_scan(p_scan_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT public.is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    UPDATE public.scan_jobs 
    SET status = 'queued', progress = 0, error_log = NULL, started_at = NULL, completed_at = NULL
    WHERE id = p_scan_id;
END;
$$;

CREATE OR REPLACE FUNCTION admin_expire_share_link(p_report_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT public.is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    UPDATE public.reports
    SET is_public = false, share_token = NULL
    WHERE id = p_report_id;
END;
$$;
