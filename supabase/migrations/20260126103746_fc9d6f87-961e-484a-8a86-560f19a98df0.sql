-- Create junction table for website-entity many-to-many relationship
CREATE TABLE public.website_entity_links (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  website_id uuid NOT NULL REFERENCES public.entity_websites(id) ON DELETE CASCADE,
  entity_id uuid NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  is_primary boolean DEFAULT false,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(website_id, entity_id)
);

-- Enable RLS
ALTER TABLE public.website_entity_links ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can view website_entity_links"
ON public.website_entity_links FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users with write access can create website_entity_links"
ON public.website_entity_links FOR INSERT
WITH CHECK (can_write());

CREATE POLICY "Users with write access can update website_entity_links"
ON public.website_entity_links FOR UPDATE
USING (can_write());

CREATE POLICY "Users with write access can delete website_entity_links"
ON public.website_entity_links FOR DELETE
USING (can_write());

-- Create trigger for updated_at
CREATE TRIGGER update_website_entity_links_updated_at
BEFORE UPDATE ON public.website_entity_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();