-- Add suppress_avatar flag to prevent avatar loading for specific records
ALTER TABLE public.directors_ubos 
ADD COLUMN IF NOT EXISTS suppress_avatar boolean NOT NULL DEFAULT false;

-- Add same column to shareholders for consistency
ALTER TABLE public.shareholders 
ADD COLUMN IF NOT EXISTS suppress_avatar boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.directors_ubos.suppress_avatar IS 'When true, always show initials instead of attempting to load an avatar';
COMMENT ON COLUMN public.shareholders.suppress_avatar IS 'When true, always show initials instead of attempting to load an avatar';