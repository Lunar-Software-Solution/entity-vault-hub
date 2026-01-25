-- Drop existing problematic policies on team_invitations
DROP POLICY IF EXISTS "Admins can view all invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Admins can manage invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Users can view invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Admins can insert invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Admins can update invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Admins can delete invitations" ON public.team_invitations;

-- Create proper RLS policies using the can_write() helper function
CREATE POLICY "Admins can view all invitations"
ON public.team_invitations
FOR SELECT
TO authenticated
USING (public.can_write());

CREATE POLICY "Admins can insert invitations"
ON public.team_invitations
FOR INSERT
TO authenticated
WITH CHECK (public.can_write());

CREATE POLICY "Admins can update invitations"
ON public.team_invitations
FOR UPDATE
TO authenticated
USING (public.can_write());

CREATE POLICY "Admins can delete invitations"
ON public.team_invitations
FOR DELETE
TO authenticated
USING (public.can_write());