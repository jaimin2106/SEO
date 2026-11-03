-- Migration for Admin Report Deletion and Scan Cancellation

-- 1. admin_delete_report
-- Hard deletes a report. Due to ON DELETE CASCADE on foreign keys, this should also clean up
-- report_sections, AI intel logs, etc., linked to this report.
CREATE OR REPLACE FUNCTION admin_delete_report(p_report_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_role TEXT;
BEGIN
  -- Verify admin role
  SELECT role INTO v_admin_role
  FROM admin_roles
  WHERE user_id = auth.uid()
  LIMIT 1;

  IF v_admin_role IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Requires admin privileges.';
  END IF;

  DELETE FROM reports
  WHERE id = p_report_id;
END;
$$;

-- 2. admin_cancel_scan
-- Cancels a queued or running scan job.
CREATE OR REPLACE FUNCTION admin_cancel_scan(p_scan_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_role TEXT;
  v_current_status TEXT;
BEGIN
  -- Verify admin role
  SELECT role INTO v_admin_role
  FROM admin_roles
  WHERE user_id = auth.uid()
  LIMIT 1;

  IF v_admin_role IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Requires admin privileges.';
  END IF;

  SELECT status INTO v_current_status
  FROM scan_jobs
  WHERE id = p_scan_id;

  IF v_current_status IN ('completed', 'failed', 'cancelled') THEN
    RAISE EXCEPTION 'Cannot cancel a scan that is already %.', v_current_status;
  END IF;

  UPDATE scan_jobs
  SET 
    status = 'cancelled',
    completed_at = NOW(),
    error_log = 'Cancelled by administrator'
  WHERE id = p_scan_id;
END;
$$;

-- Grant execution to authenticated users (RLS check is inside the function)
GRANT EXECUTE ON FUNCTION admin_delete_report(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_cancel_scan(UUID) TO authenticated;
