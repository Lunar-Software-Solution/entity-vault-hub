-- Create a helper function to check if user can write (not a viewer)
CREATE OR REPLACE FUNCTION public.can_write()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'viewer'
  ) OR EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin', 'moderator', 'member')
  )
$$;

-- Update all INSERT policies to check for write access
-- Entities
DROP POLICY IF EXISTS "Authenticated users can create entities" ON public.entities;
CREATE POLICY "Users with write access can create entities"
ON public.entities FOR INSERT
TO authenticated
WITH CHECK (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can update entities" ON public.entities;
CREATE POLICY "Users with write access can update entities"
ON public.entities FOR UPDATE
TO authenticated
USING (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can delete entities" ON public.entities;
CREATE POLICY "Users with write access can delete entities"
ON public.entities FOR DELETE
TO authenticated
USING (public.can_write());

-- Bank Accounts
DROP POLICY IF EXISTS "Authenticated users can create bank_accounts" ON public.bank_accounts;
CREATE POLICY "Users with write access can create bank_accounts"
ON public.bank_accounts FOR INSERT
TO authenticated
WITH CHECK (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can update bank_accounts" ON public.bank_accounts;
CREATE POLICY "Users with write access can update bank_accounts"
ON public.bank_accounts FOR UPDATE
TO authenticated
USING (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can delete bank_accounts" ON public.bank_accounts;
CREATE POLICY "Users with write access can delete bank_accounts"
ON public.bank_accounts FOR DELETE
TO authenticated
USING (public.can_write());

-- Credit Cards
DROP POLICY IF EXISTS "Authenticated users can create credit_cards" ON public.credit_cards;
CREATE POLICY "Users with write access can create credit_cards"
ON public.credit_cards FOR INSERT
TO authenticated
WITH CHECK (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can update credit_cards" ON public.credit_cards;
CREATE POLICY "Users with write access can update credit_cards"
ON public.credit_cards FOR UPDATE
TO authenticated
USING (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can delete credit_cards" ON public.credit_cards;
CREATE POLICY "Users with write access can delete credit_cards"
ON public.credit_cards FOR DELETE
TO authenticated
USING (public.can_write());

-- Addresses
DROP POLICY IF EXISTS "Authenticated users can create addresses" ON public.addresses;
CREATE POLICY "Users with write access can create addresses"
ON public.addresses FOR INSERT
TO authenticated
WITH CHECK (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can update addresses" ON public.addresses;
CREATE POLICY "Users with write access can update addresses"
ON public.addresses FOR UPDATE
TO authenticated
USING (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can delete addresses" ON public.addresses;
CREATE POLICY "Users with write access can delete addresses"
ON public.addresses FOR DELETE
TO authenticated
USING (public.can_write());

-- Contracts
DROP POLICY IF EXISTS "Authenticated users can create contracts" ON public.contracts;
CREATE POLICY "Users with write access can create contracts"
ON public.contracts FOR INSERT
TO authenticated
WITH CHECK (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can update contracts" ON public.contracts;
CREATE POLICY "Users with write access can update contracts"
ON public.contracts FOR UPDATE
TO authenticated
USING (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can delete contracts" ON public.contracts;
CREATE POLICY "Users with write access can delete contracts"
ON public.contracts FOR DELETE
TO authenticated
USING (public.can_write());

-- Phone Numbers
DROP POLICY IF EXISTS "Authenticated users can create phone_numbers" ON public.phone_numbers;
CREATE POLICY "Users with write access can create phone_numbers"
ON public.phone_numbers FOR INSERT
TO authenticated
WITH CHECK (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can update phone_numbers" ON public.phone_numbers;
CREATE POLICY "Users with write access can update phone_numbers"
ON public.phone_numbers FOR UPDATE
TO authenticated
USING (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can delete phone_numbers" ON public.phone_numbers;
CREATE POLICY "Users with write access can delete phone_numbers"
ON public.phone_numbers FOR DELETE
TO authenticated
USING (public.can_write());

-- Tax IDs
DROP POLICY IF EXISTS "Authenticated users can create tax_ids" ON public.tax_ids;
CREATE POLICY "Users with write access can create tax_ids"
ON public.tax_ids FOR INSERT
TO authenticated
WITH CHECK (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can update tax_ids" ON public.tax_ids;
CREATE POLICY "Users with write access can update tax_ids"
ON public.tax_ids FOR UPDATE
TO authenticated
USING (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can delete tax_ids" ON public.tax_ids;
CREATE POLICY "Users with write access can delete tax_ids"
ON public.tax_ids FOR DELETE
TO authenticated
USING (public.can_write());

-- Social Media Accounts
DROP POLICY IF EXISTS "Authenticated users can create social_media_accounts" ON public.social_media_accounts;
CREATE POLICY "Users with write access can create social_media_accounts"
ON public.social_media_accounts FOR INSERT
TO authenticated
WITH CHECK (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can update social_media_accounts" ON public.social_media_accounts;
CREATE POLICY "Users with write access can update social_media_accounts"
ON public.social_media_accounts FOR UPDATE
TO authenticated
USING (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can delete social_media_accounts" ON public.social_media_accounts;
CREATE POLICY "Users with write access can delete social_media_accounts"
ON public.social_media_accounts FOR DELETE
TO authenticated
USING (public.can_write());

-- Entity Documents
DROP POLICY IF EXISTS "Authenticated users can create entity_documents" ON public.entity_documents;
CREATE POLICY "Users with write access can create entity_documents"
ON public.entity_documents FOR INSERT
TO authenticated
WITH CHECK (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can update entity_documents" ON public.entity_documents;
CREATE POLICY "Users with write access can update entity_documents"
ON public.entity_documents FOR UPDATE
TO authenticated
USING (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can delete entity_documents" ON public.entity_documents;
CREATE POLICY "Users with write access can delete entity_documents"
ON public.entity_documents FOR DELETE
TO authenticated
USING (public.can_write());

-- Entity Filings
DROP POLICY IF EXISTS "Authenticated users can create entity_filings" ON public.entity_filings;
CREATE POLICY "Users with write access can create entity_filings"
ON public.entity_filings FOR INSERT
TO authenticated
WITH CHECK (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can update entity_filings" ON public.entity_filings;
CREATE POLICY "Users with write access can update entity_filings"
ON public.entity_filings FOR UPDATE
TO authenticated
USING (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can delete entity_filings" ON public.entity_filings;
CREATE POLICY "Users with write access can delete entity_filings"
ON public.entity_filings FOR DELETE
TO authenticated
USING (public.can_write());

-- Filing Tasks
DROP POLICY IF EXISTS "Authenticated users can create filing_tasks" ON public.filing_tasks;
CREATE POLICY "Users with write access can create filing_tasks"
ON public.filing_tasks FOR INSERT
TO authenticated
WITH CHECK (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can update filing_tasks" ON public.filing_tasks;
CREATE POLICY "Users with write access can update filing_tasks"
ON public.filing_tasks FOR UPDATE
TO authenticated
USING (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can delete filing_tasks" ON public.filing_tasks;
CREATE POLICY "Users with write access can delete filing_tasks"
ON public.filing_tasks FOR DELETE
TO authenticated
USING (public.can_write());

-- Directors and UBOs
DROP POLICY IF EXISTS "Authenticated users can create directors_ubos" ON public.directors_ubos;
CREATE POLICY "Users with write access can create directors_ubos"
ON public.directors_ubos FOR INSERT
TO authenticated
WITH CHECK (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can update directors_ubos" ON public.directors_ubos;
CREATE POLICY "Users with write access can update directors_ubos"
ON public.directors_ubos FOR UPDATE
TO authenticated
USING (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can delete directors_ubos" ON public.directors_ubos;
CREATE POLICY "Users with write access can delete directors_ubos"
ON public.directors_ubos FOR DELETE
TO authenticated
USING (public.can_write());

-- Service Providers (Accountant Firms, Law Firms, etc.)
DROP POLICY IF EXISTS "Authenticated users can create accountant_firms" ON public.accountant_firms;
CREATE POLICY "Users with write access can create accountant_firms"
ON public.accountant_firms FOR INSERT
TO authenticated
WITH CHECK (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can update accountant_firms" ON public.accountant_firms;
CREATE POLICY "Users with write access can update accountant_firms"
ON public.accountant_firms FOR UPDATE
TO authenticated
USING (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can delete accountant_firms" ON public.accountant_firms;
CREATE POLICY "Users with write access can delete accountant_firms"
ON public.accountant_firms FOR DELETE
TO authenticated
USING (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can create law_firms" ON public.law_firms;
CREATE POLICY "Users with write access can create law_firms"
ON public.law_firms FOR INSERT
TO authenticated
WITH CHECK (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can update law_firms" ON public.law_firms;
CREATE POLICY "Users with write access can update law_firms"
ON public.law_firms FOR UPDATE
TO authenticated
USING (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can delete law_firms" ON public.law_firms;
CREATE POLICY "Users with write access can delete law_firms"
ON public.law_firms FOR DELETE
TO authenticated
USING (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can create registration_agents" ON public.registration_agents;
CREATE POLICY "Users with write access can create registration_agents"
ON public.registration_agents FOR INSERT
TO authenticated
WITH CHECK (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can update registration_agents" ON public.registration_agents;
CREATE POLICY "Users with write access can update registration_agents"
ON public.registration_agents FOR UPDATE
TO authenticated
USING (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can delete registration_agents" ON public.registration_agents;
CREATE POLICY "Users with write access can delete registration_agents"
ON public.registration_agents FOR DELETE
TO authenticated
USING (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can create advisors" ON public.advisors;
CREATE POLICY "Users with write access can create advisors"
ON public.advisors FOR INSERT
TO authenticated
WITH CHECK (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can update advisors" ON public.advisors;
CREATE POLICY "Users with write access can update advisors"
ON public.advisors FOR UPDATE
TO authenticated
USING (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can delete advisors" ON public.advisors;
CREATE POLICY "Users with write access can delete advisors"
ON public.advisors FOR DELETE
TO authenticated
USING (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can create consultants" ON public.consultants;
CREATE POLICY "Users with write access can create consultants"
ON public.consultants FOR INSERT
TO authenticated
WITH CHECK (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can update consultants" ON public.consultants;
CREATE POLICY "Users with write access can update consultants"
ON public.consultants FOR UPDATE
TO authenticated
USING (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can delete consultants" ON public.consultants;
CREATE POLICY "Users with write access can delete consultants"
ON public.consultants FOR DELETE
TO authenticated
USING (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can create auditors" ON public.auditors;
CREATE POLICY "Users with write access can create auditors"
ON public.auditors FOR INSERT
TO authenticated
WITH CHECK (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can update auditors" ON public.auditors;
CREATE POLICY "Users with write access can update auditors"
ON public.auditors FOR UPDATE
TO authenticated
USING (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can delete auditors" ON public.auditors;
CREATE POLICY "Users with write access can delete auditors"
ON public.auditors FOR DELETE
TO authenticated
USING (public.can_write());

-- Cap Table (Share Classes, Shareholders, Equity Transactions)
DROP POLICY IF EXISTS "Authenticated users can create share_classes" ON public.share_classes;
CREATE POLICY "Users with write access can create share_classes"
ON public.share_classes FOR INSERT
TO authenticated
WITH CHECK (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can update share_classes" ON public.share_classes;
CREATE POLICY "Users with write access can update share_classes"
ON public.share_classes FOR UPDATE
TO authenticated
USING (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can delete share_classes" ON public.share_classes;
CREATE POLICY "Users with write access can delete share_classes"
ON public.share_classes FOR DELETE
TO authenticated
USING (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can create shareholders" ON public.shareholders;
CREATE POLICY "Users with write access can create shareholders"
ON public.shareholders FOR INSERT
TO authenticated
WITH CHECK (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can update shareholders" ON public.shareholders;
CREATE POLICY "Users with write access can update shareholders"
ON public.shareholders FOR UPDATE
TO authenticated
USING (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can delete shareholders" ON public.shareholders;
CREATE POLICY "Users with write access can delete shareholders"
ON public.shareholders FOR DELETE
TO authenticated
USING (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can create equity_transactions" ON public.equity_transactions;
CREATE POLICY "Users with write access can create equity_transactions"
ON public.equity_transactions FOR INSERT
TO authenticated
WITH CHECK (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can update equity_transactions" ON public.equity_transactions;
CREATE POLICY "Users with write access can update equity_transactions"
ON public.equity_transactions FOR UPDATE
TO authenticated
USING (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can delete equity_transactions" ON public.equity_transactions;
CREATE POLICY "Users with write access can delete equity_transactions"
ON public.equity_transactions FOR DELETE
TO authenticated
USING (public.can_write());

-- Email Addresses
DROP POLICY IF EXISTS "Authenticated users can insert emails" ON public.email_addresses;
CREATE POLICY "Users with write access can insert emails"
ON public.email_addresses FOR INSERT
TO authenticated
WITH CHECK (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can update emails" ON public.email_addresses;
CREATE POLICY "Users with write access can update emails"
ON public.email_addresses FOR UPDATE
TO authenticated
USING (public.can_write());

DROP POLICY IF EXISTS "Authenticated users can delete emails" ON public.email_addresses;
CREATE POLICY "Users with write access can delete emails"
ON public.email_addresses FOR DELETE
TO authenticated
USING (public.can_write());