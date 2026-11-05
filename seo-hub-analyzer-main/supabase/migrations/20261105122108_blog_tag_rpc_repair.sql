BEGIN;

CREATE OR REPLACE FUNCTION public.admin_replace_blog_tags(
  p_blog_id uuid,
  p_tag_ids uuid[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.admin_roles ar ON ar.id = ur.role_id
    WHERE ur.user_id = auth.uid()
      AND ar.name IN ('SUPER_ADMIN', 'ADMIN')
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.blogs WHERE id = p_blog_id
  ) THEN
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
  SELECT p_blog_id, selected.tag_id
  FROM (
    SELECT DISTINCT unnest(COALESCE(p_tag_ids, ARRAY[]::uuid[])) AS tag_id
  ) AS selected;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_replace_blog_tags(uuid, uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_replace_blog_tags(uuid, uuid[]) TO authenticated, service_role;

NOTIFY pgrst, 'reload schema';

COMMIT;
