-- Add starting_price column for Agoda hotel pricing
-- agoda_hotel_id (TEXT) already exists — it will now store tracked booking URLs with hid= and tag= params
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS starting_price DECIMAL(10,2);
