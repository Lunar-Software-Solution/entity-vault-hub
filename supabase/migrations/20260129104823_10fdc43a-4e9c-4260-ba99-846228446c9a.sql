-- Create junction table for address-entity many-to-many relationship
CREATE TABLE public.address_entity_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  address_id uuid NOT NULL REFERENCES public.addresses(id) ON DELETE CASCADE,
  entity_id uuid NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  is_primary boolean DEFAULT false,
  role text DEFAULT 'registered'::text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (address_id, entity_id)
);

-- Enable RLS
ALTER TABLE public.address_entity_links ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can view address_entity_links"
ON public.address_entity_links FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users with write access can create address_entity_links"
ON public.address_entity_links FOR INSERT
WITH CHECK (can_write());

CREATE POLICY "Users with write access can update address_entity_links"
ON public.address_entity_links FOR UPDATE
USING (can_write());

CREATE POLICY "Users with write access can delete address_entity_links"
ON public.address_entity_links FOR DELETE
USING (can_write());

-- Add updated_at trigger
CREATE TRIGGER update_address_entity_links_updated_at
BEFORE UPDATE ON public.address_entity_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add audit trigger
CREATE TRIGGER audit_address_entity_links
AFTER INSERT OR UPDATE OR DELETE ON public.address_entity_links
FOR EACH ROW
EXECUTE FUNCTION public.audit_trigger_function();