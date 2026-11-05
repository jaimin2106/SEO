BEGIN;

ALTER TABLE public.blogs
  ADD COLUMN IF NOT EXISTS scheduled_at timestamptz;

UPDATE public.blogs
SET published_at = COALESCE(published_at, created_at, now())
WHERE status = 'published' AND published_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_blogs_publication_order
  ON public.blogs (published_at DESC)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_blogs_scheduled_at
  ON public.blogs (scheduled_at)
  WHERE status = 'scheduled';

CREATE OR REPLACE FUNCTION public.set_blog_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_blog_updated_at ON public.blogs;
CREATE TRIGGER set_blog_updated_at
  BEFORE UPDATE ON public.blogs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_blog_updated_at();

CREATE OR REPLACE FUNCTION public.can_manage_blog_content(p_user_id uuid)
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
      AND ur.user_id = auth.uid()
      AND ar.name IN ('SUPER_ADMIN', 'ADMIN')
  );
$$;

REVOKE ALL ON FUNCTION public.can_manage_blog_content(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_manage_blog_content(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.admin_replace_blog_tags(p_blog_id uuid, p_tag_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.can_manage_blog_content(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.blogs WHERE id = p_blog_id) THEN
    RAISE EXCEPTION 'Article not found';
  END IF;
  IF EXISTS (
    SELECT 1
    FROM unnest(COALESCE(p_tag_ids, ARRAY[]::uuid[])) AS requested(tag_id)
    LEFT JOIN public.blog_tags tags ON tags.id = requested.tag_id
    WHERE tags.id IS NULL
  ) THEN
    RAISE EXCEPTION 'One or more selected tags do not exist';
  END IF;

  DELETE FROM public.blog_post_tags WHERE blog_id = p_blog_id;
  INSERT INTO public.blog_post_tags (blog_id, tag_id)
  SELECT p_blog_id, tag_id
  FROM (
    SELECT DISTINCT unnest(COALESCE(p_tag_ids, ARRAY[]::uuid[])) AS tag_id
  ) selected_tags;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_replace_blog_tags(uuid, uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_replace_blog_tags(uuid, uuid[]) TO authenticated, service_role;

DROP POLICY IF EXISTS "Admins can manage blogs" ON public.blogs;
DROP POLICY IF EXISTS "Blog editors can manage blogs" ON public.blogs;
CREATE POLICY "Blog editors can manage blogs"
  ON public.blogs FOR ALL TO authenticated
  USING (public.can_manage_blog_content(auth.uid()))
  WITH CHECK (public.can_manage_blog_content(auth.uid()));

CREATE OR REPLACE FUNCTION public.admin_get_blogs(
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0,
  p_status public.blog_status DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  title text,
  slug text,
  status public.blog_status,
  published_at timestamptz,
  category_name text,
  author_name text,
  views_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.can_manage_blog_content(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT
    b.id,
    b.title,
    b.slug,
    b.status,
    b.published_at,
    c.name,
    a.name,
    (SELECT count(*) FROM public.blog_views v WHERE v.blog_id = b.id)
  FROM public.blogs b
  LEFT JOIN public.blog_categories c ON c.id = b.category_id
  LEFT JOIN public.blog_authors a ON a.id = b.author_id
  WHERE p_status IS NULL OR b.status = p_status
  ORDER BY b.created_at DESC
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 50), 1), 100)
  OFFSET GREATEST(COALESCE(p_offset, 0), 0);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_blog_details(p_blog_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_blog jsonb;
BEGIN
  IF NOT public.can_manage_blog_content(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT row_to_json(b)::jsonb INTO v_blog
  FROM (
    SELECT
      blogs.*,
      (SELECT jsonb_agg(tag_id) FROM public.blog_post_tags WHERE blog_id = blogs.id) AS tags
    FROM public.blogs
    WHERE blogs.id = p_blog_id
  ) b;

  RETURN v_blog;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_get_blogs(integer, integer, public.blog_status) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_get_blog_details(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_get_blogs(integer, integer, public.blog_status) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_get_blog_details(uuid) TO authenticated, service_role;

DROP POLICY IF EXISTS "Public can read published blogs" ON public.blogs;
CREATE POLICY "Public can read published blogs"
  ON public.blogs FOR SELECT
  USING (status = 'published' AND published_at IS NOT NULL AND published_at <= now());

UPDATE storage.buckets
SET public = true,
    file_size_limit = 8388608,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
WHERE id = 'blog-images';

DROP POLICY IF EXISTS "Admin Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Access" ON storage.objects;
DROP POLICY IF EXISTS "Blog editors can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Blog editors can delete images" ON storage.objects;
DROP POLICY IF EXISTS "Public can read blog images" ON storage.objects;

CREATE POLICY "Blog editors can upload images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'blog-images'
    AND public.can_manage_blog_content(auth.uid())
  );

CREATE POLICY "Blog editors can delete images"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'blog-images'
    AND public.can_manage_blog_content(auth.uid())
  );

CREATE POLICY "Public can read blog images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-images');

COMMIT;