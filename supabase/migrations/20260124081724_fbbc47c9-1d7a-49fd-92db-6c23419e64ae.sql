-- Create junction table for director-entity many-to-many relationship
CREATE TABLE public.director_entity_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  director_id UUID NOT NULL REFERENCES public.directors_ubos(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  role_type TEXT NOT NULL DEFAULT 'director',
  title TEXT,
  appointment_date DATE,
  resignation_date DATE,
  ownership_percentage NUMERIC,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Prevent duplicate links
  UNIQUE(director_id, entity_id)
);

-- Enable RLS
ALTER TABLE public.director_entity_links ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can view director_entity_links"
ON public.director_entity_links
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users with write access can create director_entity_links"
ON public.director_entity_links
FOR INSERT
WITH CHECK (can_write());

CREATE POLICY "Users with write access can update director_entity_links"
ON public.director_entity_links
FOR UPDATE
USING (can_write());

CREATE POLICY "Users with write access can delete director_entity_links"
ON public.director_entity_links
FOR DELETE
USING (can_write());

-- Create trigger for updated_at
CREATE TRIGGER update_director_entity_links_updated_at
BEFORE UPDATE ON public.director_entity_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing director-entity relationships to the junction table
INSERT INTO public.director_entity_links (director_id, entity_id, role_type, title, appointment_date, resignation_date, ownership_percentage, is_active, notes)
SELECT 
  id as director_id,
  entity_id,
  role_type,
  title,
  appointment_date,
  resignation_date,
  ownership_percentage,
  COALESCE(is_active, true),
  notes
FROM public.directors_ubos
WHERE entity_id IS NOT NULL;

-- Add index for better query performance
CREATE INDEX idx_director_entity_links_director_id ON public.director_entity_links(director_id);
CREATE INDEX idx_director_entity_links_entity_id ON public.director_entity_links(entity_id);