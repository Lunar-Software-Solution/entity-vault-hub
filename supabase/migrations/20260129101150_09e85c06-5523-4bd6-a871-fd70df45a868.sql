-- Create junction table for contract-entity many-to-many relationship
CREATE TABLE public.contract_entity_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  role TEXT DEFAULT 'party', -- e.g., 'party', 'beneficiary', 'guarantor'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(contract_id, entity_id)
);

-- Enable RLS
ALTER TABLE public.contract_entity_links ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can view contract_entity_links"
  ON public.contract_entity_links FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users with write access can create contract_entity_links"
  ON public.contract_entity_links FOR INSERT
  WITH CHECK (can_write());

CREATE POLICY "Users with write access can update contract_entity_links"
  ON public.contract_entity_links FOR UPDATE
  USING (can_write());

CREATE POLICY "Users with write access can delete contract_entity_links"
  ON public.contract_entity_links FOR DELETE
  USING (can_write());

-- Add updated_at trigger
CREATE TRIGGER update_contract_entity_links_updated_at
  BEFORE UPDATE ON public.contract_entity_links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add audit logging trigger
CREATE TRIGGER audit_contract_entity_links
  AFTER INSERT OR UPDATE OR DELETE ON public.contract_entity_links
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_trigger_function();