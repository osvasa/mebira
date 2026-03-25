-- ============================================================
-- Osvasa Seed Data — 20 Posts, 10 Creators
-- Run in: https://supabase.com/dashboard/project/dmwlqseijbodocrxmhwu/sql/new
-- ============================================================

-- ── Clear existing data ──────────────────────────────────────
DELETE FROM public.posts;
DELETE FROM public.users;


-- ════════════════════════════════════════════════════════════
-- ROUND 1: 5 Hotel Posts
-- ════════════════════════════════════════════════════════════

INSERT INTO public.users (id, email, username, avatar, bio, followers, earnings) VALUES

  ('b1000000-0000-0000-0000-000000000001',
   'maya.chen@osvasa.com', 'maya_chen',
   'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&q=80',
   'Travel photographer based in Miami. I live out of a carry-on and shoot hotels for a living.',
   38400, 6210.50),

  ('b1000000-0000-0000-0000-000000000002',
   'sofia.rivera@osvasa.com', 'sofia_rivera',
   'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&q=80',
   'Luxury travel writer from Barcelona. I find the places that make you forget your real life.',
   24700, 3890.20),

  ('b1000000-0000-0000-0000-000000000003',
   'james.park@osvasa.com', 'james_park',
   'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&q=80',
   'Hotel critic and food writer based in Seoul. Obsessed with architecture, kaiseki, and a good view.',
   19200, 2140.80),

  ('b1000000-0000-0000-0000-000000000004',
   'emma.laurent@osvasa.com', 'emma_laurent',
   'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&q=80',
   'Paris-born, perpetually elsewhere. I write about the hotels that feel like a second life.',
   51300, 8740.00),

  ('b1000000-0000-0000-0000-000000000005',
   'marcus.webb@osvasa.com', 'marcus_webb',
   'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&q=80',
   'Adventure travel photographer from Portland. Chasing light in places most people never find.',
   29600, 4320.60)

ON CONFLICT (id) DO NOTHING;


