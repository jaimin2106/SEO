-- Fix infinite recursion in organization_members SELECT policy
DROP POLICY IF EXISTS "Users can view org members" ON public.organization_members;

CREATE POLICY "Users can view org members"
  ON public.organization_members FOR SELECT
  USING (user_id = auth.uid());
