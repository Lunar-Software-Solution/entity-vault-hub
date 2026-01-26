-- Make entity_id nullable in all tables that currently require it

-- People & Cap Table
ALTER TABLE public.directors_ubos ALTER COLUMN entity_id DROP NOT NULL;
ALTER TABLE public.shareholders ALTER COLUMN entity_id DROP NOT NULL;
ALTER TABLE public.share_classes ALTER COLUMN entity_id DROP NOT NULL;
ALTER TABLE public.equity_transactions ALTER COLUMN entity_id DROP NOT NULL;
ALTER TABLE public.option_grants ALTER COLUMN entity_id DROP NOT NULL;
ALTER TABLE public.director_entity_links ALTER COLUMN entity_id DROP NOT NULL;
ALTER TABLE public.shareholder_entity_links ALTER COLUMN entity_id DROP NOT NULL;

-- Entity Details
ALTER TABLE public.phone_numbers ALTER COLUMN entity_id DROP NOT NULL;
ALTER TABLE public.tax_ids ALTER COLUMN entity_id DROP NOT NULL;
ALTER TABLE public.entity_documents ALTER COLUMN entity_id DROP NOT NULL;
ALTER TABLE public.entity_filings ALTER COLUMN entity_id DROP NOT NULL;
ALTER TABLE public.entity_emails ALTER COLUMN entity_id DROP NOT NULL;
ALTER TABLE public.entity_websites ALTER COLUMN entity_id DROP NOT NULL;
ALTER TABLE public.entity_software ALTER COLUMN entity_id DROP NOT NULL;
ALTER TABLE public.filing_tasks ALTER COLUMN entity_id DROP NOT NULL;

-- Service Providers
ALTER TABLE public.accountant_firms ALTER COLUMN entity_id DROP NOT NULL;
ALTER TABLE public.law_firms ALTER COLUMN entity_id DROP NOT NULL;
ALTER TABLE public.registration_agents ALTER COLUMN entity_id DROP NOT NULL;
ALTER TABLE public.advisors ALTER COLUMN entity_id DROP NOT NULL;
ALTER TABLE public.consultants ALTER COLUMN entity_id DROP NOT NULL;
ALTER TABLE public.auditors ALTER COLUMN entity_id DROP NOT NULL;