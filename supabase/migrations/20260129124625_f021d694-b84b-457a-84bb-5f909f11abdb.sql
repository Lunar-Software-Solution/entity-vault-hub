-- Add suite/apt field to addresses table
ALTER TABLE public.addresses 
ADD COLUMN suite VARCHAR(100) NULL;