INSERT INTO public.posts (id, user_id, title, description, photo_url, location, category, agoda_hotel_id, likes, created_at) VALUES

  (uuid_generate_v4(),
   'b1000000-0000-0000-0000-000000000001',
   'Four Seasons Resort Bali at Sayan',
   'I spent four nights above the Ayung River gorge at the Four Seasons Sayan and I genuinely don''t know how I go back to regular life after this. The resort is built into a jungle hillside — you arrive by walking across a lily pond bridge at canopy level, and it only gets more surreal from there. My villa had a plunge pool suspended above the treetops with a direct view across the river valley. I woke up at 5:30am every morning just to sit on the deck and watch the mist burn off the gorge. The rice paddy walk at dawn — guided, about 90 minutes — is complimentary and genuinely one of the best things I''ve ever done before breakfast. The spa is set over the river in a thatched pavilion; I did the two-hour Balinese boreh ritual and emerged a completely different person. Book the Tree House Suite if you can. The outdoor bathtub on the jungle deck is worth every penny.',
   'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop&q=80',
   'Ubud, Bali', 'hotel',
   'https://www.agoda.com/search?city=Ubud&q=Four+Seasons+Resort+Bali+at+Sayan&cid=1786118',
   5840, NOW() - INTERVAL '3 days'),

  (uuid_generate_v4(),
   'b1000000-0000-0000-0000-000000000003',
   'Aman Tokyo',
   'I''ve reviewed hotels in 40 countries and Aman Tokyo remains the most quietly extraordinary building I''ve ever slept in. It occupies six floors of the Otemachi Tower — floors 33 through 38 — and when you step out of the elevator, the city is already far below you and everything is washi paper and stone and silence. My room was 85 square metres, which is unheard of in Tokyo, and the floor-to-ceiling windows faced northeast toward Shinjuku. On clear mornings I could see Mount Fuji from the bed. The lobby ceiling is a 30-metre washi paper lantern that changes colour through the day. I ate breakfast there three mornings in a row just to watch it. The Aman Spa onsen ritual — alternating thermal pools, stone bath, traditional scrub — is two and a half hours and costs about ¥35,000. I have no regrets. The location in Otemachi puts you a five-minute walk from the Imperial Palace East Gardens, which I walked every evening at sunset.',
   'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=600&fit=crop&q=80',
   'Otemachi, Tokyo', 'hotel',
   'https://www.agoda.com/search?city=Tokyo&q=Aman+Tokyo&cid=1786118',
   3720, NOW() - INTERVAL '7 days'),

  (uuid_generate_v4(),
   'b1000000-0000-0000-0000-000000000004',
   'Hotel du Cap-Eden-Roc, Antibes',
   'We drove down the Cap d''Antibes peninsula on a Tuesday morning in June and checked into the most legendary hotel on the French Riviera. Hotel du Cap-Eden-Roc has been operating since 1870 and the list of guests reads like a century of glamour — Fitzgerald wrote about it, Picasso painted here, every film star who''s ever been to Cannes has sat on these terraces. The Eden-Roc pavilion — the sea-level terrace where they blasted a swimming pool directly into the limestone cliff — is one of the great places to spend a morning on earth. I swam at 8am before other guests arrived and had the entire cliff to myself, the sea below perfectly flat and blue. Dinner on the terrace watching the sun drop behind the Esterel hills cost €200pp and was worth it completely. Stay in the Pavillon Eden-Roc rooms — they''re closest to the sea and you fall asleep to waves on limestone.',
   'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&h=600&fit=crop&q=80',
   'Antibes, France', 'hotel',
   'https://www.agoda.com/search?city=Antibes&q=Hotel+du+Cap-Eden-Roc&cid=1786118',
   6490, NOW() - INTERVAL '1 day'),

  (uuid_generate_v4(),
   'b1000000-0000-0000-0000-000000000002',
   'Capella Singapore',
   'I discovered Capella Singapore almost by accident — a friend mentioned it in passing and I looked it up at midnight and booked on the spot. It sits on Sentosa Island inside two restored British colonial buildings from the 1880s surrounded by 30 acres of rainforest. I spent three nights here and barely left the property. The pool terrace faces north toward the Singapore skyline and at night the city glitters just close enough to feel exciting but far enough to feel removed. My room had 12-foot ceilings, original timber floors, and a deep soaking tub by a window that looked into the jungle. I ordered room service the first night — laksa and a cold Singha — and ate it in the tub watching the tree canopy. The Knolls restaurant for breakfast — eggs benedict overlooking the straits with morning ferries crossing below — is one of my favourite meals of the year.',
   'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&h=600&fit=crop&q=80',
   'Sentosa, Singapore', 'hotel',
   'https://www.agoda.com/search?city=Singapore&q=Capella+Singapore&cid=1786118',
   2870, NOW() - INTERVAL '11 days'),

  (uuid_generate_v4(),
   'b1000000-0000-0000-0000-000000000005',
   'Amangiri, Canyon Point Utah',
   'I drove four hours from Las Vegas through southern Utah and arrived at Amangiri as the sun was setting behind the mesa. The resort is built from poured concrete that matches the surrounding Navajo sandstone almost exactly — from a distance it disappears into the rock. My suite wrapped around a natural rock formation; the pool is built directly over a sandstone outcrop and in the afternoon the reflection on the canyon walls turns everything amber. I woke at 4am on the second morning and watched the Milky Way from the canyon floor until 6:30 when the pink light started. The spa is cut into the mesa — the hot spring pool is partly underground in a cave. The float therapy room has no electric light; you''re in complete darkness for 60 minutes in a salt pool. A standard suite starts around $3,500 a night. For a certain kind of silence, it''s the best money I''ve ever spent.',
   'https://images.unsplash.com/photo-1518893883800-45cd0954574b?w=800&h=600&fit=crop&q=80',
   'Canyon Point, Utah', 'hotel',
   'https://www.agoda.com/search?city=Utah&q=Amangiri&cid=1786118',
   7830, NOW() - INTERVAL '5 days')

ON CONFLICT (id) DO NOTHING;


-- ════════════════════════════════════════════════════════════
-- ROUND 2: 5 New Creators + 15 Posts (Restaurant, Destination, Flight)
-- ════════════════════════════════════════════════════════════

