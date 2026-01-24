-- Add linkedin_url field to directors_ubos table
ALTER TABLE public.directors_ubos 
ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- Add linkedin_url field to shareholders table
ALTER TABLE public.shareholders 
ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- Add linkedin_url field to accountant_firms table
ALTER TABLE public.accountant_firms 
ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- Add linkedin_url field to law_firms table
ALTER TABLE public.law_firms 
ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- Add linkedin_url field to advisors table
ALTER TABLE public.advisors 
ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- Add linkedin_url field to consultants table
ALTER TABLE public.consultants 
ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- Add linkedin_url field to auditors table
ALTER TABLE public.auditors 
ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- Add linkedin_url field to registration_agents table
ALTER TABLE public.registration_agents 
ADD COLUMN IF NOT EXISTS linkedin_url TEXT;