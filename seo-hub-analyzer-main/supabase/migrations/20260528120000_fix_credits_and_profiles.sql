-- ============================================================
-- Migration: Fix credits system, column naming, and realtime
-- Timestamp: 20260528120000
-- ============================================================

-- 1. Add `credits_remaining` as a real column (replaces `credits`)
--    We ADD a new column and sync it, keeping `credits` for backward compat.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS credits_remaining int DEFAULT 5,
  ADD COLUMN IF NOT EXISTS tier text DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS last_credit_refill_at timestamptz DEFAULT now();

-- 2. Back-fill existing rows from old columns
UPDATE public.users
SET
  credits_remaining = CASE WHEN credits IS NOT NULL THEN credits ELSE 5 END,
  tier = lower(subscription_tier::text),
  name = full_name;

-- 3. Keep tier + credits_remaining in sync via trigger when subscription_tier changes
CREATE OR REPLACE FUNCTION public.sync_user_tier()
RETURNS TRIGGER AS $$
BEGIN
  NEW.tier := lower(NEW.subscription_tier::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS sync_tier_on_update ON public.users;
CREATE TRIGGER sync_tier_on_update
  BEFORE UPDATE OF subscription_tier ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_tier();

-- 4. Update handle_new_user() to properly init all columns including 5 free credits
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
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    'FREE',
    'free',
    5,
    5,
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. Add credit_transactions table for audit trail + duplicate prevention
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  delta int NOT NULL,                    -- negative = deduction, positive = refill
  reason text,                           -- e.g. 'scan', 'monthly_refill', 'upgrade'
  scan_job_id uuid REFERENCES public.scan_jobs(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- RLS for credit_transactions
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credit transactions"
  ON public.credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert credit transactions"
  ON public.credit_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 6. Function to safely deduct a credit (atomic, prevents double-deduction)
CREATE OR REPLACE FUNCTION public.deduct_credit(p_user_id uuid, p_reason text DEFAULT 'scan')
RETURNS jsonb AS $$
DECLARE
  v_remaining int;
BEGIN
  -- Lock the row, check credits
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
    credits = credits - 1
  WHERE id = p_user_id;

  -- Record transaction
  INSERT INTO public.credit_transactions (user_id, delta, reason)
  VALUES (p_user_id, -1, p_reason);

  RETURN jsonb_build_object('success', true, 'credits_remaining', v_remaining - 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.deduct_credit(uuid, text) TO authenticated;

-- 7. Function for monthly credit refill check
CREATE OR REPLACE FUNCTION public.refill_credits_if_due(p_user_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_last_refill timestamptz;
  v_tier text;
  v_new_credits int;
BEGIN
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
      credits_remaining = v_new_credits,
      credits = v_new_credits,
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

-- 8. RLS: ensure authenticated users can read/update their own credits_remaining
-- (Policy already exists for SELECT/UPDATE on users table from initial schema)
-- Add INSERT policy for new users:
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile"
      ON public.users FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- 9. Enable realtime on users table so credit changes propagate instantly
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.credit_transactions;
