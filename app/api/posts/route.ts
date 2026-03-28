import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { EXPEDIA_URL } from '@/lib/agoda';
import { seededShuffle } from '@/lib/supabase/queries';

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
    price: row.price ?? undefined,
    bedrooms: row.bedrooms ?? undefined,
    bathrooms: row.bathrooms ?? undefined,
    sizeSqft: row.size_sqft ?? undefined,
  };
}

// PATCH — update a post (creator can only edit their own)
export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { postId, title, description, location, category, expedia_url } = body;

  if (!postId) {
    return NextResponse.json({ error: 'postId required' }, { status: 400 });
  }

  // Verify ownership: fetch the post's user_id from the users table via auth
  const { data: userRow } = await supabase
    .from('users')
    .select('id')
    .eq('email', authData.user.email)
    .maybeSingle();

  if (!userRow) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Only update if the post belongs to this user
  const { data: post } = await supabase
    .from('posts')
    .select('user_id')
    .eq('id', postId)
    .maybeSingle();

  if (!post || post.user_id !== userRow.id) {
    return NextResponse.json({ error: 'You can only edit your own posts' }, { status: 403 });
  }

  const { error } = await supabase
    .from('posts')
    .update({
      title: title ?? undefined,
      description: description ?? undefined,
      location: location ?? undefined,
      category: category ?? undefined,
      expedia_url: expedia_url ?? undefined,
    })
    .eq('id', postId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const offset = parseInt(searchParams.get('offset') ?? '0', 10);
  const limit = parseInt(searchParams.get('limit') ?? '10', 10);
  const seed = parseInt(searchParams.get('seed') ?? '0', 10);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('posts')
    .select('*, users(id, username, avatar, bio, followers, earnings)');

  if (error) {
    return NextResponse.json({ posts: [], hasMore: false }, { status: 500 });
  }

  const all = seededShuffle((data ?? []).map(mapRow), seed);
  const page = all.slice(offset, offset + limit);

  return NextResponse.json({
    posts: page,
    hasMore: offset + limit < all.length,
  });
}
