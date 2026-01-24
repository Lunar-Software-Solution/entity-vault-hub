-- Create shareholder_entity_links junction table for many-to-many relationships
CREATE TABLE public.shareholder_entity_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shareholder_id UUID NOT NULL REFERENCES public.shareholders(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  ownership_percentage NUMERIC(10, 4) DEFAULT NULL,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(shareholder_id, entity_id)
);

-- Enable RLS
ALTER TABLE public.shareholder_entity_links ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can view shareholder entity links"
ON public.shareholder_entity_links
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage shareholder entity links"
ON public.shareholder_entity_links
FOR ALL
TO authenticated
USING (public.can_write())
WITH CHECK (public.can_write());

-- Create indexes for better query performance
CREATE INDEX idx_shareholder_entity_links_shareholder ON public.shareholder_entity_links(shareholder_id);
CREATE INDEX idx_shareholder_entity_links_entity ON public.shareholder_entity_links(entity_id);

-- Trigger for updated_at
CREATE TRIGGER update_shareholder_entity_links_updated_at
BEFORE UPDATE ON public.shareholder_entity_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing relationships to the junction table
INSERT INTO public.shareholder_entity_links (shareholder_id, entity_id, is_active)
SELECT id, entity_id, true
FROM public.shareholders
WHERE entity_id IS NOT NULL
ON CONFLICT (shareholder_id, entity_id) DO NOTHING;