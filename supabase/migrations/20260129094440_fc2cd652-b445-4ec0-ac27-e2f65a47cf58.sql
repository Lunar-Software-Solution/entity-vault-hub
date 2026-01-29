-- Add DocuSeal integration columns to contracts table
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS docuseal_id text UNIQUE,
ADD COLUMN IF NOT EXISTS docuseal_status text,
ADD COLUMN IF NOT EXISTS docuseal_synced_at timestamp with time zone;

-- Create index for faster DocuSeal ID lookups
CREATE INDEX IF NOT EXISTS idx_contracts_docuseal_id ON public.contracts(docuseal_id) WHERE docuseal_id IS NOT NULL;