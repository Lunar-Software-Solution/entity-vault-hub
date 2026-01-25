-- Fix team_invitations RLS policies to use has_role() instead of can_write()
-- The can_write() function may be causing issues when accessing auth.users

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Admins can create invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Admins can update invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Admins can delete invitations" ON public.team_invitations;

-- Recreate policies using has_role() which is a SECURITY DEFINER function
CREATE POLICY "Admins can view all invitations" 
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