-- Final cleanup - remaining overly permissive RLS policies
-- The migration transaction failed partway through, so we need to fix remaining tables

-- ========== OPTION_GRANTS TABLE ==========
DROP POLICY IF EXISTS "Authenticated users can create option grants" ON public.option_grants;
DROP POLICY IF EXISTS "Authenticated users can delete option grants" ON public.option_grants;
DROP POLICY IF EXISTS "Authenticated users can update option grants" ON public.option_grants;
DROP POLICY IF EXISTS "Users with write access can create option_grants" ON public.option_grants;
DROP POLICY IF EXISTS "Users with write access can update option_grants" ON public.option_grants;
DROP POLICY IF EXISTS "Users with write access can delete option_grants" ON public.option_grants;

CREATE POLICY "Write access for option_grants insert" 
ON public.option_grants FOR INSERT TO authenticated
WITH CHECK (can_write());

CREATE POLICY "Write access for option_grants update" 
ON public.option_grants FOR UPDATE TO authenticated
USING (can_write());

CREATE POLICY "Write access for option_grants delete" 
ON public.option_grants FOR DELETE TO authenticated
USING (can_write());

-- ========== PHONE_NUMBERS TABLE ==========
DROP POLICY IF EXISTS "Authenticated users can create phone numbers" ON public.phone_numbers;
DROP POLICY IF EXISTS "Authenticated users can delete phone numbers" ON public.phone_numbers;
DROP POLICY IF EXISTS "Authenticated users can update phone numbers" ON public.phone_numbers;
DROP POLICY IF EXISTS "Authenticated users can view all phone numbers" ON public.phone_numbers;
DROP POLICY IF EXISTS "Users with write access can create phone_numbers" ON public.phone_numbers;
DROP POLICY IF EXISTS "Users with write access can update phone_numbers" ON public.phone_numbers;
DROP POLICY IF EXISTS "Users with write access can delete phone_numbers" ON public.phone_numbers;

CREATE POLICY "Write access for phone_numbers insert" 
ON public.phone_numbers FOR INSERT TO authenticated
WITH CHECK (can_write());

CREATE POLICY "Write access for phone_numbers update" 
ON public.phone_numbers FOR UPDATE TO authenticated
USING (can_write());

CREATE POLICY "Write access for phone_numbers delete" 
ON public.phone_numbers FOR DELETE TO authenticated
USING (can_write());

-- ========== REGISTRATION_AGENTS TABLE ==========
DROP POLICY IF EXISTS "Authenticated users can create registration agents" ON public.registration_agents;
DROP POLICY IF EXISTS "Authenticated users can delete registration agents" ON public.registration_agents;
DROP POLICY IF EXISTS "Authenticated users can update registration agents" ON public.registration_agents;
DROP POLICY IF EXISTS "Users with write access can create registration_agents" ON public.registration_agents;
DROP POLICY IF EXISTS "Users with write access can update registration_agents" ON public.registration_agents;
DROP POLICY IF EXISTS "Users with write access can delete registration_agents" ON public.registration_agents;

CREATE POLICY "Write access for registration_agents insert" 
ON public.registration_agents FOR INSERT TO authenticated
WITH CHECK (can_write());

CREATE POLICY "Write access for registration_agents update" 
ON public.registration_agents FOR UPDATE TO authenticated
USING (can_write());

CREATE POLICY "Write access for registration_agents delete" 
ON public.registration_agents FOR DELETE TO authenticated
USING (can_write());

-- ========== SHARE_CLASSES TABLE ==========
DROP POLICY IF EXISTS "Authenticated users can create share classes" ON public.share_classes;
DROP POLICY IF EXISTS "Authenticated users can delete share classes" ON public.share_classes;
DROP POLICY IF EXISTS "Authenticated users can update share classes" ON public.share_classes;
DROP POLICY IF EXISTS "Users with write access can create share_classes" ON public.share_classes;
DROP POLICY IF EXISTS "Users with write access can update share_classes" ON public.share_classes;
DROP POLICY IF EXISTS "Users with write access can delete share_classes" ON public.share_classes;

CREATE POLICY "Write access for share_classes insert" 
ON public.share_classes FOR INSERT TO authenticated
WITH CHECK (can_write());

CREATE POLICY "Write access for share_classes update" 
ON public.share_classes FOR UPDATE TO authenticated
USING (can_write());

CREATE POLICY "Write access for share_classes delete" 
ON public.share_classes FOR DELETE TO authenticated
USING (can_write());

