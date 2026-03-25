-- Add photo_urls array column to posts table
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS photo_urls TEXT[];
