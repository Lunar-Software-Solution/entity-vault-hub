-- Clean up remaining overly permissive RLS policies across all tables
-- These are legacy INSERT/UPDATE/DELETE policies that use USING (true) or WITH CHECK (true)
-- The proper can_write() policies are already in place

-- ========== EMAIL_ADDRESSES TABLE ==========
DROP POLICY IF EXISTS "Authenticated users can create email addresses" ON public.email_addresses;
DROP POLICY IF EXISTS "Authenticated users can delete email addresses" ON public.email_addresses;
DROP POLICY IF EXISTS "Authenticated users can update email addresses" ON public.email_addresses;
DROP POLICY IF EXISTS "Authenticated users can view email addresses" ON public.email_addresses;

CREATE POLICY "Authenticated users can view email_addresses" 
ON public.email_addresses 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- ========== DOCUMENT_TYPES TABLE ==========
DROP POLICY IF EXISTS "Authenticated users can create document types" ON public.document_types;
DROP POLICY IF EXISTS "Authenticated users can delete document types" ON public.document_types;
DROP POLICY IF EXISTS "Authenticated users can update document types" ON public.document_types;
DROP POLICY IF EXISTS "Authenticated users can view document types" ON public.document_types;

CREATE POLICY "Authenticated users can view document_types" 
ON public.document_types 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Add write policies for document_types (missing)
CREATE POLICY "Users with write access can create document_types" 
ON public.document_types FOR INSERT TO authenticated
WITH CHECK (can_write());

CREATE POLICY "Users with write access can update document_types" 
ON public.document_types FOR UPDATE TO authenticated
USING (can_write());

CREATE POLICY "Users with write access can delete document_types" 
ON public.document_types FOR DELETE TO authenticated
USING (can_write());

-- ========== FILING_TYPES TABLE ==========
DROP POLICY IF EXISTS "Authenticated users can create filing types" ON public.filing_types;
DROP POLICY IF EXISTS "Authenticated users can delete filing types" ON public.filing_types;
DROP POLICY IF EXISTS "Authenticated users can update filing types" ON public.filing_types;
DROP POLICY IF EXISTS "Authenticated users can view filing types" ON public.filing_types;

CREATE POLICY "Authenticated users can view filing_types" 
ON public.filing_types 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Add write policies for filing_types (missing)
CREATE POLICY "Users with write access can create filing_types" 
ON public.filing_types FOR INSERT TO authenticated
WITH CHECK (can_write());

CREATE POLICY "Users with write access can update filing_types" 
ON public.filing_types FOR UPDATE TO authenticated
USING (can_write());

CREATE POLICY "Users with write access can delete filing_types" 
ON public.filing_types FOR DELETE TO authenticated
USING (can_write());

-- ========== ISSUING_AUTHORITIES TABLE ==========
DROP POLICY IF EXISTS "Authenticated users can create issuing authorities" ON public.issuing_authorities;
DROP POLICY IF EXISTS "Authenticated users can delete issuing authorities" ON public.issuing_authorities;
DROP POLICY IF EXISTS "Authenticated users can update issuing authorities" ON public.issuing_authorities;
DROP POLICY IF EXISTS "Authenticated users can view issuing authorities" ON public.issuing_authorities;

CREATE POLICY "Authenticated users can view issuing_authorities" 
ON public.issuing_authorities 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Add write policies for issuing_authorities (missing)
CREATE POLICY "Users with write access can create issuing_authorities" 
ON public.issuing_authorities FOR INSERT TO authenticated
WITH CHECK (can_write());

CREATE POLICY "Users with write access can update issuing_authorities" 
ON public.issuing_authorities FOR UPDATE TO authenticated
USING (can_write());

CREATE POLICY "Users with write access can delete issuing_authorities" 
ON public.issuing_authorities FOR DELETE TO authenticated
USING (can_write());

-- ========== FILING_DOCUMENTS TABLE ==========
DROP POLICY IF EXISTS "Authenticated users can create filing documents" ON public.filing_documents;
DROP POLICY IF EXISTS "Authenticated users can delete filing documents" ON public.filing_documents;
DROP POLICY IF EXISTS "Authenticated users can view filing documents" ON public.filing_documents;

CREATE POLICY "Authenticated users can view filing_documents" 
ON public.filing_documents 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Add write policies for filing_documents (missing)
CREATE POLICY "Users with write access can create filing_documents" 
ON public.filing_documents FOR INSERT TO authenticated
WITH CHECK (can_write());

