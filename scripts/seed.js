#!/usr/bin/env node

/**
 * Mebira Database Seed Script
 *
 * Populates the database with 6 realtors and 20 property posts.
 * Uses Supabase service role key to bypass RLS.
 *
 * Usage: node scripts/seed.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Realtors ──

const realtors = [
  {
    id: randomUUID(),
    email: 'agent1@mebira.pro',
    username: 'miami_realty',
    avatar: 'https://i.pravatar.cc/150?u=miami_realty',
    bio: 'Miami luxury condo specialist. 12 years in Brickell, Edgewater & Miami Beach. DM for off-market deals.',
    followers: 4200,
  },
  {
    id: randomUUID(),
    email: 'agent2@mebira.pro',
    username: 'luxe_listings_la',
    avatar: 'https://i.pravatar.cc/150?u=luxe_listings_la',
    bio: 'LA real estate. Beverly Hills, Malibu, Hollywood Hills. Representing buyers & sellers of iconic properties.',
    followers: 8900,
  },
  {
    id: randomUUID(),
    email: 'agent3@mebira.pro',
    username: 'nyc_homes',
    avatar: 'https://i.pravatar.cc/150?u=nyc_homes',
    bio: 'New York City apartments & penthouses. Manhattan, Brooklyn, Queens. Your city, your home.',
    followers: 6100,
  },
  {
    id: randomUUID(),
    email: 'agent4@mebira.pro',
    username: 'dubai_properties',
    avatar: 'https://i.pravatar.cc/150?u=dubai_properties',
    bio: 'Dubai real estate expert. Palm Jumeirah villas, Downtown apartments, investment properties.',
    followers: 15200,
  },
  {
    id: randomUUID(),
    email: 'agent5@mebira.pro',
    username: 'barcelona_living',
    avatar: 'https://i.pravatar.cc/150?u=barcelona_living',
    bio: 'Barcelona & Costa Brava specialist. Modernista apartments, beachfront penthouses, countryside estates.',
    followers: 3800,
  },
  {
    id: randomUUID(),
    email: 'agent6@mebira.pro',
    username: 'lisbon_nest',
    avatar: 'https://i.pravatar.cc/150?u=lisbon_nest',
    bio: 'Lisbon property advisor. Alfama, Chiado, Cascais. Helping expats find their Portuguese dream home.',
    followers: 2900,
  },
];

// ── Posts ──

function makePosts(agents) {
  const [miami, la, nyc, dubai, barcelona, lisbon] = agents;

  return [
    // Apartments (4)
    {
      user_id: miami.id,
      title: 'Stunning 2BR in Brickell with Bay Views',
      description: 'Floor-to-ceiling windows overlooking Biscayne Bay. Modern finishes, Italian kitchen, resort-style amenities. Walking distance to Brickell City Centre. Perfect for young professionals or investors.',
      location: 'Brickell, Miami',
      category: 'apartment',
      photo_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    },
    {
      user_id: nyc.id,
      title: 'Tribeca Loft — 1,800 sqft Open Floor Plan',
      description: 'Exposed brick, 12-foot ceilings, original cast iron columns. This classic Tribeca conversion has been meticulously updated with chef kitchen and spa bath. One block from Hudson River Park.',
      location: 'Tribeca, Manhattan',
      category: 'apartment',
      photo_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    },
    {
      user_id: dubai.id,
      title: 'Downtown Dubai 3BR with Burj Khalifa View',
      description: 'Premium 2,400 sqft apartment in Boulevard Point. Direct Burj Khalifa and fountain views from every room. Smart home, private elevator lobby, two parking spots.',
      location: 'Downtown Dubai',
      category: 'apartment',
      photo_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
    },
    {
      user_id: barcelona.id,
      title: 'Modernista Gem in Eixample — 3BR',
      description: 'Original Catalan hydraulic tiles, restored iron balconies, and a private terrace overlooking Passeig de Gracia. This 1905 building has been lovingly restored with modern comforts.',
      location: 'Eixample, Barcelona',
      category: 'apartment',
      photo_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    },

    // Houses (4)
    {
      user_id: la.id,
      title: 'Mid-Century Modern in Silver Lake',
      description: 'Iconic 1958 post-and-beam with walls of glass opening to a canyon view. 3BR/2BA, original terrazzo floors, updated kitchen. The indoor-outdoor living LA dreams are made of.',
      location: 'Silver Lake, Los Angeles',
      category: 'house',
      photo_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    },
    {
      user_id: miami.id,
      title: 'Coral Gables Family Home — 4BR Pool',
      description: 'Mediterranean-style home on a tree-lined street. 3,200 sqft, updated kitchen, impact windows, heated pool with summer kitchen. Top-rated school district.',
      location: 'Coral Gables, Miami',
      category: 'house',
      photo_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    },
    {
      user_id: lisbon.id,
      title: 'Cascais Townhouse Steps from the Beach',
      description: 'Charming 3-story townhouse in the heart of Cascais old town. Rooftop terrace with ocean views, courtyard garden, recently renovated with traditional azulejo tiles.',
      location: 'Cascais, Lisbon',
      category: 'house',
      photo_url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
    },
    {
      user_id: nyc.id,
      title: 'Brooklyn Brownstone — Park Slope',
      description: 'Classic 4-story brownstone with original details. 5BR, garden level rental unit, private backyard. Two blocks from Prospect Park. The ultimate Brooklyn family home.',
      location: 'Park Slope, Brooklyn',
      category: 'house',
      photo_url: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800',
    },

    // Villas (4)
    {
      user_id: dubai.id,
      title: 'Palm Jumeirah Signature Villa — 6BR',
      description: 'Beachfront villa on the Palm with private pool, cinema room, staff quarters. 12,000 sqft of pure luxury on one of the most exclusive addresses in the world.',
      location: 'Palm Jumeirah, Dubai',
      category: 'villa',
      photo_url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
    },
    {
      user_id: la.id,
      title: 'Malibu Cliffside Estate — Ocean Views',
      description: 'Perched above Carbon Beach with 180-degree Pacific views. 5BR, infinity pool, wine cellar, private beach access. Architecture by a Pritzker Prize winner.',
      location: 'Malibu, Los Angeles',
      category: 'villa',
      photo_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    },
    {
      user_id: barcelona.id,
      title: 'Costa Brava Waterfront Estate',
      description: 'Private cove, 8,000 sqft Mediterranean villa with infinity pool and direct sea access. 6BR, landscaped gardens, separate guest house. 45 minutes from Barcelona.',
      location: 'Costa Brava, Girona',
      category: 'villa',
      photo_url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800',
    },
    {
      user_id: lisbon.id,
      title: 'Sintra Palace Estate — 19th Century',
      description: 'Historic estate in the UNESCO-listed hills of Sintra. 10BR, chapel, manicured gardens, vineyard. A rare opportunity to own a piece of Portuguese aristocratic heritage.',
      location: 'Sintra, Lisbon',
      category: 'villa',
      photo_url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    },

    // Commercial (3)
    {
      user_id: miami.id,
      title: 'Wynwood Retail Space — 2,500 sqft',
      description: 'Prime corner location in the heart of Wynwood Arts District. High foot traffic, street-level with mezzanine. Previous tenant was a gallery. Ready for build-out.',
      location: 'Wynwood, Miami',
      category: 'commercial',
      photo_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    },
    {
      user_id: dubai.id,
      title: 'DIFC Office — Grade A Tower',
      description: 'Fully fitted office in the Dubai International Financial Centre. 4,200 sqft, 15 workstations, 3 meeting rooms, pantry. Views of Emirates Towers.',
      location: 'DIFC, Dubai',
      category: 'commercial',
      photo_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
    },
    {
      user_id: nyc.id,
      title: 'SoHo Mixed-Use Building — 5 Stories',
      description: 'Cast-iron building with ground-floor retail and 4 residential units above. Fully leased, strong cap rate. Landmark district — irreplaceable location.',
      location: 'SoHo, Manhattan',
      category: 'commercial',
      photo_url: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=800',
    },

    // Land (2)
    {
      user_id: la.id,
      title: 'Hollywood Hills Lot — Panoramic Views',
      description: 'Buildable 0.6-acre lot above Sunset Strip with 270-degree city-to-ocean views. Plans approved for a 6,000 sqft contemporary residence. Utilities at the street.',
      location: 'Hollywood Hills, Los Angeles',
      category: 'land',
      photo_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
    },
    {
      user_id: lisbon.id,
      title: 'Algarve Coastal Plot — 2 Acres',
      description: 'South-facing plot with clifftop ocean views near Lagos. Approved for residential construction. Walking distance to Praia de Dona Ana. Last available parcel in the area.',
      location: 'Lagos, Algarve',
      category: 'land',
      photo_url: 'https://images.unsplash.com/photo-1440342359743-84fcb8c21c7c?w=800',
    },

    // Rental (3)
    {
      user_id: miami.id,
      title: 'South Beach Furnished 1BR — Monthly Rental',
      description: 'Turnkey furnished apartment one block from the beach. Rooftop pool, gym, concierge. Available for 3-12 month leases. Perfect for remote workers and digital nomads.',
      location: 'South Beach, Miami',
      category: 'rental',
      photo_url: 'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=800',
    },
    {
      user_id: barcelona.id,
      title: 'Gothic Quarter Studio — Short-Term',
      description: 'Beautifully designed studio in a 15th-century building. Exposed stone walls, designer furniture, walk to everything. Licensed for tourist rental with strong ROI.',
      location: 'Gothic Quarter, Barcelona',
      category: 'rental',
      photo_url: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800',
    },
    {
      user_id: dubai.id,
      title: 'Marina Walk 2BR — Fully Furnished',
      description: 'High-floor furnished apartment with full marina views. Walk-in closets, smart home system, access to beach club. Available immediately, flexible lease terms.',
      location: 'Dubai Marina',
      category: 'rental',
      photo_url: 'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800',
    },
  ];
}

// ── Main ──

async function main() {
  console.log('='.repeat(50));
  console.log('  Mebira Database Seed');
  console.log('='.repeat(50));

  // Step 1: Insert realtors
  console.log('\n[1/2] Inserting 6 realtors...');
  const { error: usersError } = await supabase
    .from('users')
    .upsert(realtors, { onConflict: 'email' });

  if (usersError) {
    console.error('  Users insert failed:', usersError.message);
    process.exit(1);
  }
  console.log('  6 realtors inserted');
  for (const r of realtors) {
    console.log(`    @${r.username} — ${r.bio.substring(0, 50)}...`);
  }

  // Step 2: Insert posts
  console.log('\n[2/2] Inserting 20 posts...');
  const posts = makePosts(realtors);

  const { error: postsError } = await supabase
    .from('posts')
    .insert(posts);

  if (postsError) {
    console.error('  Posts insert failed:', postsError.message);
    console.error('  Detail:', JSON.stringify(postsError));
    process.exit(1);
  }
  console.log(`  ${posts.length} posts inserted`);

  // Verify counts
  const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
  const { count: postCount } = await supabase.from('posts').select('*', { count: 'exact', head: true });

  console.log('\n' + '='.repeat(50));
  console.log('  DONE');
  console.log('='.repeat(50));
  console.log(`  Users: ${userCount}`);
  console.log(`  Posts: ${postCount}`);
  console.log('='.repeat(50));
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
