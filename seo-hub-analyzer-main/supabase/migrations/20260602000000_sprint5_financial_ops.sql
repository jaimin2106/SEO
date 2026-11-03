-- ============================================================
-- Migration: Sprint 5 Financial Operations
-- ============================================================

-- 1. Create `plans` table
CREATE TABLE IF NOT EXISTS public.plans (
  id text PRIMARY KEY, -- 'free', 'pro', 'scale'
  name text NOT NULL,
  stripe_product_id text,
  stripe_price_id text,
  price_monthly numeric NOT NULL DEFAULT 0,
  price_yearly numeric NOT NULL DEFAULT 0,
  credits_per_month int NOT NULL DEFAULT 5,
  features jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active plans"
  ON public.plans FOR SELECT
  USING (is_active = true OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage plans"
  ON public.plans FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Insert Default Plans
INSERT INTO public.plans (id, name, price_monthly, price_yearly, credits_per_month, features) VALUES
('free', 'Free', 0, 0, 5, '{"reports": 1, "pdf_access": false, "ai_features": false}'::jsonb),
('pro', 'Pro', 49, 490, 50, '{"reports": 50, "pdf_access": true, "ai_features": true}'::jsonb),
('scale', 'Scale', 199, 1990, 250, '{"reports": 500, "pdf_access": true, "ai_features": true, "priority": true, "white_label": true}'::jsonb)
ON CONFLICT (id) DO UPDATE SET 
  price_monthly = EXCLUDED.price_monthly,
  credits_per_month = EXCLUDED.credits_per_month;

-- 2. Create `subscriptions` table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  plan_id text REFERENCES public.plans(id) NOT NULL,
  stripe_customer_id text,
  stripe_subscription_id text UNIQUE,
  status text NOT NULL DEFAULT 'trialing', -- active, trialing, past_due, canceled, paused
  monthly_value numeric NOT NULL DEFAULT 0,
  billing_interval text DEFAULT 'month',
  current_period_start timestamptz DEFAULT now(),
  current_period_end timestamptz DEFAULT (now() + interval '14 days'),
  cancel_at_period_end boolean DEFAULT false,
  canceled_at timestamptz,
  trial_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage subscriptions"
  ON public.subscriptions FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 3. Create `promotions` table
CREATE TABLE IF NOT EXISTS public.promotions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code text UNIQUE NOT NULL,
  discount_type text NOT NULL, -- 'percentage', 'fixed', 'free_credits'
  discount_value numeric NOT NULL,
  max_uses int DEFAULT 100,
  current_uses int DEFAULT 0,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage promotions"
  ON public.promotions FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 4. Create `financial_audit_logs` table
CREATE TABLE IF NOT EXISTS public.financial_audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  target_user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  action text NOT NULL, -- e.g., 'grant_credits', 'issue_refund', 'cancel_subscription'
  amount numeric DEFAULT 0,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.financial_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read financial audit logs"
  ON public.financial_audit_logs FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert financial audit logs"
  ON public.financial_audit_logs FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

-- 5. Add actor columns to `credit_transactions` if missing
ALTER TABLE public.credit_transactions 
  ADD COLUMN IF NOT EXISTS admin_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS balance_after int;

-- 6. Trigger to log subscription updates
CREATE OR REPLACE FUNCTION public.log_subscription_changes()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscriptions_timestamp
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.log_subscription_changes();

-- 7. Analytics RPC Functions
CREATE OR REPLACE FUNCTION public.get_financial_metrics()
RETURNS jsonb AS $$
DECLARE
  v_mrr numeric;
  v_arr numeric;
  v_active_subs int;
  v_trials int;
  v_canceled int;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT COALESCE(SUM(monthly_value), 0) INTO v_mrr 
  FROM public.subscriptions 
  WHERE status = 'active';

  v_arr := v_mrr * 12;

  SELECT COUNT(*) INTO v_active_subs FROM public.subscriptions WHERE status = 'active';
  SELECT COUNT(*) INTO v_trials FROM public.subscriptions WHERE status = 'trialing';
  SELECT COUNT(*) INTO v_canceled FROM public.subscriptions WHERE status = 'canceled';

  RETURN jsonb_build_object(
    'mrr', v_mrr,
    'arr', v_arr,
    'active_subscribers', v_active_subs,
    'trial_users', v_trials,
    'canceled_subscribers', v_canceled
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_financial_metrics() TO authenticated;
