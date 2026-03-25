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
    price: row.starting_price ? `$${Number(row.starting_price).toFixed(0)}` : undefined,
  };
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

  // Handle USA / United States synonym
  const usaVariants = ['usa', 'united states'];
  const qLower = q.toLowerCase();
  const isUSA = usaVariants.some((v) => qLower.includes(v));
  const orFilter = isUSA
    ? `title.ilike.${wild},location.ilike.${wild},description.ilike.${wild},location.ilike.%United States%,location.ilike.%USA%`
    : `title.ilike.${wild},location.ilike.${wild},description.ilike.${wild}`;

  const { data, error } = await supabase
    .from('posts')
    .select('*, starting_price, users(id, username, avatar, bio, followers, earnings)')
    .or(orFilter)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ posts: [], hasMore: false }, { status: 500 });
  }

  return NextResponse.json({
    posts: (data ?? []).map(mapRow),
    hasMore: (data?.length ?? 0) === limit,
  });
}
