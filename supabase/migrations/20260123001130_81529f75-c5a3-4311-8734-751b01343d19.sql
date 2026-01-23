-- Step 1: Update existing data
UPDATE public.user_roles SET role = 'admin' WHERE role IN ('moderator', 'member');
UPDATE public.team_invitations SET role = 'admin' WHERE role IN ('moderator', 'member');

-- Step 2: Drop default constraint
ALTER TABLE public.team_invitations ALTER COLUMN role DROP DEFAULT;

-- Step 3: Drop dependent policies
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can create invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Admins can update invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Admins can delete invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Admins can create mail servers" ON public.mail_servers;
DROP POLICY IF EXISTS "Admins can update mail servers" ON public.mail_servers;
DROP POLICY IF EXISTS "Admins can delete mail servers" ON public.mail_servers;

-- Step 4: Drop dependent function
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

-- Step 5: Create new enum
CREATE TYPE public.app_role_new AS ENUM ('admin', 'viewer');

-- Step 6: Alter columns to use new enum
ALTER TABLE public.user_roles 
  ALTER COLUMN role TYPE public.app_role_new 
  USING role::text::public.app_role_new;

ALTER TABLE public.team_invitations 
  ALTER COLUMN role TYPE public.app_role_new 
  USING role::text::public.app_role_new;

-- Step 7: Set new default
ALTER TABLE public.team_invitations ALTER COLUMN role SET DEFAULT 'viewer'::public.app_role_new;

-- Step 8: Drop old enum and rename new
DROP TYPE public.app_role;
ALTER TYPE public.app_role_new RENAME TO app_role;

-- Step 9: Recreate has_role function with new enum
CREATE OR REPLACE FUNCTION public.has_role(_role public.app_role, _user_id uuid)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Step 10: Recreate policies using new enum
CREATE POLICY "Admins can insert roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role('admin'::public.app_role, auth.uid()));

CREATE POLICY "Admins can update roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.has_role('admin'::public.app_role, auth.uid()));

CREATE POLICY "Admins can delete roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.has_role('admin'::public.app_role, auth.uid()));

CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (public.has_role('admin'::public.app_role, auth.uid()));

CREATE POLICY "Admins can create invitations" ON public.team_invitations
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role('admin'::public.app_role, auth.uid()));

CREATE POLICY "Admins can update invitations" ON public.team_invitations
  FOR UPDATE TO authenticated
  USING (public.has_role('admin'::public.app_role, auth.uid()));

CREATE POLICY "Admins can delete invitations" ON public.team_invitations
  FOR DELETE TO authenticated
  USING (public.has_role('admin'::public.app_role, auth.uid()));

CREATE POLICY "Admins can create mail servers" ON public.mail_servers
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role('admin'::public.app_role, auth.uid()));

CREATE POLICY "Admins can update mail servers" ON public.mail_servers
  FOR UPDATE TO authenticated
  USING (public.has_role('admin'::public.app_role, auth.uid()));

CREATE POLICY "Admins can delete mail servers" ON public.mail_servers
  FOR DELETE TO authenticated
  USING (public.has_role('admin'::public.app_role, auth.uid()));

-- Step 11: Update can_write function
CREATE OR REPLACE FUNCTION public.can_write()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Step 12: Update handle_new_user to assign viewer by default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_profiles (user_id, full_name, status, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'active',
    NOW()
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'viewer');
  
  RETURN NEW;
END;
$function$;