INSERT INTO public.users (id, email, username, avatar, bio, followers, earnings) VALUES

  ('c1000000-0000-0000-0000-000000000001',
   'priya.sharma@osvasa.com', 'priya_sharma',
   'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&q=80',
   'Food and travel writer from Mumbai. I eat my way across every city I land in.',
   22400, 3100.40),

  ('c1000000-0000-0000-0000-000000000002',
   'lucas.oliveira@osvasa.com', 'lucas_oliveira',
   'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=150&h=150&fit=crop&q=80',
   'Adventure photographer from São Paulo. I chase landscapes that make you feel small.',
   17800, 2240.90),

  ('c1000000-0000-0000-0000-000000000003',
   'aiko.tanaka@osvasa.com', 'aiko_tanaka',
   'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=150&h=150&fit=crop&q=80',
   'Luxury travel writer based in Kyoto. I write about places that honour slowness.',
   31500, 5410.20),

  ('c1000000-0000-0000-0000-000000000004',
   'nadia.hassan@osvasa.com', 'nadia_hassan',
   'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&q=80',
   'Travel journalist based between Cairo and Dubai. The world is bigger than you think.',
   28900, 4870.00),

  ('c1000000-0000-0000-0000-000000000005',
   'finn.eriksen@osvasa.com', 'finn_eriksen',
   'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&q=80',
   'Wilderness photographer from Bergen. I find beauty in the most uncomfortable places.',
   44200, 7380.50)

ON CONFLICT (id) DO NOTHING;


-- ── Restaurants ───────────────────────────────────────────────

