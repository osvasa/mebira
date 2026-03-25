import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  Heart,
  MessageCircle,
  Bookmark,
  BadgeCheck,
  ExternalLink,
  ArrowLeft,
  Building2,
  UtensilsCrossed,
  Globe,
  Plane,
  Zap,
  Ship,
  type LucideIcon,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { createClient } from '@/lib/supabase/server';
import { formatDistanceToNow, formatNumber } from '@/lib/utils';
import { CommentsSection } from '@/components/post/CommentsSection';
import { ShareButton } from '@/components/post/ShareButton';
import { PostVideoPlayer } from '@/components/post/PostVideoPlayer';


interface PostPageProps {
  params: Promise<{ id: string }>;
}

const categoryConfig: Record<string, { label: string; Icon: LucideIcon; color: string }> = {
  hotel: { label: 'Hotel', Icon: Building2, color: 'text-sky-700 bg-sky-50' },
  restaurant: { label: 'Restaurant', Icon: UtensilsCrossed, color: 'text-orange-700 bg-orange-50' },
  destination: { label: 'Destination', Icon: Globe, color: 'text-emerald-700 bg-emerald-50' },
  flight: { label: 'Flight', Icon: Plane, color: 'text-purple-700 bg-purple-50' },
  activity: { label: 'Activity', Icon: Zap, color: 'text-yellow-700 bg-yellow-50' },
  cruise: { label: 'Cruise', Icon: Ship, color: 'text-cyan-700 bg-cyan-50' },
};

function toDisplayName(username: string): string {
  return username.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch post with creator info
  const { data: row } = await supabase
    .from('posts')
    .select('*, users!posts_user_id_fkey(id, username, avatar, bio, followers)')
    .eq('id', id)
    .maybeSingle();

  if (!row) return notFound();

  const creator = row.users as { id: string; username: string; avatar: string | null; bio: string | null; followers: number | null } | null;
  const username = creator?.username ?? 'unknown';
  const avatar = creator?.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=0ea5e9&color=fff`;
  const displayName = toDisplayName(username);
  const isVerified = (creator?.followers ?? 0) >= 20000;

  const cat = categoryConfig[row.category] ?? categoryConfig.destination;

  // Build "Go There" URL — routed through click tracker
  const goThereUrl = `/api/go?post=${row.id}&creator=${creator?.id ?? ''}`;

  // Fetch comments (may not exist yet — gracefully returns empty)
  const { data: commentRows } = await supabase
    .from('comments')
    .select('*, users!comments_user_id_fkey(id, username, avatar)')
    .eq('post_id', id)
    .order('created_at', { ascending: false })
    .limit(50);

  const comments = (commentRows ?? []).map((c) => {
    const cu = c.users as { id: string; username: string; avatar: string | null } | null;
    return {
      id: c.id,
      user: {
        id: cu?.id ?? '',
        username: cu?.username ?? 'anon',
        displayName: toDisplayName(cu?.username ?? 'anon'),
        avatar: cu?.avatar ?? `https://ui-avatars.com/api/?name=A&background=94a3b8&color=fff`,
        bio: '',
        followerCount: 0,
        followingCount: 0,
        postCount: 0,
        totalEarnings: 0,
        isAI: false,
        isVerified: false,
      },
      text: c.text,
      likeCount: c.likes ?? 0,
      createdAt: c.created_at,
    };
  });

  const commentCount = comments.length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-5 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to feed
        </Link>

        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          {/* Left: Media */}
          <div>
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100 shadow-sm">
              {row.video_url ? (
                <PostVideoPlayer
                  src={row.video_url}
                  poster={row.photo_url || undefined}
                />
              ) : row.photo_url ? (
                <img
                  src={row.photo_url}
                  alt={row.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-200" />
              )}
              <div className={`absolute inset-0 ${row.video_url ? 'pointer-events-none' : ''}`}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
                <div className="absolute top-4 left-4">
                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm ${cat.color}`}>
                    <cat.Icon className="w-3 h-3" /> {cat.label}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h1 className="text-white font-extrabold text-xl sm:text-2xl drop-shadow leading-tight">
                    {row.title}
                  </h1>
                  <div className="flex items-center gap-1 mt-1.5 text-white/90">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium">{row.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action bar */}
            <div className="flex items-center gap-2 mt-4 bg-white rounded-2xl border border-slate-100 px-4 py-3 shadow-sm">
              <button className="flex items-center gap-2 p-2 text-slate-400 hover:text-rose-500 transition-colors">
                <Heart className="w-5 h-5" />
                <span className="text-sm font-semibold">{formatNumber(row.likes ?? 0)}</span>
              </button>
              <button className="flex items-center gap-2 p-2 text-slate-400 hover:text-sky-500 transition-colors">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-semibold">{formatNumber(commentCount)}</span>
              </button>
              <ShareButton postId={row.id} shareCount={0} />
              <div className="flex-1" />
              <button className="p-2 text-slate-400 hover:text-sky-500 transition-colors">
                <Bookmark className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right: Details panel */}
          <div className="space-y-4">
            {/* Author */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <Link
                href={`/profile/${username}`}
                className="flex items-center gap-3 group"
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={avatar}
                    alt={displayName}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-sky-200 transition-all"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                      {displayName}
                    </span>
                    {isVerified && <BadgeCheck className="w-4 h-4 text-sky-500" />}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5" suppressHydrationWarning>
                    @{username} · {formatDistanceToNow(row.created_at)}
                  </p>
                </div>
                <button className="px-4 py-1.5 text-xs font-bold text-sky-600 border border-sky-200 rounded-full hover:bg-sky-50 transition-colors">
                  Follow
                </button>
              </Link>
            </div>

            {/* Description */}
            {row.description && (
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <p className="text-sm text-slate-700 leading-relaxed">{row.description}</p>
              </div>
            )}

            {/* Go There */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <a
                href={goThereUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-sky-500 to-teal-500 text-white rounded-xl font-bold text-sm hover:from-sky-600 hover:to-teal-600 active:scale-[0.98] transition-all shadow-md shadow-sky-200"
              >
                Go There
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Comments */}
        <CommentsSection
          postId={row.id}
          initialComments={comments}
          commentCount={commentCount}
        />
      </div>
    </div>
  );
}
