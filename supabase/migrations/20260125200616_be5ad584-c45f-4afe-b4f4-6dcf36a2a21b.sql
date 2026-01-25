-- Drop ALL existing policies on team_invitations
DROP POLICY IF EXISTS "Admins can create invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Admins can delete invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Admins can insert invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Admins can update invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Admins can view all invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Authenticated users can read their invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Users can accept their own invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "View own invitations or admin" ON public.team_invitations;
DROP POLICY IF EXISTS "Public can validate invitation tokens" ON public.team_invitations;

-- Create clean policies using ONLY has_role() - no direct auth.users access
CREATE POLICY "Admins can view invitations" 
ON public.team_invitations 
FOR SELECT 
TO authenticated 
USING (public.has_role('admin'::app_role, auth.uid()));

CREATE POLICY "Admins can create invitations" 
ON public.team_invitations 
FOR INSERT 
TO authenticated 
WITH CHECK (public.has_role('admin'::app_role, auth.uid()));

CREATE POLICY "Admins can update invitations" 
ON public.team_invitations 
FOR UPDATE 
TO authenticated 
USING (public.has_role('admin'::app_role, auth.uid()));

CREATE POLICY "Admins can delete invitations" 
ON public.team_invitations 
FOR DELETE 
TO authenticated 
USING (public.has_role('admin'::app_role, auth.uid()));