INSERT INTO public.posts (id, user_id, title, description, photo_url, location, category, agoda_hotel_id, likes, created_at) VALUES

  (uuid_generate_v4(),
   'c1000000-0000-0000-0000-000000000001',
   'Gaggan Anand, Bangkok',
   'We had the most extraordinary meal of my career at Gaggan Anand''s restaurant in Bangkok, and I say that as someone who has reviewed food professionally for eleven years. The menu is twenty-five courses of progressive Indian cuisine — Gaggan calls it emoji cuisine because each dish is represented by an emoji rather than a written description. You eat your way through tiny, jewel-like courses that taste like Indian street food reimagined by someone who has spent twenty years in molecular gastronomy. The first course is a single crisp ball that dissolves on your tongue releasing a burst of yoghurt chaat — the flavours of the vada pav I grew up eating outside Dadar station in Mumbai, but distilled and levitated. The octopus curry at course eleven made me put my fork down and sit in silence for a moment. Gaggan himself comes out between courses and talks to every table; he is exactly as intense and funny as you hope. The full menu takes about four hours and costs around ฿8,500pp with pairing. Book three months in advance.',
   'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=600&fit=crop&q=80',
   'Phrom Phong, Bangkok', 'restaurant',
   'https://www.agoda.com/search?city=Bangkok&q=Gaggan+Anand&cid=1786118',
   4320, NOW() - INTERVAL '9 days'),

  (uuid_generate_v4(),
   'c1000000-0000-0000-0000-000000000005',
   'Noma, Copenhagen',
   'I finally got a table at Noma on my fourth attempt in six years — reservations drop three months in advance at noon Copenhagen time and are gone in 45 seconds. I sat by my laptop at 5:45am Norwegian time refreshing until I got two seats at the chef''s table. It was worth every year of waiting. René Redzepi''s kitchen in the summer game season presented us with 22 courses of the most intellectually rigorous cooking I''ve ever encountered — each dish built around a single foraged or fermented Scandinavian ingredient you''ve probably never thought to eat. A soup made from birch sap and sea buckthorn. Ants — literally live ants — placed on a cream with wood sorrel. A whole Greenlandic langoustine served raw over juniper embers at the table. The restaurant is a cluster of converted warehouses in Christianshavn and feels more like an artist''s studio than a dining room. Dinner for two with wine pairing was about DKK 10,000. I took 300 photographs and barely touched my camera after the third course.',
   'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&q=80',
   'Christianshavn, Copenhagen', 'restaurant',
   'https://www.agoda.com/search?city=Copenhagen&q=Noma+Copenhagen&cid=1786118',
   5890, NOW() - INTERVAL '4 days'),

  (uuid_generate_v4(),
   'c1000000-0000-0000-0000-000000000002',
   'Central, Lima',
   'I spent two weeks in Peru chasing Patagonian light and made a detour to Lima specifically for dinner at Central. Virgilio Martínez''s tasting menu is organized by altitude — each course represents an ecosystem at a specific elevation, from minus 10 metres at the ocean floor to 4,100 metres in the Andean highlands. We worked our way up through the levels: black clams and sea cucumber from the deep Pacific, corn and quinoa from the coastal valleys, freeze-dried potato and llama from the altiplano. The altitude dessert course — ingredients from 4,100m — featured a sweet made from mountain herbs I''ve never tasted anywhere else. The kitchen is open and the team is almost entirely Peruvian. This is food as geography. The complexity of flavours building across four hours gave me the same feeling I get watching a mountain range come into view on a long approach — something earned and enormous. Dinner runs about $200pp with the beverage pairing.',
   'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop&q=80',
   'Miraflores, Lima', 'restaurant',
   'https://www.agoda.com/search?city=Lima&q=Central+Restaurant&cid=1786118',
   3760, NOW() - INTERVAL '15 days'),

  (uuid_generate_v4(),
   'c1000000-0000-0000-0000-000000000003',
   'Osteria Francescana, Modena',
   'I made the reservation for Osteria Francescana eleven months in advance and changed my entire Italian itinerary around the date. Massimo Bottura''s three-Michelin-star restaurant in Modena seats 28 people in a space that feels like a private art collection — major works by Hirst and Cattelan hang between the tables as though you''ve wandered into a gallery that happens to serve dinner. The five ages of Parmigiano Reggiano — a single ingredient in five textures and temperatures simultaneously — is the most celebrated dish and deserves every word written about it: foam, soufflé, wafer, cream, and crisp, in five small vessels. I am Japanese, and I recognised immediately in Bottura''s cooking the same philosophy that drives great kaiseki: absolute mastery of one ingredient, no decoration for its own sake. The Oops! I Dropped the Lemon Tart — a deliberately broken dessert — is performance art. Dinner is €370pp without wine. I would fly to Modena for this alone.',
   'https://images.unsplash.com/photo-1493476423342-9f85c3843c80?w=800&h=600&fit=crop&q=80',
   'Modena, Italy', 'restaurant',
   'https://www.agoda.com/search?city=Modena&q=Osteria+Francescana&cid=1786118',
   6740, NOW() - INTERVAL '21 days'),

  (uuid_generate_v4(),
   'c1000000-0000-0000-0000-000000000004',
   'Quintonil, Mexico City',
   'We discovered Quintonil on our third night in Mexico City, recommended by a food editor friend who told us to skip the famous names and go here instead. Jorge Vallejo''s cooking in Polanco is the most exciting food I''ve eaten anywhere in the last two years — progressive Mexican cuisine built around wild herbs, ancestral grains, and produce from the restaurant''s own roof garden. The tasting menu changes with the season; when we visited in November the standout course was an epazote and huitlacoche tostada with a mole negro that had been cooking for forty-eight hours. The complexity of it — more than a hundred ingredients in a single bite — was almost incomprehensible. The dining room is calm and airy in natural wood and warm terracotta, with windows looking into the kitchen garden. Service is impeccable without being stiff. The twelve-course menu is about MXN 2,800pp. I''ve eaten in sixty countries and this is one of the ten best meals of my life.',
   'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&h=600&fit=crop&q=80',
   'Polanco, Mexico City', 'restaurant',
   'https://www.agoda.com/search?city=Mexico+City&q=Quintonil&cid=1786118',
   2890, NOW() - INTERVAL '6 days')

ON CONFLICT (id) DO NOTHING;


-- ── Destinations ─────────────────────────────────────────────

