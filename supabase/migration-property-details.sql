-- Add property details columns to posts table
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS price TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS bedrooms INTEGER;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS bathrooms INTEGER;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS size_sqft INTEGER;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS property_features TEXT[];
