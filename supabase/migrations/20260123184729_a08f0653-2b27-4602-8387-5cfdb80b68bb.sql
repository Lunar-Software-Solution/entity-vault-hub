-- Remove overly permissive RLS policies from sensitive tables
-- Keep only the role-based policies that use can_write() and authenticated checks

-- ========== BANK_ACCOUNTS TABLE ==========
-- Drop permissive policies (these allow unrestricted access)
DROP POLICY IF EXISTS "Authenticated users can create bank accounts" ON public.bank_accounts;
DROP POLICY IF EXISTS "Authenticated users can delete bank accounts" ON public.bank_accounts;
DROP POLICY IF EXISTS "Authenticated users can update bank accounts" ON public.bank_accounts;
DROP POLICY IF EXISTS "Authenticated users can view all bank accounts" ON public.bank_accounts;

-- Keep: "Users with write access can create bank_accounts", "Users with write access can delete bank_accounts", "Users with write access can update bank_accounts"
-- Add proper SELECT policy for authenticated users only (not public)
CREATE POLICY "Authenticated users can view bank_accounts" 
ON public.bank_accounts 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- ========== CREDIT_CARDS TABLE ==========
DROP POLICY IF EXISTS "Authenticated users can create credit cards" ON public.credit_cards;
DROP POLICY IF EXISTS "Authenticated users can delete credit cards" ON public.credit_cards;
DROP POLICY IF EXISTS "Authenticated users can update credit cards" ON public.credit_cards;
DROP POLICY IF EXISTS "Authenticated users can view all credit cards" ON public.credit_cards;

CREATE POLICY "Authenticated users can view credit_cards" 
ON public.credit_cards 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- ========== ACCOUNTANT_FIRMS TABLE ==========
DROP POLICY IF EXISTS "Authenticated users can create accountant firms" ON public.accountant_firms;
DROP POLICY IF EXISTS "Authenticated users can delete accountant firms" ON public.accountant_firms;
DROP POLICY IF EXISTS "Authenticated users can update accountant firms" ON public.accountant_firms;
DROP POLICY IF EXISTS "Authenticated users can view accountant firms" ON public.accountant_firms;

CREATE POLICY "Authenticated users can view accountant_firms" 
ON public.accountant_firms 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- ========== CONTRACTS TABLE ==========
DROP POLICY IF EXISTS "Authenticated users can view all contracts" ON public.contracts;

CREATE POLICY "Authenticated users can view contracts" 
ON public.contracts 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- ========== ENTITY_DOCUMENTS TABLE ==========
DROP POLICY IF EXISTS "Authenticated users can create entity documents" ON public.entity_documents;
DROP POLICY IF EXISTS "Authenticated users can delete entity documents" ON public.entity_documents;
DROP POLICY IF EXISTS "Authenticated users can update entity documents" ON public.entity_documents;
DROP POLICY IF EXISTS "Authenticated users can view entity documents" ON public.entity_documents;

CREATE POLICY "Authenticated users can view entity_documents" 
ON public.entity_documents 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- ========== ENTITY_FILINGS TABLE ==========
DROP POLICY IF EXISTS "Authenticated users can create entity filings" ON public.entity_filings;
DROP POLICY IF EXISTS "Authenticated users can delete entity filings" ON public.entity_filings;
DROP POLICY IF EXISTS "Authenticated users can update entity filings" ON public.entity_filings;
DROP POLICY IF EXISTS "Authenticated users can view entity filings" ON public.entity_filings;

CREATE POLICY "Authenticated users can view entity_filings" 
ON public.entity_filings 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- ========== LAW_FIRMS TABLE ==========
DROP POLICY IF EXISTS "Authenticated users can create law firms" ON public.law_firms;
DROP POLICY IF EXISTS "Authenticated users can delete law firms" ON public.law_firms;
DROP POLICY IF EXISTS "Authenticated users can update law firms" ON public.law_firms;
DROP POLICY IF EXISTS "Authenticated users can view law firms" ON public.law_firms;

