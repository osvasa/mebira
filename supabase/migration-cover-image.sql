-- Add cover image URL to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
