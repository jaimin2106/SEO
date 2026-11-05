BEGIN;

CREATE TABLE IF NOT EXISTS public.admin_roles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL
);

INSERT INTO public.admin_roles (name) VALUES
  ('SUPER_ADMIN'),
  ('ADMIN'),
  ('SUPPORT'),
  ('ANALYST'),
  ('VIEWER')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role_id uuid REFERENCES public.admin_roles(id) ON DELETE CASCADE NOT NULL,
  UNIQUE (user_id, role_id)
);

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

REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;

ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can read admin_roles" ON public.admin_roles;
DROP POLICY IF EXISTS "Admin roles are readable by authenticated users" ON public.admin_roles;
CREATE POLICY "Admins can read admin_roles"
  ON public.admin_roles FOR SELECT
  TO authenticated
  USING (true);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage user_roles" ON public.user_roles;
CREATE POLICY "Admins can manage user_roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

GRANT SELECT ON public.admin_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;

COMMIT;