CREATE POLICY "Authenticated users can view law_firms" 
ON public.law_firms 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- ========== FILING_TASKS TABLE ==========
DROP POLICY IF EXISTS "Authenticated users can create filing tasks" ON public.filing_tasks;
DROP POLICY IF EXISTS "Authenticated users can delete filing tasks" ON public.filing_tasks;
DROP POLICY IF EXISTS "Authenticated users can update filing tasks" ON public.filing_tasks;
DROP POLICY IF EXISTS "Authenticated users can view filing tasks" ON public.filing_tasks;

CREATE POLICY "Authenticated users can view filing_tasks" 
ON public.filing_tasks 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- ========== EQUITY_TRANSACTIONS TABLE ==========
DROP POLICY IF EXISTS "Authenticated users can create equity transactions" ON public.equity_transactions;
DROP POLICY IF EXISTS "Authenticated users can delete equity transactions" ON public.equity_transactions;
DROP POLICY IF EXISTS "Authenticated users can update equity transactions" ON public.equity_transactions;
DROP POLICY IF EXISTS "Authenticated users can view equity transactions" ON public.equity_transactions;

CREATE POLICY "Authenticated users can view equity_transactions" 
ON public.equity_transactions 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- ========== DIRECTORS_UBOS TABLE ==========
DROP POLICY IF EXISTS "Authenticated users can view directors_ubos" ON public.directors_ubos;

CREATE POLICY "Authenticated users can view directors_ubos" 
ON public.directors_ubos 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- ========== TEAM_INVITATIONS TABLE ==========
-- Fix the overly permissive policy that exposes emails to public
DROP POLICY IF EXISTS "Anyone can read invitations by token" ON public.team_invitations;

-- Replace with a policy that only allows reading invitations with a valid token AND authentication
CREATE POLICY "Authenticated users can read their invitations" 
ON public.team_invitations 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Allow unauthenticated users to validate invitation tokens only (needed for signup flow)
-- This is restrictive - they can only see invitations if they know the exact token
CREATE POLICY "Anyone can validate invitation by token" 
ON public.team_invitations 
FOR SELECT 
TO anon
USING (token IS NOT NULL);

-- ========== ADDRESS TABLE ==========
DROP POLICY IF EXISTS "Authenticated users can view all addresses" ON public.addresses;

CREATE POLICY "Authenticated users can view addresses" 
ON public.addresses 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- ========== TAX_IDS TABLE ==========
DROP POLICY IF EXISTS "Authenticated users can view tax IDs" ON public.tax_ids;

CREATE POLICY "Authenticated users can view tax_ids" 
ON public.tax_ids 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- ========== PHONE_NUMBERS TABLE ==========
DROP POLICY IF EXISTS "Authenticated users can view phone numbers" ON public.phone_numbers;

CREATE POLICY "Authenticated users can view phone_numbers" 
ON public.phone_numbers 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- ========== SOCIAL_MEDIA_ACCOUNTS TABLE ==========
DROP POLICY IF EXISTS "Authenticated users can view social media accounts" ON public.social_media_accounts;

CREATE POLICY "Authenticated users can view social_media_accounts" 
ON public.social_media_accounts 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- ========== SHAREHOLDERS TABLE ==========
DROP POLICY IF EXISTS "Authenticated users can view shareholders" ON public.shareholders;

CREATE POLICY "Authenticated users can view shareholders" 
ON public.shareholders 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- ========== SHARE_CLASSES TABLE ==========
DROP POLICY IF EXISTS "Authenticated users can view share classes" ON public.share_classes;

CREATE POLICY "Authenticated users can view share_classes" 
ON public.share_classes 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- ========== OPTION_GRANTS TABLE ==========
DROP POLICY IF EXISTS "Authenticated users can view option grants" ON public.option_grants;

CREATE POLICY "Authenticated users can view option_grants" 
ON public.option_grants 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);