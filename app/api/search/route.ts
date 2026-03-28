import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { EXPEDIA_URL } from '@/lib/agoda';

function toDisplayName(username: string): string {
  return username.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function extractRegion(location: string): string {
  const parts = location.split(',');
  return parts[parts.length - 1].trim();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any) {
  const expediaUrl =
    typeof row.expedia_url === 'string' && row.expedia_url.startsWith('http')
      ? row.expedia_url
      : EXPEDIA_URL;

  const u = row.users;
  const user = u
    ? {
        id: u.id,
        username: u.username,
        displayName: toDisplayName(u.username),
        avatar: u.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(u.username)}&background=0ea5e9&color=fff`,
        bio: u.bio ?? '',
        followerCount: u.followers ?? 0,
        followingCount: 0,
        postCount: 0,
        totalEarnings: parseFloat(u.earnings ?? '0'),
        isAI: false,
        isVerified: (u.followers ?? 0) >= 20000,
        isFollowing: false,
      }
    : { id: row.user_id, username: 'unknown', displayName: 'Unknown', avatar: '', bio: '', followerCount: 0, followingCount: 0, postCount: 0, totalEarnings: 0, isAI: false, isVerified: false, isFollowing: false };

  return {
    id: row.id,
    user,
    image: row.photo_url ?? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&h=675&fit=crop&q=85',
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
    price: undefined,
  };
}

// Extract bedroom count from queries like "3 bedroom", "3br", "3 bed"
function extractBedrooms(query: string): number | null {
  const match = query.match(/(\d+)\s*(?:bed(?:room)?s?|br)\b/i);
  return match ? parseInt(match[1], 10) : null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();
  const offset = parseInt(searchParams.get('offset') ?? '0', 10);
  const limit = 50;

  if (!q) {
    return NextResponse.json({ posts: [], hasMore: false });
  }

  const supabase = await createClient();
  const wild = `%${q}%`;
  const qLower = q.toLowerCase();

  // Handle USA / United States synonym
  const usaVariants = ['usa', 'united states'];
  const isUSA = usaVariants.some((v) => qLower.includes(v));

  // Build OR conditions for text matching
  const orParts = [
    `title.ilike.${wild}`,
    `location.ilike.${wild}`,
    `description.ilike.${wild}`,
    `country.ilike.${wild}`,
    `category.ilike.${wild}`,
    `price.ilike.${wild}`,
    `users.username.ilike.${wild}`,
  ];

  if (isUSA) {
    orParts.push(
      'location.ilike.%United States%',
      'location.ilike.%USA%',
      'country.ilike.%United States%',
    );
  }

  const orFilter = orParts.join(',');

  // Primary query: text search across posts + user fields
  const { data, error } = await supabase
    .from('posts')
    .select('*, users!inner(id, username, avatar, bio, followers, earnings)')
    .or(orFilter)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    // Fallback: if !inner join fails (e.g. user filter syntax), retry without user filter
    const fallbackOr = orParts.filter((p) => !p.startsWith('users.')).join(',');
    const { data: fbData, error: fbError } = await supabase
      .from('posts')
      .select('*, users(id, username, avatar, bio, followers, earnings)')
      .or(fallbackOr)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (fbError) {
      return NextResponse.json({ posts: [], hasMore: false }, { status: 500 });
    }

    let results = (fbData ?? []);

    // Apply bedroom filter if present
    const bedroomCount = extractBedrooms(q);
    if (bedroomCount !== null) {
      results = results.filter((r) => r.bedrooms != null && r.bedrooms >= bedroomCount);
    }

    return NextResponse.json({
      posts: results.map(mapRow),
      hasMore: results.length === limit,
    });
  }

  let results = (data ?? []);

  // Apply bedroom filter if query mentions bedrooms
  const bedroomCount = extractBedrooms(q);
  if (bedroomCount !== null) {
    results = results.filter((r) => r.bedrooms != null && r.bedrooms >= bedroomCount);
  }

  return NextResponse.json({
    posts: results.map(mapRow),
    hasMore: results.length === limit,
  });
}
