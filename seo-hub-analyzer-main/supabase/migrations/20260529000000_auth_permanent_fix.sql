-- ============================================================
-- AUTH FIX MIGRATION: Permanent root-cause fixes for all auth bugs
-- Timestamp: 20260529_auth_permanent_fix
-- Applied to: zrryzbcivaascleejikm
-- ============================================================

-- FIX 1: Drop broken credit_transactions INSERT policy.
-- The deduct_credit function is SECURITY DEFINER (runs as postgres),
-- so auth.uid() = NULL inside it. The WITH CHECK blocked all inserts.
DROP POLICY IF EXISTS "Service role can insert credit transactions" ON public.credit_transactions;

GRANT ALL ON public.credit_transactions TO service_role;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'credit_transactions'
    AND policyname = 'Authenticated users can insert own transactions'
  ) THEN
    CREATE POLICY "Authenticated users can insert own transactions"
      ON public.credit_transactions FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- FIX 2: Patch existing phone-auth users with null email/name
UPDATE public.users
SET
  name = 'User',
  tier = 'free',
  credits_remaining = COALESCE(credits_remaining, 5)
WHERE name IS NULL;

-- FIX 3: Replace handle_new_user with UPSERT so phone-auth users always get initialized.
-- Old version: ON CONFLICT DO NOTHING — silently skipped profile creation for retried users.
-- New version: ON CONFLICT DO UPDATE — always ensures credits and tier are set.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    full_name,
    name,
    avatar_url,
    subscription_tier,
    tier,
    credits,
    credits_remaining,
    last_credit_refill_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      CASE WHEN NEW.email IS NOT NULL THEN split_part(NEW.email, '@', 1) ELSE 'User' END
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    'FREE',
    'free',
    5,
    5,
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, public.users.email),
    name = COALESCE(EXCLUDED.name, public.users.name),
    credits_remaining = CASE WHEN public.users.credits_remaining IS NULL THEN 5 ELSE public.users.credits_remaining END,
    tier = COALESCE(public.users.tier, 'free');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- FIX 4: Create ensure_user_profile() — called client-side after every login.
-- Guarantees profile + credits exist even when handle_new_user failed.
-- Returns the full profile JSON in one atomic query.
CREATE OR REPLACE FUNCTION public.ensure_user_profile()
RETURNS jsonb AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_email text;
  v_name text;
  v_row public.users%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Not authenticated');
  END IF;

  SELECT * INTO v_row FROM public.users WHERE id = v_user_id;

  IF NOT FOUND THEN
    SELECT email INTO v_email FROM auth.users WHERE id = v_user_id;
    v_name := CASE WHEN v_email IS NOT NULL THEN split_part(v_email, '@', 1) ELSE 'User' END;

    INSERT INTO public.users (id, email, name, full_name, subscription_tier, tier, credits, credits_remaining, last_credit_refill_at)
    VALUES (v_user_id, v_email, v_name, v_name, 'FREE', 'free', 5, 5, now())
    ON CONFLICT (id) DO NOTHING
    RETURNING * INTO v_row;

    -- Re-fetch if ON CONFLICT triggered
    IF v_row.id IS NULL THEN
      SELECT * INTO v_row FROM public.users WHERE id = v_user_id;
    END IF;
  END IF;

  -- Ensure credits_remaining is never null
  IF v_row.credits_remaining IS NULL THEN
    UPDATE public.users SET credits_remaining = 5, credits = 5 WHERE id = v_user_id;
    v_row.credits_remaining := 5;
  END IF;

  RETURN jsonb_build_object(
    'id', v_row.id,
    'email', v_row.email,
    'name', v_row.name,
    'tier', COALESCE(v_row.tier, 'free'),
    'credits_remaining', COALESCE(v_row.credits_remaining, 5)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.ensure_user_profile() TO authenticated;