INSERT INTO public.posts (id, user_id, title, description, photo_url, location, category, agoda_hotel_id, likes, created_at) VALUES

  (uuid_generate_v4(),
   'c1000000-0000-0000-0000-000000000004',
   'Cappadocia, Turkey',
   'This place completely changed how I see travel. I''d seen photographs of the Cappadocian landscape my whole life — the balloons rising over the fairy chimneys at sunrise is probably one of the five most-shared images on the internet — but nothing prepares you for standing in Göreme valley at 5:30am watching sixty balloons lift off simultaneously in complete silence. We stayed in a cave hotel carved into the volcanic tuff and every morning I climbed to the roof terrace with coffee and watched the sky fill with colour. The best way to understand the scale is to rent a car and drive the Rose Valley at dusk — the rock formations turn deep amber in the late light. The underground cities of Derinkuyu go eight levels below the surface and were home to thousands of people for centuries; walking through them by torchlight is genuinely one of the most extraordinary things I''ve done. Go in October or April — summers are crowded and winters freeze. Stay at least four nights, five if you can.',
   'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&h=600&fit=crop&q=80',
   'Göreme, Cappadocia', 'destination',
   'https://www.agoda.com/search?city=Cappadocia&cid=1786118',
   7840, NOW() - INTERVAL '2 days'),

  (uuid_generate_v4(),
   'c1000000-0000-0000-0000-000000000005',
   'Faroe Islands',
   'This place completely changed how I see photography. I took the overnight ferry from Bergen to Tórshavn in March and I haven''t stopped thinking about it since. The Faroe Islands sit in the gap between Norway and Iceland and the landscape is so extreme it looks like a set designer''s attempt to illustrate the word remote — vertical sea cliffs dropping 300 metres to the ocean, grass-roofed villages clinging to hillsides above fjords, waterfalls that fall sideways in the constant wind. I spent eight days with a rental car and a tripod and barely scratched the surface. The drive to Gásadalur — a village of sixteen people reachable until 2006 only by mountain footpath — ends with a view of a waterfall flowing over a cliff directly into the ocean. The Sørvágsvatn lake appears to float above the sea from the right angle. There are no crowds here, ever. Accommodation is simple — farm stays and small guesthouses — and the local lamb is the best I''ve eaten anywhere.',
   'https://images.unsplash.com/photo-1520453803296-c39eabe2dab4?w=800&h=600&fit=crop&q=80',
   'Tórshavn, Faroe Islands', 'destination',
   'https://www.agoda.com/search?city=Faroe+Islands&cid=1786118',
   5120, NOW() - INTERVAL '10 days'),

  (uuid_generate_v4(),
   'c1000000-0000-0000-0000-000000000002',
   'Torres del Paine, Patagonia',
   'I have a simple benchmark for whether a place is worth the journey: does it change how I see everything else afterwards? Torres del Paine changed everything. I hiked the full W circuit over five days in November — the last week before the summer crowds — and the scale is beyond any photograph I''ve seen. The towers themselves are 2,500-metre granite pillars that rise vertically from the landscape; at dawn on a clear morning they turn pink and then gold and the reflection in the lake below is so perfect it looks composited. I cried. I''m telling you this because it''s true: I''ve photographed six continents and I cried looking at a mountain. Glacier Grey calves blue ice into the lake and in the early morning you hear it fall. The wind in Patagonia is constant and sometimes violent — bring everything rated for 100km/h gusts. Go in November–December or February–March. Accept that the weather will do what it wants. The rewards are enormous.',
   'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&h=600&fit=crop&q=80',
   'Torres del Paine, Chile', 'destination',
   'https://www.agoda.com/search?city=Patagonia&cid=1786118',
   8350, NOW() - INTERVAL '17 days'),

  (uuid_generate_v4(),
   'c1000000-0000-0000-0000-000000000001',
   'Rajasthan, India',
   'I grew up in Mumbai and always told myself I''d do Rajasthan properly when I had time. Twenty-seven years later I finally did it right — twelve days, a private driver, no fixed itinerary beyond the major cities. Rajasthan is the most visually overwhelming place I''ve experienced in my own country. Jaipur''s City Palace in early morning light, before the tour groups arrive, is a revelation. Jodhpur''s blue city, seen from Mehrangarh Fort at sunset, turns every shade of indigo as the light drops. But the most extraordinary place is Jaisalmer — a living, inhabited 12th-century fort rising from the Thar Desert. I stayed inside the fort walls in a haveli that has been in the same family for six generations and woke at 4am to watch the desert turn gold. The camel safari into the Sam Sand Dunes at sunset is touristy and unmissable. Eat dal baati churma everywhere. Best time: October to March — summer is genuinely dangerous. Hire a private driver for the full circuit.',
   'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=800&h=600&fit=crop&q=80',
   'Jaipur, Rajasthan', 'destination',
   'https://www.agoda.com/search?city=Jaipur&cid=1786118',
   4560, NOW() - INTERVAL '8 days'),

  (uuid_generate_v4(),
   'c1000000-0000-0000-0000-000000000003',
   'Ha Long Bay, Vietnam',
   'I arrived at Ha Long Bay expecting a postcard and found something stranger and more beautiful. The bay contains nearly 2,000 limestone islands eroded into shapes that defy description — not mountains, not quite islands, something between the two, covered in jungle and rising vertically from water so still it mirrors everything perfectly. We chartered a small junk for three nights and moved at the pace of the tides. The crew cooked our meals on deck — fresh squid pulled from the water that morning, morning glory with garlic, congee with crab. On the second night I sat on the bow at 2am and there was no sound except the boat moving and the occasional call of something in the jungle on the nearest island. The caves — Hang Sung Sot is the largest — are lit in colour that should feel kitsch and instead feels genuinely overwhelming. The limestone formations inside are so alien and so beautiful simultaneously that my notebook from that morning contains nothing but the word impossible written over and over. Go in March or April before the summer humidity arrives.',
   'https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=800&h=600&fit=crop&q=80',
   'Ha Long Bay, Vietnam', 'destination',
   'https://www.agoda.com/search?city=Ha+Long+Bay&cid=1786118',
   6230, NOW() - INTERVAL '13 days')