CREATE POLICY "Users with write access can delete filing_documents" 
ON public.filing_documents FOR DELETE TO authenticated
USING (can_write());

-- ========== ENTITY_PROVIDER_CONTRACTS TABLE ==========
DROP POLICY IF EXISTS "Authenticated users can create provider contracts" ON public.entity_provider_contracts;
DROP POLICY IF EXISTS "Authenticated users can delete provider contracts" ON public.entity_provider_contracts;
DROP POLICY IF EXISTS "Authenticated users can update provider contracts" ON public.entity_provider_contracts;
DROP POLICY IF EXISTS "Authenticated users can view provider contracts" ON public.entity_provider_contracts;

CREATE POLICY "Authenticated users can view entity_provider_contracts" 
ON public.entity_provider_contracts 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Add write policies for entity_provider_contracts (missing)
CREATE POLICY "Users with write access can create entity_provider_contracts" 
ON public.entity_provider_contracts FOR INSERT TO authenticated
WITH CHECK (can_write());

CREATE POLICY "Users with write access can update entity_provider_contracts" 
ON public.entity_provider_contracts FOR UPDATE TO authenticated
USING (can_write());

CREATE POLICY "Users with write access can delete entity_provider_contracts" 
ON public.entity_provider_contracts FOR DELETE TO authenticated
USING (can_write());

-- ========== ENTITIES TABLE ==========
DROP POLICY IF EXISTS "Authenticated users can view all entities" ON public.entities;

CREATE POLICY "Authenticated users can view entities" 
ON public.entities 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- ========== ENTITY_EMAILS TABLE ==========
DROP POLICY IF EXISTS "Authenticated users can view entity_emails" ON public.entity_emails;

CREATE POLICY "Authenticated users can view entity_emails" 
ON public.entity_emails 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- ========== ENTITY_WEBSITES TABLE ==========
DROP POLICY IF EXISTS "Authenticated users can view entity websites" ON public.entity_websites;

CREATE POLICY "Authenticated users can view entity_websites" 
ON public.entity_websites 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- ========== ENTITY_SOFTWARE TABLE ==========
DROP POLICY IF EXISTS "Authenticated users can view entity software" ON public.entity_software;

CREATE POLICY "Authenticated users can view entity_software" 
ON public.entity_software 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- ========== ADVISORS TABLE ==========
DROP POLICY IF EXISTS "Authenticated users can view advisors" ON public.advisors;

CREATE POLICY "Authenticated users can view advisors" 
ON public.advisors 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- ========== CONSULTANTS TABLE ==========
DROP POLICY IF EXISTS "Authenticated users can view consultants" ON public.consultants;

CREATE POLICY "Authenticated users can view consultants" 
ON public.consultants 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- ========== AUDITORS TABLE ==========
DROP POLICY IF EXISTS "Authenticated users can view auditors" ON public.auditors;

CREATE POLICY "Authenticated users can view auditors" 
ON public.auditors 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- ========== REGISTRATION_AGENTS TABLE ==========
DROP POLICY IF EXISTS "Authenticated users can view registration agents" ON public.registration_agents;

CREATE POLICY "Authenticated users can view registration_agents" 
ON public.registration_agents 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- ========== MAIL_SERVERS TABLE ==========
DROP POLICY IF EXISTS "Authenticated users can view mail servers" ON public.mail_servers;

CREATE POLICY "Authenticated users can view mail_servers" 
ON public.mail_servers 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- ========== AUDIT_LOGS TABLE ==========
DROP POLICY IF EXISTS "Authenticated users can create audit logs" ON public.audit_logs;

-- Audit logs insert should only work for authenticated users (already secure via trigger)
CREATE POLICY "Authenticated users can create audit_logs" 
ON public.audit_logs FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- ========== TAX_ID_TYPES TABLE ==========
DROP POLICY IF EXISTS "Authenticated users can view tax id types" ON public.tax_id_types;

CREATE POLICY "Authenticated users can view tax_id_types" 
ON public.tax_id_types 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- ========== SOFTWARE_CATALOG TABLE ==========
DROP POLICY IF EXISTS "Authenticated users can view software catalog" ON public.software_catalog;

CREATE POLICY "Authenticated users can view software_catalog" 
ON public.software_catalog 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- ========== DIRECTOR_ID_DOCUMENTS TABLE ==========
DROP POLICY IF EXISTS "Allow read access to authenticated users" ON public.director_id_documents;

CREATE POLICY "Authenticated users can view director_id_documents" 
ON public.director_id_documents 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);