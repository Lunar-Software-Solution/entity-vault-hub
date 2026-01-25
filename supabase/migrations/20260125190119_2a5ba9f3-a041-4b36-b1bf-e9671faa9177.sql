-- Drop the existing overly permissive SELECT policy
DROP POLICY IF EXISTS "View profiles for authenticated users" ON public.user_profiles;

-- Create new SELECT policy that allows users to view only their own profile
CREATE POLICY "Users can view own profile"
ON public.user_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Create policy for admins to view all profiles (needed for user management)
CREATE POLICY "Admins can view all profiles"
ON public.user_profiles
FOR SELECT
USING (has_role('admin'::app_role, auth.uid()));