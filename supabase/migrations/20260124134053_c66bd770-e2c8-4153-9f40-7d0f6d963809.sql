-- Add enrichment fields to directors_ubos table
ALTER TABLE public.directors_ubos 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS company TEXT;

-- Add enrichment fields to shareholders table for consistency
ALTER TABLE public.shareholders 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS company TEXT;