-- Fix RLS policy for support_tickets to allow anonymous users (guests) to submit tickets
-- The previous policy only allowed inserts if auth.uid() = user_id, which prevented guests from submitting.

DROP POLICY IF EXISTS "Users can create tickets" ON public.support_tickets;

CREATE POLICY "Anyone can create tickets"
  ON public.support_tickets FOR INSERT
  WITH CHECK (
    user_id = auth.uid() OR user_id IS NULL
  );

-- Add missing columns that the frontend expects to insert
ALTER TABLE public.support_tickets
  ADD COLUMN IF NOT EXISTS reporter_name text,
  ADD COLUMN IF NOT EXISTS reporter_email text,
  ADD COLUMN IF NOT EXISTS page_url text,
  ADD COLUMN IF NOT EXISTS browser_info text;

