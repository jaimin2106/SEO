-- 20260601000007_blog_admin_rls.sql
-- Add Admin RLS policies for Blog tables

-- Blogs
CREATE POLICY "Admins can manage blogs" ON blogs
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Authors
CREATE POLICY "Admins can manage authors" ON blog_authors
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Categories
CREATE POLICY "Admins can manage categories" ON blog_categories
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Tags
CREATE POLICY "Admins can manage tags" ON blog_tags
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Post Tags Join
CREATE POLICY "Admins can manage post tags" ON blog_post_tags
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
