-- ================================================================
-- Migration: Phase 5 Security Audit
-- Timestamp: 20260604000000
-- ================================================================
-- Fixes:
--   1. Define admin_roles + user_roles tables (required by AdminAuthContext)
--   2. Create public.is_admin(uuid) — used by ALL admin RPCs and RLS policies
--   3. Patch deduct_credit: prevent cross-user credit draining
--   4. Patch refill_credits_if_due: prevent cross-user forced refill
--   5. Patch credit_transactions INSERT policy: was WITH CHECK (true)
--   6. Create report_exports storage bucket as PRIVATE
--   7. Add per-user RLS on report_exports storage objects
--   8. Restrict scanned_websites to authenticated users (was publicly readable)
-- ================================================================


-- ----------------------------------------------------------------
-- FIX 1: Admin roles + user_roles tables
-- These are required by AdminAuthContext.fetchAdminRole().
-- We use IF NOT EXISTS so this is safe to apply to existing DBs.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_roles (
  id   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL  -- SUPER_ADMIN | ADMIN | SUPPORT | ANALYST | VIEWER
);

-- Seed the standard roles
INSERT INTO public.admin_roles (name) VALUES
  ('SUPER_ADMIN'), ('ADMIN'), ('SUPPORT'), ('ANALYST'), ('VIEWER')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id      uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role_id uuid REFERENCES public.admin_roles(id) ON DELETE CASCADE NOT NULL,
  UNIQUE (user_id, role_id)
);

