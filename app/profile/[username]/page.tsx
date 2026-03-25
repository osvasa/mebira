import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProfileClient } from '@/components/profile/ProfileClient';
import { EXPEDIA_URL } from '@/lib/agoda';

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

function toDisplayName(username: string): string {
  return username.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function extractRegion(location: string): string {
  const parts = location.split(',');
  return parts[parts.length - 1].trim();
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const supabase = await createClient();

  // Fetch user
  const { data: userRow } = await supabase
    .from('users')
    .select('id, username, avatar, bio, followers, earnings')
    .eq('username', username)
    .maybeSingle();

  if (!userRow) return notFound();

  // Fetch user's posts
  const { data: postRows } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', userRow.id)
    .order('created_at', { ascending: false });

  // Count following
  const { count: followingCount } = await supabase
    .from('follows')
    .select('id', { count: 'exact', head: true })
    .eq('follower_id', userRow.id);

  const user = {
    id: userRow.id,
    username: userRow.username,
    displayName: toDisplayName(userRow.username),
    avatar: userRow.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(userRow.username)}&background=0ea5e9&color=fff`,
    bio: userRow.bio ?? '',
    followerCount: userRow.followers ?? 0,
    followingCount: followingCount ?? 0,
    postCount: postRows?.length ?? 0,
    totalEarnings: parseFloat(userRow.earnings ?? '0'),
    isAI: false,
    isVerified: (userRow.followers ?? 0) >= 20000,
    isFollowing: false,
    coverImage: '',
  };

  const posts = (postRows ?? []).map((row) => {
    const expediaUrl =
      typeof row.expedia_url === 'string' && row.expedia_url.startsWith('http')
        ? row.expedia_url
        : EXPEDIA_URL;

    return {
      id: row.id,
      user,
      image: row.photo_url ?? null,
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
    };
  });

  return (
    <ProfileClient
      user={user}
      posts={posts}
      postCount={user.postCount}
      followerCount={user.followerCount}
      followingCount={user.followingCount}
    />
  );
}
