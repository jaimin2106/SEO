BEGIN;

ALTER TABLE public.blogs
  ADD COLUMN IF NOT EXISTS scheduled_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_blogs_scheduled_at
  ON public.blogs (scheduled_at)
  WHERE status = 'scheduled';

NOTIFY pgrst, 'reload schema';

COMMIT;
