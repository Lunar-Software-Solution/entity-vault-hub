-- Allow users to accept their own invitations (update status when email matches)
CREATE POLICY "Users can accept their own invitations"
ON public.team_invitations
FOR UPDATE
TO authenticated
USING (
  lower(email) = lower((SELECT email FROM auth.users WHERE id = auth.uid()))
)
WITH CHECK (
  lower(email) = lower((SELECT email FROM auth.users WHERE id = auth.uid()))
);

-- Allow users to update their own role (for invitation acceptance)
CREATE POLICY "Users can update their own role"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());