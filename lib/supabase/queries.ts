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
    price: row.starting_price ? `$${Number(row.starting_price).toFixed(0)}` : (row.price ? `$${row.price}` : undefined),
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
    .select('*, users(id, username, avatar, bio, followers, earnings)');

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
    .select('location, country, photo_url');

  if (error) { console.error('[fetchTrendingDestinations]', error.message); return []; }
  if (!data) return [];

  // Group by location — keep first photo_url as thumbnail
  const locationMap = new Map<string, { count: number; country: string; photo_url: string }>();
  for (const row of data) {
    const loc = row.location;
    if (!loc) continue;
    const existing = locationMap.get(loc);
    locationMap.set(loc, {
      count: (existing?.count ?? 0) + 1,
      country: row.country || '',
      photo_url: existing?.photo_url || row.photo_url || '',
    });
  }

  return Array.from(locationMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 6)
    .map(([name, { count, country, photo_url }], i) => ({
      id: `trending-${i}`,
      name,
      country,
      image: photo_url || DESTINATION_IMAGES[country] || DEFAULT_DESTINATION_IMAGE,
      postCount: count,
    }));
}

// Curated destination images keyed by country name (Pexels static URLs)
const DESTINATION_IMAGES: Record<string, string> = {
  'United States': 'https://images.pexels.com/photos/1239162/pexels-photo-1239162.jpeg?w=300',
  'United Arab Emirates': 'https://images.pexels.com/photos/1470405/pexels-photo-1470405.jpeg?w=300',
  'Spain': 'https://images.pexels.com/photos/819764/pexels-photo-819764.jpeg?w=300',
  'Portugal': 'https://images.pexels.com/photos/1534560/pexels-photo-1534560.jpeg?w=300',
  'United Kingdom': 'https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?w=300',
  'France': 'https://images.pexels.com/photos/532826/pexels-photo-532826.jpeg?w=300',
  'Italy': 'https://images.pexels.com/photos/1701595/pexels-photo-1701595.jpeg?w=300',
  'Mexico': 'https://images.pexels.com/photos/3290070/pexels-photo-3290070.jpeg?w=300',
  'Japan': 'https://images.pexels.com/photos/590478/pexels-photo-590478.jpeg?w=300',
  'Brazil': 'https://images.pexels.com/photos/2868242/pexels-photo-2868242.jpeg?w=300',
  'Greece': 'https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg?w=300',
  'Australia': 'https://images.pexels.com/photos/1878293/pexels-photo-1878293.jpeg?w=300',
};

const DEFAULT_DESTINATION_IMAGE = 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?w=300';

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
    if (seen.has(country) || stories.length >= 7) continue;
    const image = DESTINATION_IMAGES[country] || DEFAULT_DESTINATION_IMAGE;
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
    .select('*, users(id, username, avatar, bio, followers, earnings)')
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
