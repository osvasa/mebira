import { createClient } from '@/lib/supabase/server';
import { Post, User, TrendingDestination, Story } from '@/lib/types';
import { EXPEDIA_URL } from '@/lib/agoda';

// Format username → display name: "tokyo_tales" → "Tokyo Tales"
function toDisplayName(username: string): string {
  return username
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Extract the last segment of a location: "Ubud, Bali" → "Bali"
function extractRegion(location: string): string {
  const parts = location.split(',');
  return parts[parts.length - 1].trim();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapUser(row: any): User {
  return {
    id: row.id,
    username: row.username,
    displayName: toDisplayName(row.username),
    avatar:
      row.avatar ??
      `https://ui-avatars.com/api/?name=${encodeURIComponent(row.username)}&background=0ea5e9&color=fff`,
    bio: row.bio ?? '',
    followerCount: row.followers ?? 0,
    followingCount: 0,
    postCount: 0,
    totalEarnings: parseFloat(row.earnings ?? '0'),
    isAI: false,
    isVerified: (row.followers ?? 0) >= 20000,
    isFollowing: false,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPost(row: any): Post {
  const expediaUrl =
    typeof row.expedia_url === 'string' && row.expedia_url.startsWith('http')
      ? row.expedia_url
      : EXPEDIA_URL;

  const user = row.users
    ? mapUser(row.users)
    : { id: row.user_id, username: 'unknown', displayName: 'Unknown', avatar: '', bio: '', followerCount: 0, followingCount: 0, postCount: 0, totalEarnings: 0, isAI: false, isVerified: false, isFollowing: false };

  return {
    id: row.id,
    user,
    image:
      row.photo_url ??
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&h=675&fit=crop&q=85',
    location: row.location,
    country: extractRegion(row.location),
    countryCode: '',
    category: row.category,
    title: row.title,
    description: row.description,
    expediaUrl,
    likeCount: row.likes ?? 0,
    commentCount: 0,
    shareCount: 0,
    isLiked: false,
    isSaved: false,
    createdAt: row.created_at,
    tags: [],
    videoUrl: row.video_url ?? undefined,
    price: row.starting_price ? `$${Number(row.starting_price).toFixed(0)}` : undefined,
  };
}

// Deterministic shuffle using a numeric seed (Mulberry32 PRNG)
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  let s = seed | 0;
  function rand() {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export async function fetchPosts(seed: number): Promise<Post[]> {
  let supabase: Awaited<ReturnType<typeof createClient>>;
  try {
    supabase = await createClient();
  } catch (e) {
    console.error('[fetchPosts] createClient threw:', e);
    return [];
  }

  const { data, error } = await supabase
    .from('posts')
    .select('*, starting_price, users(id, username, avatar, bio, followers, earnings)');

  if (error) { console.error('[fetchPosts] full error:', error); return []; }
  if (!data) return [];
  return seededShuffle(data.map(mapPost), seed);
}

export { seededShuffle };

export async function fetchSuggestedUsers(): Promise<User[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('users')
    .select('id, username, avatar, bio, followers, earnings')
    .order('followers', { ascending: false })
    .limit(3);

  if (error) { console.error('[fetchSuggestedUsers]', error.message); return []; }
  if (!data) return [];
  return data.map(mapUser);
}

export async function fetchTrendingDestinations(): Promise<TrendingDestination[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('posts')
    .select('location, country');

  if (error) { console.error('[fetchTrendingDestinations]', error.message); return []; }
  if (!data) return [];

  // Group by location (precise city/place)
  const locationMap = new Map<string, { count: number; country: string }>();
  for (const row of data) {
    const loc = row.location;
    if (!loc) continue;
    const existing = locationMap.get(loc);
    locationMap.set(loc, {
      count: (existing?.count ?? 0) + 1,
      country: row.country || '',
    });
  }

  return Array.from(locationMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 4)
    .map(([name, { count, country }], i) => ({
      id: `trending-${i}`,
      name,
      country,
      image: DESTINATION_IMAGES[country] || '',
      postCount: count,
    }));
}

// Curated destination images keyed by country name
const DESTINATION_IMAGES: Record<string, string> = {
  'United States': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80',
  'United Kingdom': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
  'France': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
  'Italy': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80',
  'Indonesia': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
  'Japan': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
  'Vietnam': 'https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=800&q=80',
  'Singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80',
  'Turkey': 'https://images.unsplash.com/photo-1527838832700-5059252407fa?w=800&q=80',
  'Denmark': 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=800&q=80',
  'Thailand': 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80',
  'Peru': 'https://images.unsplash.com/photo-1531968455001-5c5272a67c71?w=800&q=80',
  'India': 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=800&q=80',
  'Mexico': 'https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?w=800&q=80',
  'Chile': 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80',
  'Argentina': 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800&q=80',
  'China': 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&q=80',
  'Saudi Arabia': 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=800&q=80',
  'United Arab Emirates': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
  'Greece': 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80',
  'Maldives': 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80',
  'Spain': 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800&q=80',
  'Australia': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&q=80',
  'Brazil': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80',
  'Bahamas': 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=800&q=80',
  'French Polynesia': 'https://images.unsplash.com/photo-1589979481223-deb893043163?w=800&q=80',
  'Switzerland': 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&q=80',
  'Bora Bora, French Polynesia': 'https://images.unsplash.com/photo-1589979481223-deb893043163?w=800&q=80',
};

// Build stories from live posts: one card per unique country, up to 7
// Only include countries that have a curated image in DESTINATION_IMAGES
export async function buildStories(): Promise<Story[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('posts')
    .select('id, country, user_id, users(id, username, avatar, bio, followers, earnings)')
    .order('created_at', { ascending: false });

  if (!data) return [];

  const seen = new Set<string>();
  const stories: Story[] = [];
  for (const row of data) {
    const country = row.country;
    if (!country) continue;
    const image = DESTINATION_IMAGES[country];
    if (!image || seen.has(country) || stories.length >= 7) continue;
    seen.add(country);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = row.users ? mapUser(row.users as any) : { id: row.user_id, username: 'unknown', displayName: 'Unknown', avatar: '', bio: '', followerCount: 0, followingCount: 0, postCount: 0, totalEarnings: 0, isAI: false, isVerified: false, isFollowing: false };
    stories.push({
      id: `story-${row.id}`,
      user,
      destination: country,
      image,
    });
  }
  return stories;
}

// Fetch posts for explore grid with optional category filter and pagination
export async function fetchExplorePosts(
  category?: string,
  offset = 0,
  limit = 20
): Promise<Post[]> {
  const supabase = await createClient();
  let query = supabase
    .from('posts')
    .select('*, starting_price, users(id, username, avatar, bio, followers, earnings)')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) { console.error('[fetchExplorePosts]', error.message); return []; }
  if (!data) return [];
  return data.map(mapPost);
}