ON CONFLICT (id) DO NOTHING;


-- ── Flights ───────────────────────────────────────────────────

INSERT INTO public.posts (id, user_id, title, description, photo_url, location, category, agoda_hotel_id, likes, created_at) VALUES

  (uuid_generate_v4(),
   'c1000000-0000-0000-0000-000000000003',
   'Singapore Airlines Business Class — SIN to LHR',
   'Flying from Singapore to London on Singapore Airlines business class is thirteen hours of the best commercial aviation in the world, and I say that having taken this route four times deliberately. The new A350 cabin converts to a fully flat 23-inch-wide bed that I can actually sleep on — face down, not contorted — which at 167cm I appreciate more than I can say. The Book the Cook service lets you pre-order proper meals: I had the satay at takeoff (they grill it in the galley, the smell travels forward through the cabin), the cold lobster with Krug at hour three, and kaya toast for breakfast three hours out from Heathrow. The entertainment system has 1,800 hours of content. What makes Singapore Airlines different is the consistency — the seats are the same standard everywhere on the aircraft, the food is cooked properly every time, the crew remember how you take your coffee without being told twice. I now reroute any longhaul trip via Singapore just to fly this airline. Book at least six weeks out and request Seat 11A on the A350.',
   'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop&q=80',
   'Singapore → London', 'flight',
   'https://www.agoda.com/search?city=London&cid=1786118',
   3180, NOW() - INTERVAL '19 days'),

  (uuid_generate_v4(),
   'c1000000-0000-0000-0000-000000000004',
   'Emirates First Class — DXB to JFK',
   'I''ve been flying through Dubai for fifteen years and I finally upgraded to Emirates First Class on the A380 to New York. Twelve hours and fourteen minutes from Dubai to JFK in a private suite with a closing door, a minibar, and a bed that is six feet eight inches long. The shower is not a gimmick — you book a 5-minute slot, the hot water pressure is excellent, and arriving into JFK having showered at 30,000 feet is one of the stranger and more pleasant experiences in modern travel. The Dom Pérignon is poured before takeoff. The on-demand menu runs to forty dishes; I had the Arabic mezze and then the slow-roasted lamb with saffron rice at hour four and slept for five hours on a real bed. The crew in first class on Emirates operate on a completely different level — attentive without hovering, present without announcing themselves. The catch: this suite costs around $8,000 one way. Business class on the same aircraft is $4,000 and 85% as good. I''m telling you about First anyway because you should know it exists.',
   'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=800&h=600&fit=crop&q=80',
   'Dubai → New York', 'flight',
   'https://www.agoda.com/search?city=New+York&cid=1786118',
   4710, NOW() - INTERVAL '24 days'),

  (uuid_generate_v4(),
   'c1000000-0000-0000-0000-000000000002',
   'LATAM — Santiago to Easter Island',
   'Flying from Santiago to Easter Island on LATAM is five hours over the South Pacific to one of the most remote inhabited places on earth — the nearest continental land is 3,500km away in any direction. The flight itself is economy, fine, unremarkable except for the point when the screen map shows your tiny aircraft moving across an entirely blue ocean with no land visible for three hours. I had a window seat and stared out for most of it. Arriving at Mataveri Airport — a single runway surrounded by grass and moai — is one of the great landings in commercial aviation: the runway ends 300 metres from the Pacific Ocean and you touch down with the sea filling the windshield. LATAM is the only airline that flies this route; flights from Santiago cost around $400–600 return and run daily in peak season. Easter Island has no chain hotels, no traffic lights, and 900 moai scattered across an island you can drive end to end in forty minutes. The five-hour flight to get there is already part of the experience.',
   'https://images.unsplash.com/photo-1517058337701-8e6b4c05c1ba?w=800&h=600&fit=crop&q=80',
   'Santiago → Easter Island', 'flight',
   'https://www.agoda.com/search?city=Easter+Island&cid=1786118',
   2640, NOW() - INTERVAL '30 days'),

  (uuid_generate_v4(),
   'c1000000-0000-0000-0000-000000000005',
   'Finnair Business Class — HEL to NRT',
   'I flew Finnair''s Helsinki to Tokyo route specifically because it''s one of the shortest paths between Europe and Japan — eight hours and forty minutes over the Arctic Circle, cutting the standard European Asia flight by nearly two hours. At hour three we were somewhere over Siberia at 36,000 feet and the northern lights were visible below the aircraft, green and pink, filling the lower half of my window. I''ve photographed them eleven times on this route and never posted because no image of it has ever looked real. The Finnair long-haul business class is good, not exceptional — the lie-flat bed is comfortable at 76 inches, the Finnish design details (the Marimekko blanket, the birch-wood tray holder) are genuinely charming, and the breakfast before Tokyo arrival is proper Finnish porridge with lingonberries, which I did not expect to appreciate as much as I did. The thing that makes this route special is the arc it traces over the top of the world. Fly it at least once.',
   'https://images.unsplash.com/photo-1529074963764-98f45c47344b?w=800&h=600&fit=crop&q=80',
   'Helsinki → Tokyo', 'flight',
   'https://www.agoda.com/search?city=Tokyo&cid=1786118',
   1840, NOW() - INTERVAL '26 days'),

  (uuid_generate_v4(),
   'c1000000-0000-0000-0000-000000000001',
   'Qantas Business Class — SYD to LHR',
   'I was in Sydney for a food festival and faced the choice of flying home to Mumbai via Singapore or taking the Qantas direct to London and connecting onward. I chose London and it was one of the better decisions I''ve made. Qantas business class on the 787 Dreamliner from Sydney to Heathrow is twenty-two hours and fifteen minutes — the longest scheduled flight I''ve ever taken — but the forward-facing flat bed and the Rockpool-designed menu made it tolerable in a way almost no other airline could manage at that length. The cabin has pods that alternate between aisle and window; I had 14A with the direct window and the view over Central Australia at dawn, when the red desert goes almost orange, was worth booking for alone. The sleep was genuine — I got six hours straight — and the pasta at the midway meal was better than most pasta I''ve eaten on the ground. The service crew on Qantas longhaul is consistently the friendliest in the world, not in a performed way but in an actual way.',
   'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=800&h=600&fit=crop&q=80',
   'Sydney → London', 'flight',
   'https://www.agoda.com/search?city=London&cid=1786118',
   2290, NOW() - INTERVAL '35 days')

ON CONFLICT (id) DO NOTHING;


-- ── Verify ────────────────────────────────────────────────────
SELECT
  (SELECT COUNT(*) FROM public.users) AS total_users,
  (SELECT COUNT(*) FROM public.posts) AS total_posts,
  (SELECT COUNT(*) FROM public.posts WHERE category = 'hotel')       AS hotels,
  (SELECT COUNT(*) FROM public.posts WHERE category = 'restaurant')  AS restaurants,
  (SELECT COUNT(*) FROM public.posts WHERE category = 'destination') AS destinations,
  (SELECT COUNT(*) FROM public.posts WHERE category = 'flight')      AS flights;