-- ----------------------------------------------------------------
-- FIX 2: Create public.is_admin(uuid) — STABLE, SECURITY DEFINER
-- Checks if a given user has any recognized admin role.
-- Must be created BEFORE any other statement that calls it.
-- Using a STABLE sql function for performance (PostgreSQL will cache
-- the result for the duration of a single statement).
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.admin_roles ar ON ar.id = ur.role_id
    WHERE ur.user_id = p_user_id
      AND ar.name IN ('SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'ANALYST', 'VIEWER')
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO service_role;

-- RLS: role metadata is readable by signed-in users; role assignments
-- remain readable and writable only by existing admins.
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin roles are readable by authenticated users" ON public.admin_roles;
CREATE POLICY "Admin roles are readable by authenticated users"
  ON public.admin_roles FOR SELECT
  TO authenticated USING (true);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage user_roles" ON public.user_roles;
CREATE POLICY "Admins can manage user_roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

GRANT SELECT ON public.admin_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;


-- ----------------------------------------------------------------
-- FIX 3: Patch deduct_credit — prevent cross-user credit draining
-- VULNERABILITY: Any authenticated user could call deduct_credit
-- with another user's UUID and drain their credits.
-- FIX: Enforce auth.uid() = p_user_id at function entry.
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.deduct_credit(p_user_id uuid, p_reason text DEFAULT 'scan')
RETURNS jsonb AS $$
DECLARE
  v_remaining int;
BEGIN
  -- SECURITY: Only the authenticated user may deduct their own credits.
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  IF auth.uid() != p_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Access denied');
  END IF;

  -- Lock the row atomically
  SELECT credits_remaining INTO v_remaining
  FROM public.users
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_remaining IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  IF v_remaining <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient credits', 'credits_remaining', 0);
  END IF;

  -- Deduct atomically
  UPDATE public.users
  SET
    credits_remaining = credits_remaining - 1,
    credits           = credits - 1
  WHERE id = p_user_id;

  -- Audit trail
  INSERT INTO public.credit_transactions (user_id, delta, reason)
  VALUES (p_user_id, -1, p_reason);

  RETURN jsonb_build_object('success', true, 'credits_remaining', v_remaining - 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.deduct_credit(uuid, text) TO authenticated;


-- ----------------------------------------------------------------
-- FIX 4: Patch refill_credits_if_due — prevent forced refills
-- VULNERABILITY: Any authenticated user could call this with
-- another user's UUID and massively inflate their credit balance.
-- FIX: Enforce auth.uid() = p_user_id at function entry.
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.refill_credits_if_due(p_user_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_last_refill timestamptz;
  v_tier        text;
  v_new_credits int;
BEGIN
  -- SECURITY: Only the authenticated user may trigger their own refill.
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('refilled', false, 'error', 'Not authenticated');
  END IF;

  IF auth.uid() != p_user_id THEN
    RETURN jsonb_build_object('refilled', false, 'error', 'Access denied');
  END IF;

  SELECT last_credit_refill_at, tier INTO v_last_refill, v_tier
  FROM public.users WHERE id = p_user_id;

  -- Only refill if 30 days have passed
  IF v_last_refill IS NULL OR now() - v_last_refill >= INTERVAL '30 days' THEN
    v_new_credits := CASE
      WHEN v_tier = 'scale' THEN 100
      WHEN v_tier = 'pro'   THEN 50
      ELSE 5
    END;

    UPDATE public.users
    SET
      credits_remaining    = v_new_credits,
      credits              = v_new_credits,
      last_credit_refill_at = now()
    WHERE id = p_user_id;

    INSERT INTO public.credit_transactions (user_id, delta, reason)
    VALUES (p_user_id, v_new_credits, 'monthly_refill');

    RETURN jsonb_build_object('refilled', true, 'credits_remaining', v_new_credits);
  END IF;

  RETURN jsonb_build_object('refilled', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.refill_credits_if_due(uuid) TO authenticated;


-- ----------------------------------------------------------------
-- FIX 5: Restrict credit_transactions INSERT policy
-- VULNERABILITY: The policy was "WITH CHECK (true)" — any 
-- authenticated user could forge transaction records for anyone.
-- FIX: Restrict to own user_id. Service-role bypasses RLS anyway.
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can insert own transactions" ON public.credit_transactions;
DROP POLICY IF EXISTS "Service role can insert credit transactions"     ON public.credit_transactions;

-- Regular users may only insert their own transaction records.
-- (SECURITY DEFINER functions bypass RLS, so deduct_credit still works.)
CREATE POLICY "Users can insert own credit transactions"
  ON public.credit_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);


-- ----------------------------------------------------------------
-- FIX 6 + 7: Create report_exports bucket (PRIVATE) + per-user RLS
-- PDFs are private — users may only access their own exports.
-- The file naming convention enforces this: <user_id>/<job_id>.pdf
-- ----------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('report_exports', 'report_exports', false)
ON CONFLICT (id) DO UPDATE SET public = false;  -- Ensure it stays private

-- Remove any accidental public policies on this bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;  -- scoped check below via bucket_id

-- Authenticated users can upload their own PDFs
CREATE POLICY "Users can upload own PDF exports"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'report_exports'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can only download their own PDFs
CREATE POLICY "Users can download own PDF exports"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'report_exports'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admins can read all PDF exports
CREATE POLICY "Admins can read all PDF exports"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'report_exports'
    AND public.is_admin(auth.uid())
  );

-- Service role can manage all (for edge function uploads)
-- service_role bypasses RLS by default, no explicit policy needed.


-- ----------------------------------------------------------------
-- FIX 8: Restrict scanned_websites to authenticated users
-- VULNERABILITY: Currently USING (true) — fully public, unauthenticated
-- access to the entire domain/tech-stack database.
-- FIX: Require authentication for reads.
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "Scanned websites are public to read" ON public.scanned_websites;

CREATE POLICY "Authenticated users can read scanned websites"
  ON public.scanned_websites FOR SELECT
  TO authenticated
  USING (true);

-- Service role can upsert scanned websites (used by scan engine)
CREATE POLICY "Service role can manage scanned websites"
  ON public.scanned_websites FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ================================================================
-- All Phase 5 security patches applied.
-- ================================================================
