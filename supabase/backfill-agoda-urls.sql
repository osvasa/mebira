-- ============================================================
-- Backfill Agoda booking URLs for all 20 seed posts
-- Each URL includes cid=1786118 (affiliate tracking) and
-- q=HOTEL_NAME (so Agoda search lands on the right property)
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── Hotels ──────────────────────────────────────────────────

UPDATE public.posts SET agoda_hotel_id = 'https://www.agoda.com/search?cid=1786118&city=Bali&q=Four+Seasons+Resort+Bali+at+Sayan'
WHERE title = 'Four Seasons Resort Bali at Sayan';

UPDATE public.posts SET agoda_hotel_id = 'https://www.agoda.com/search?cid=1786118&city=Tokyo&q=Aman+Tokyo'
WHERE title = 'Aman Tokyo';

UPDATE public.posts SET agoda_hotel_id = 'https://www.agoda.com/search?cid=1786118&city=Antibes&q=Hotel+du+Cap-Eden-Roc'
WHERE title = 'Hotel du Cap-Eden-Roc, Antibes';

UPDATE public.posts SET agoda_hotel_id = 'https://www.agoda.com/search?cid=1786118&city=Singapore&q=Capella+Singapore'
WHERE title = 'Capella Singapore';

UPDATE public.posts SET agoda_hotel_id = 'https://www.agoda.com/search?cid=1786118&city=Utah&q=Amangiri+Canyon+Point'
WHERE title = 'Amangiri, Canyon Point Utah';

-- ── Restaurants ─────────────────────────────────────────────

UPDATE public.posts SET agoda_hotel_id = 'https://www.agoda.com/search?cid=1786118&city=Bangkok&q=Gaggan+Anand+Bangkok'
WHERE title = 'Gaggan Anand, Bangkok';

UPDATE public.posts SET agoda_hotel_id = 'https://www.agoda.com/search?cid=1786118&city=Copenhagen&q=Noma+Copenhagen'
WHERE title = 'Noma, Copenhagen';

UPDATE public.posts SET agoda_hotel_id = 'https://www.agoda.com/search?cid=1786118&city=Lima&q=Central+Restaurant+Lima'
WHERE title = 'Central, Lima';

UPDATE public.posts SET agoda_hotel_id = 'https://www.agoda.com/search?cid=1786118&city=Modena&q=Osteria+Francescana+Modena'
WHERE title = 'Osteria Francescana, Modena';

UPDATE public.posts SET agoda_hotel_id = 'https://www.agoda.com/search?cid=1786118&city=Mexico+City&q=Quintonil+Mexico+City'
WHERE title = 'Quintonil, Mexico City';

-- ── Destinations ────────────────────────────────────────────

UPDATE public.posts SET agoda_hotel_id = 'https://www.agoda.com/search?cid=1786118&city=Cappadocia&q=Cappadocia+cave+hotel'
WHERE title = 'Cappadocia, Turkey';

UPDATE public.posts SET agoda_hotel_id = 'https://www.agoda.com/search?cid=1786118&city=Faroe+Islands&q=Torshavn+hotel'
WHERE title = 'Faroe Islands';

UPDATE public.posts SET agoda_hotel_id = 'https://www.agoda.com/search?cid=1786118&city=Patagonia&q=Torres+del+Paine+hotel'
WHERE title = 'Torres del Paine, Patagonia';

UPDATE public.posts SET agoda_hotel_id = 'https://www.agoda.com/search?cid=1786118&city=Jaipur&q=Jaipur+palace+hotel'
WHERE title = 'Rajasthan, India';

UPDATE public.posts SET agoda_hotel_id = 'https://www.agoda.com/search?cid=1786118&city=Ha+Long&q=Ha+Long+Bay+cruise+hotel'
WHERE title = 'Ha Long Bay, Vietnam';

-- ── Flights (link to destination city hotels) ───────────────

UPDATE public.posts SET agoda_hotel_id = 'https://www.agoda.com/search?cid=1786118&city=London&q=London+hotel'
WHERE title = 'Singapore Airlines Business Class — SIN to LHR';

UPDATE public.posts SET agoda_hotel_id = 'https://www.agoda.com/search?cid=1786118&city=New+York&q=New+York+hotel'
WHERE title = 'Emirates First Class — DXB to JFK';

UPDATE public.posts SET agoda_hotel_id = 'https://www.agoda.com/search?cid=1786118&city=Easter+Island&q=Easter+Island+hotel'
WHERE title = 'LATAM — Santiago to Easter Island';

UPDATE public.posts SET agoda_hotel_id = 'https://www.agoda.com/search?cid=1786118&city=Tokyo&q=Tokyo+hotel'
WHERE title = 'Finnair Business Class — HEL to NRT';

UPDATE public.posts SET agoda_hotel_id = 'https://www.agoda.com/search?cid=1786118&city=London&q=London+hotel'
WHERE title = 'Qantas Business Class — SYD to LHR';

-- ── Verify ──────────────────────────────────────────────────
SELECT title, agoda_hotel_id, starting_price FROM public.posts ORDER BY created_at DESC;
