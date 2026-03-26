-- Add preconstruction category
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_category_check;
ALTER TABLE public.posts ADD CONSTRAINT posts_category_check CHECK (category IN ('apartment', 'house', 'villa', 'commercial', 'land', 'rental', 'preconstruction'));