-- ========== SOCIAL_MEDIA_ACCOUNTS TABLE ==========
DROP POLICY IF EXISTS "Authenticated users can create social accounts" ON public.social_media_accounts;
DROP POLICY IF EXISTS "Authenticated users can delete social accounts" ON public.social_media_accounts;
DROP POLICY IF EXISTS "Authenticated users can update social accounts" ON public.social_media_accounts;
DROP POLICY IF EXISTS "Authenticated users can view all social accounts" ON public.social_media_accounts;
DROP POLICY IF EXISTS "Users with write access can create social_media_accounts" ON public.social_media_accounts;
DROP POLICY IF EXISTS "Users with write access can update social_media_accounts" ON public.social_media_accounts;
DROP POLICY IF EXISTS "Users with write access can delete social_media_accounts" ON public.social_media_accounts;

CREATE POLICY "Write access for social_media_accounts insert" 
ON public.social_media_accounts FOR INSERT TO authenticated
WITH CHECK (can_write());

CREATE POLICY "Write access for social_media_accounts update" 
ON public.social_media_accounts FOR UPDATE TO authenticated
USING (can_write());

CREATE POLICY "Write access for social_media_accounts delete" 
ON public.social_media_accounts FOR DELETE TO authenticated
USING (can_write());

-- ========== TAX_ID_TYPES TABLE ==========
DROP POLICY IF EXISTS "Authenticated users can create tax id types" ON public.tax_id_types;
DROP POLICY IF EXISTS "Authenticated users can delete tax id types" ON public.tax_id_types;
DROP POLICY IF EXISTS "Authenticated users can update tax id types" ON public.tax_id_types;
DROP POLICY IF EXISTS "Users with write access can create tax_id_types" ON public.tax_id_types;
DROP POLICY IF EXISTS "Users with write access can update tax_id_types" ON public.tax_id_types;
DROP POLICY IF EXISTS "Users with write access can delete tax_id_types" ON public.tax_id_types;

CREATE POLICY "Write access for tax_id_types insert" 
ON public.tax_id_types FOR INSERT TO authenticated
WITH CHECK (can_write());

CREATE POLICY "Write access for tax_id_types update" 
ON public.tax_id_types FOR UPDATE TO authenticated
USING (can_write());

CREATE POLICY "Write access for tax_id_types delete" 
ON public.tax_id_types FOR DELETE TO authenticated
USING (can_write());

-- ========== TAX_IDS TABLE ==========
DROP POLICY IF EXISTS "Authenticated users can create tax ids" ON public.tax_ids;
DROP POLICY IF EXISTS "Authenticated users can delete tax ids" ON public.tax_ids;
DROP POLICY IF EXISTS "Authenticated users can update tax ids" ON public.tax_ids;
DROP POLICY IF EXISTS "Authenticated users can view all tax ids" ON public.tax_ids;
DROP POLICY IF EXISTS "Users with write access can create tax_ids" ON public.tax_ids;
DROP POLICY IF EXISTS "Users with write access can update tax_ids" ON public.tax_ids;
DROP POLICY IF EXISTS "Users with write access can delete tax_ids" ON public.tax_ids;

CREATE POLICY "Write access for tax_ids insert" 
ON public.tax_ids FOR INSERT TO authenticated
WITH CHECK (can_write());

CREATE POLICY "Write access for tax_ids update" 
ON public.tax_ids FOR UPDATE TO authenticated
USING (can_write());

CREATE POLICY "Write access for tax_ids delete" 
ON public.tax_ids FOR DELETE TO authenticated
USING (can_write());

-- ========== TEAM_INVITATIONS TABLE ==========
DROP POLICY IF EXISTS "Authenticated users can view invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Authenticated users can view their invitations" ON public.team_invitations;

-- Authenticated users can only view invitations sent to their email or if they're admin
CREATE POLICY "View own invitations or admin" 
ON public.team_invitations FOR SELECT TO authenticated
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR has_role('admin'::app_role, auth.uid())
);

-- ========== USER_PROFILES TABLE ==========
DROP POLICY IF EXISTS "Users can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Authenticated users can view user_profiles" ON public.user_profiles;

CREATE POLICY "View profiles for authenticated users" 
ON public.user_profiles FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL);

-- ========== USER_ROLES TABLE ==========
DROP POLICY IF EXISTS "Users can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Authenticated users can view user_roles" ON public.user_roles;

CREATE POLICY "View roles for authenticated users" 
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL);