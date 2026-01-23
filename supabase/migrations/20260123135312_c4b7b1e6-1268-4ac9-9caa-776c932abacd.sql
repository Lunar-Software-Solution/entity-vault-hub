-- Allow unauthenticated users to read invitations by token
-- This is needed for the invitation acceptance flow before login
CREATE POLICY "Anyone can read invitations by token"
ON public.team_invitations
FOR SELECT
TO anon
USING (true);