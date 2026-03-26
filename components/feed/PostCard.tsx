'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Heart,
  MessageCircle,
  Bookmark,
  MapPin,
  Star,
  ExternalLink,
  Bot,
  BadgeCheck,
  MoreHorizontal,
  Flag,
  EyeOff,
  Link2,
  Check,
  Volume2,
  VolumeX,
  Play,
  CheckCircle2,
  Building2,
  Home,
  Castle,
  Briefcase,
  Map,
  KeyRound,
  HardHat,
  type LucideIcon,
} from 'lucide-react';
import { ShareMenu } from '@/components/ui/ShareMenu';
import { Post, PostCategory } from '@/lib/types';
import { formatDistanceToNow, formatNumber } from '@/lib/utils';
import { postPriceDrops } from '@/lib/pricePulseData';

import { createClient } from '@/lib/supabase/client';
import { Pencil, Trash2, Loader2, X as XIcon } from 'lucide-react';

const categoryConfig: Record<
  string,
  { label: string; Icon: LucideIcon; bg: string; text: string }
> = {
  apartment: { label: 'Apartment', Icon: Building2, bg: 'bg-red-50', text: 'text-red-700' },
  house: { label: 'House', Icon: Home, bg: 'bg-green-50', text: 'text-green-700' },
  villa: { label: 'Villa', Icon: Castle, bg: 'bg-yellow-50', text: 'text-yellow-700' },
  commercial: { label: 'Commercial', Icon: Briefcase, bg: 'bg-blue-50', text: 'text-blue-700' },
  land: { label: 'Land', Icon: Map, bg: 'bg-emerald-50', text: 'text-emerald-700' },
  rental: { label: 'Rental', Icon: KeyRound, bg: 'bg-purple-50', text: 'text-purple-700' },
  preconstruction: { label: 'Pre-construction', Icon: HardHat, bg: 'bg-orange-50', text: 'text-orange-700' },
};

interface PostCardProps {
  post: Post;
  currentUserId?: string | null;
  onDelete?: (postId: string) => void;
  onUpdate?: (postId: string, updates: { title: string; description: string; location: string }) => void;
}

// Detect YouTube Shorts URLs for vertical aspect ratio
function isYouTubeShorts(url: string): boolean {
  try {
    const u = new URL(url);
    return (u.hostname === 'www.youtube.com' || u.hostname === 'youtube.com') && u.pathname.startsWith('/shorts/');
  } catch {
    return false;
  }
}

// Extract YouTube video ID from any YouTube URL format
function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === 'www.youtube.com' || u.hostname === 'youtube.com') {
      if (u.pathname === '/watch') return u.searchParams.get('v');
      const shorts = u.pathname.match(/^\/shorts\/([^/]+)/);
      if (shorts) return shorts[1];
      const embed = u.pathname.match(/^\/embed\/([^/?]+)/);
      if (embed) return embed[1];
    }
    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('/')[0] || null;
    return null;
  } catch {
    return null;
  }
}

// Convert a YouTube / TikTok / Instagram share URL to its embeddable src
function toEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);

    // YouTube: youtube.com/watch?v=ID  |  youtu.be/ID  |  youtube.com/shorts/ID
    if (u.hostname === 'www.youtube.com' || u.hostname === 'youtube.com') {
      if (u.pathname === '/watch') {
        const id = u.searchParams.get('v');
        if (id) return `https://www.youtube.com/embed/${id}?enablejsapi=1&autoplay=1&mute=1&playsinline=1`;
      }
      if (u.pathname.startsWith('/shorts/')) {
        const id = u.pathname.split('/shorts/')[1]?.split('/')[0];
        if (id) return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&enablejsapi=1&playsinline=1`;
      }
      if (u.pathname.startsWith('/embed/')) return url;
    }
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.slice(1).split('/')[0];
      if (id) return `https://www.youtube.com/embed/${id}?enablejsapi=1&autoplay=1&mute=1&playsinline=1`;
    }

    // TikTok: tiktok.com/@user/video/VIDEO_ID
    if (u.hostname === 'www.tiktok.com' || u.hostname === 'tiktok.com') {
      const match = u.pathname.match(/\/video\/(\d+)/);
      if (match) return `https://www.tiktok.com/embed/v2/${match[1]}`;
    }

    // Instagram: instagram.com/p/SHORTCODE/  |  instagram.com/reel/SHORTCODE/
    if (u.hostname === 'www.instagram.com' || u.hostname === 'instagram.com') {
      const match = u.pathname.match(/\/(p|reel)\/([A-Za-z0-9_-]+)/);
      if (match) return `https://www.instagram.com/${match[1]}/${match[2]}/embed`;
    }

    return null;
  } catch {
    return null;
  }
}

export function PostCard({ post, currentUserId, onDelete, onUpdate }: PostCardProps) {
  const [liked, setLiked] = useState(post.isLiked);
  const [saved, setSaved] = useState(post.isSaved);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [expanded, setExpanded] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [following, setFollowing] = useState(post.user.isFollowing ?? false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [profileCopied, setProfileCopied] = useState(false);

  // Owner actions
  const isOwner = currentUserId && post.user.id === currentUserId;
  const [deleteConfirming, setDeleteConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editDescription, setEditDescription] = useState(post.description);
  const [editLocation, setEditLocation] = useState(post.location);
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [editVideoProcessing, setEditVideoProcessing] = useState(false);
  const [editNewVideoUrl, setEditNewVideoUrl] = useState<string | null>(null);
  const [editNewThumbnailUrl, setEditNewThumbnailUrl] = useState<string | null>(null);
  const [editVideoError, setEditVideoError] = useState<string | null>(null);
  const [editAiGenerating, setEditAiGenerating] = useState(false);
  const [editCategory, setEditCategory] = useState(post.category);
  const [saving, setSaving] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [hasBeenInView, setHasBeenInView] = useState(false);
  const [inView, setInView] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoExpanded, setVideoExpanded] = useState(false);

  // Detect touch/mobile devices
  useEffect(() => {
    setIsMobile(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  // Close expanded video on Escape key
  useEffect(() => {
    if (!videoExpanded) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setVideoExpanded(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [videoExpanded]);

  // Close "..." dropdown on outside click
  useEffect(() => {
    if (!moreOpen) return;
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [moreOpen]);

  // Intersection Observer: lazy-load & auto-play video when scrolled into view
  useEffect(() => {
    const el = videoContainerRef.current;
    if (!post.videoUrl || !el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setHasBeenInView(true);
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [post.videoUrl]);

  const cat = categoryConfig[post.category] ?? categoryConfig.destination;
  const priceDrop = postPriceDrops[post.id];
  const embedUrl = post.videoUrl ? toEmbedUrl(post.videoUrl) : null;
  const isShorts = post.videoUrl ? isYouTubeShorts(post.videoUrl) : false;
  const isNativeVideo = (post.videoUrl?.includes('supabase') || post.videoUrl?.includes('r2.cloudflarestorage.com') || post.videoUrl?.includes('.r2.dev') || post.videoUrl?.match(/\.(mp4|mov|webm)(\?|$)/i)) ? true : false;
  const ytId = post.videoUrl ? getYouTubeId(post.videoUrl) : null;
  const fullscreenEmbedUrl = ytId ? `https://www.youtube.com/embed/${ytId}?autoplay=1&mute=0&playsinline=1&enablejsapi=1` : null;

  // Play native video as soon as data is buffered, and auto-play/pause on scroll
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isNativeVideo) return;

    const tryPlay = () => { video.play().catch(() => {}); };

    // Play once enough data is buffered
    video.addEventListener('canplay', tryPlay);
    // Also try immediately (data may already be buffered)
    tryPlay();

    return () => { video.removeEventListener('canplay', tryPlay); };
  }, [isNativeVideo]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isNativeVideo) return;
    if (inView) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [inView, isNativeVideo]);

  const handleLike = () => {
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
    if (!liked) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 400);
    }
  };

  const toggleMute = () => {
    if (isNativeVideo) {
      const video = videoRef.current;
      if (!video) return;
      const newMuted = !video.muted;
      video.muted = newMuted;
      if (!newMuted) video.volume = 1;
      setMuted(newMuted);
      return;
    }
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;
    const cmd = muted ? 'unMute' : 'mute';
    iframe.contentWindow.postMessage(
      JSON.stringify({ event: 'command', func: cmd, args: '' }),
      '*'
    );
    setMuted((m) => !m);
  };

  async function copyProfileLink() {
    await navigator.clipboard.writeText(`${window.location.origin}/profile/${post.user.username}`);
    setProfileCopied(true);
    setTimeout(() => { setProfileCopied(false); setMoreOpen(false); }, 2000);
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('posts').delete().eq('id', post.id);
      if (!error) {
        onDelete?.(post.id);
      }
    } catch {
      // silent fail
    } finally {
      setDeleting(false);
      setDeleteConfirming(false);
      setMoreOpen(false);
    }
  }

  async function handleEditProcessVideo() {
    if (!editVideoUrl.trim()) return;
    setEditVideoProcessing(true);
    setEditVideoError(null);
    try {
      const res = await fetch('/api/video/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: editVideoUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditVideoError(data.error || 'Failed to process video.');
        return;
      }
      setEditNewVideoUrl(data.url);
      setEditNewThumbnailUrl(data.thumbnail_url || null);

      // Auto-generate AI content from the new video
      setEditAiGenerating(true);
      try {
        const aiRes = await fetch('/api/ai/generate-post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: editVideoUrl.trim(), platform: data.platform }),
        });
        const aiData = await aiRes.json();
        if (aiData.title) setEditTitle(aiData.title);
        if (aiData.description) setEditDescription(aiData.description);
        if (aiData.location) setEditLocation(aiData.location);
        if (aiData.category) setEditCategory(aiData.category);
      } catch {
        // Non-fatal — keep existing fields if AI fails
      } finally {
        setEditAiGenerating(false);
      }
    } catch {
      setEditVideoError('Network error processing video.');
    } finally {
      setEditVideoProcessing(false);
    }
  }

  async function handleEditSave() {
    setSaving(true);
    try {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updates: any = {
        title: editTitle.trim(),
        description: editDescription.trim(),
        location: editLocation.trim(),
        category: editCategory,
      };
      if (editNewVideoUrl) {
        updates.video_url = editNewVideoUrl;
        updates.photo_url = editNewThumbnailUrl;
      }
      const { error } = await supabase.from('posts').update(updates).eq('id', post.id);
      if (!error) {
        onUpdate?.(post.id, { title: editTitle.trim(), description: editDescription.trim(), location: editLocation.trim() });
        setEditOpen(false);
        setEditVideoUrl('');
        setEditNewVideoUrl(null);
        setEditNewThumbnailUrl(null);
        setEditVideoError(null);
      }
    } catch {
      // silent fail
    } finally {
      setSaving(false);
    }
  }

  const maxChars = 150;
  const isLong = post.description.length > maxChars;
  const displayDesc = isLong && !expanded
    ? post.description.slice(0, maxChars).trimEnd() + '…'
    : post.description;

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-shadow hover:shadow-md">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <Link href={`/profile/${post.user.username}`} className="flex items-center gap-3 group">
          <div className="relative flex-shrink-0">
            <img
              src={post.user.avatar}
              alt={post.user.displayName}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-sky-200 transition-all"
            />
            {post.user.isAI && (
              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-sky-500 rounded-full flex items-center justify-center ring-1 ring-white">
                <Bot className="w-2.5 h-2.5 text-white" />
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-sm text-slate-900 group-hover:text-sky-600 transition-colors">
                {post.user.displayName}
              </span>
              {post.user.isVerified && (
                <BadgeCheck className="w-4 h-4 text-sky-500 flex-shrink-0" />
              )}
              {post.user.isAI && (
                <span className="text-[10px] font-bold bg-sky-100 text-sky-600 px-1.5 py-0.5 rounded-full">
                  AI
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5" suppressHydrationWarning>{formatDistanceToNow(post.createdAt)}</p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {/* Follow button — toggles Follow / Following */}
          <button
            onClick={() => setFollowing((v) => !v)}
            className={`px-3 py-1.5 text-xs font-bold rounded-full active:scale-95 transition-all ${
              following
                ? 'bg-slate-900 text-white border border-slate-900 hover:bg-slate-700'
                : 'text-sky-600 border border-sky-200 hover:bg-sky-50'
            }`}
          >
            {following ? 'Following' : 'Follow'}
          </button>

          {/* "..." menu */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMoreOpen((v) => !v)}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
              aria-label="More options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {moreOpen && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50">
                {isOwner && (
                  <>
                    <button
                      onClick={() => { setEditOpen(true); setMoreOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Pencil className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      Edit post
                    </button>
                    <button
                      onClick={() => { setDeleteConfirming(true); setMoreOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-rose-400 flex-shrink-0" />
                      Delete post
                    </button>
                    <div className="border-t border-slate-100 my-1" />
                  </>
                )}
                <button
                  onClick={() => setMoreOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Flag className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  Report post
                </button>
                <button
                  onClick={() => setMoreOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <EyeOff className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  Not interested
                </button>
                <button
                  onClick={copyProfileLink}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {profileCopied
                    ? <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    : <Link2 className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                  {profileCopied ? 'Copied!' : 'Copy link to profile'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Backdrop when video is expanded ── */}
      {videoExpanded && isNativeVideo && (
        <div
          className="fixed inset-0 z-[9998] bg-black/90 sm:bg-black/80"
          onClick={() => setVideoExpanded(false)}
        />
      )}

      {/* ── Media: video embed or photo ── */}
      {post.videoUrl ? (
        // Video embed — div instead of Link so the iframe is interactive
        <div
          ref={videoContainerRef}
          className={
            videoExpanded && isNativeVideo
              ? 'fixed inset-0 z-[9999] flex items-center justify-center'
              : `relative mx-0 sm:mx-3 rounded-none sm:rounded-xl overflow-hidden bg-slate-100 ${isShorts ? '' : 'aspect-[4/3]'}`
          }
          style={!videoExpanded && isShorts ? { paddingBottom: '177.78%' } : undefined}
        >
          {isNativeVideo ? (
            <>
              <video
                ref={videoRef}
                src={post.videoUrl}
                autoPlay
                muted
                playsInline
                loop
                preload="auto"
                disablePictureInPicture
                controlsList="nodownload nofullscreen noremoteplayback nopictureinpicture"
                className={
                  videoExpanded
                    ? 'w-auto h-full max-h-[90vh] sm:max-h-[85vh] aspect-[9/16] object-contain bg-black rounded-none sm:rounded-2xl'
                    : 'absolute inset-0 w-full h-full object-cover'
                }
              />
              {/* Tap to expand video overlay */}
              {!videoExpanded && (
                <button
                  onClick={() => setVideoExpanded(true)}
                  className="absolute inset-0 z-[5]"
                  aria-label="Expand video"
                />
              )}
              {/* Close button when expanded */}
              {videoExpanded && (
                <button
                  onClick={() => setVideoExpanded(false)}
                  className="fixed top-4 right-4 z-[10000] w-10 h-10 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
                  aria-label="Close"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              )}
            </>
          ) : ytId && isMobile ? (
            <>
              <img
                src={`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`}
                alt={post.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <button
                onClick={() => setShowVideoModal(true)}
                className="absolute inset-0 z-10 flex items-center justify-center"
                aria-label="Play video"
              >
                <span className="w-16 h-16 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
                  <Play className="w-7 h-7 text-white fill-white ml-0.5" />
                </span>
              </button>
            </>
          ) : hasBeenInView ? (
            <iframe
              ref={iframeRef}
              src={embedUrl ?? ''}
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : null}
          {/* Mute / unmute toggle */}
          <button
            onClick={toggleMute}
            className={
              videoExpanded && isNativeVideo
                ? 'fixed bottom-6 right-4 z-[10000] w-10 h-10 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors'
                : 'absolute bottom-14 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors'
            }
            aria-label={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          {/* Overlays are pointer-events-none so they don't block the iframe — hidden when expanded */}
          <div className={`absolute inset-0 pointer-events-none ${videoExpanded ? 'hidden' : ''}`}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
            <div className="absolute top-3 left-3">
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm bg-white/90 border border-white/60 ${cat.text}`}>
                <cat.Icon className="w-3 h-3" /> {cat.label}
              </span>
            </div>
            {post.rating != null && (
              <div className="absolute top-3 right-3">
                <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-400 text-amber-900">
                  <Star className="w-3 h-3 fill-amber-900 stroke-amber-900" />
                  {post.rating}
                </span>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 px-3 py-3 flex items-end justify-between">
              <div>
                <p className="text-white font-bold text-base leading-tight drop-shadow-sm">{post.title}</p>
                <div className="flex items-center gap-1 mt-1 text-white/90">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="text-sm font-medium">{post.location}</span>
                </div>
              </div>
              {post.price && (
                <span className="text-xs font-semibold text-white bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full whitespace-nowrap ml-2">
                  {post.price}
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Photo — exactly as before
        <Link href={`/post/${post.id}`} className="block relative mx-0 sm:mx-3 rounded-none sm:rounded-xl overflow-hidden aspect-[4/3] bg-slate-100">
          <img
            src={post.image || ''}
            alt={post.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm bg-white/90 border border-white/60 ${cat.text}`}>
              <cat.Icon className="w-3 h-3" /> {cat.label}
            </span>
          </div>
          {post.rating != null && (
            <div className="absolute top-3 right-3">
              <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-400 text-amber-900">
                <Star className="w-3 h-3 fill-amber-900 stroke-amber-900" />
                {post.rating}
              </span>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 px-3 py-3 flex items-end justify-between">
            <div>
              <p className="text-white font-bold text-base leading-tight drop-shadow-sm">{post.title}</p>
              <div className="flex items-center gap-1 mt-1 text-white/90">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-sm font-medium">{post.location}</span>
              </div>
            </div>
            {post.price && (
              <span className="text-xs font-semibold text-white bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full whitespace-nowrap ml-2">
                {post.price}
              </span>
            )}
          </div>
        </Link>
      )}

      {/* ── Price Pulse badge ── */}
      {priceDrop && (
        <a
          href={priceDrop.expediaUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="mx-3 mt-2 flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-xl px-3.5 py-2 group hover:bg-emerald-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="relative w-2 h-2 flex-shrink-0">
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />
              <span className="relative block w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <span className="text-xs font-bold text-emerald-700">
              Price dropped {priceDrop.discount}% this week
            </span>
          </div>
          <span className="text-xs font-extrabold text-emerald-600 group-hover:text-emerald-800 whitespace-nowrap ml-3 transition-colors">
            Book now →
          </span>
        </a>
      )}

      {/* ── Action row ── */}
      <div className="flex items-center px-3 py-2.5">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1 p-2 rounded-full transition-all ${
            liked ? 'text-rose-500' : 'text-slate-400 hover:text-rose-400'
          } ${animating ? 'scale-125' : 'scale-100'}`}
          aria-label={liked ? 'Unlike' : 'Like'}
        >
          <Heart className={`w-5 h-5 transition-all ${liked ? 'fill-rose-500' : ''}`} />
        </button>

        <Link
          href={`/post/${post.id}#comments`}
          className="flex items-center gap-1 p-2 rounded-full text-slate-400 hover:text-sky-500 transition-colors"
          aria-label="View comments"
        >
          <MessageCircle className="w-5 h-5" />
        </Link>

        <ShareMenu path={`/post/${post.id}`} title={post.title} />

        <div className="flex-1" />

        <button
          onClick={() => setSaved(!saved)}
          className={`p-2 rounded-full transition-all ${
            saved ? 'text-sky-500' : 'text-slate-400 hover:text-sky-500'
          }`}
          aria-label={saved ? 'Unsave' : 'Save'}
        >
          <Bookmark className={`w-5 h-5 ${saved ? 'fill-sky-500' : ''}`} />
        </button>
      </div>

      {/* ── Like count ── */}
      <div className="px-4 pb-1.5">
        <p className="text-sm font-bold text-slate-900">{formatNumber(likeCount)} likes</p>
      </div>

      {/* ── Description ── */}
      <div className="px-4 pb-2">
        <p className="text-sm text-slate-700 leading-relaxed">
          <Link
            href={`/profile/${post.user.username}`}
            className="font-bold text-slate-900 hover:text-sky-600 transition-colors mr-1"
          >
            {post.user.username}
          </Link>
          {displayDesc}
          {isLong && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="text-slate-400 hover:text-slate-700 ml-1 text-xs font-medium"
            >
              more
            </button>
          )}
        </p>
        {post.commentCount > 0 && (
          <Link
            href={`/post/${post.id}#comments`}
            className="text-xs text-slate-400 hover:text-slate-600 mt-1 block"
          >
            View all {formatNumber(post.commentCount)} comments
          </Link>
        )}
      </div>

      {/* ── Tags ── */}
      {post.tags.length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-x-2 gap-y-1">
          {post.tags.slice(0, 5).map((tag) => (
            <span
              key={tag}
              className="text-xs text-sky-500 hover:text-sky-700 cursor-pointer transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* ── View Property CTA ── */}
      <div className="px-4 pb-4">
        <Link
          href={`/post/${post.id}`}
          className="block w-full py-3 text-white rounded-xl font-bold text-sm text-center hover:opacity-90 transition-opacity shadow-md"
          style={{ backgroundColor: '#2D9B4E' }}
        >
          Show More{' '}
          <ExternalLink className="w-4 h-4 inline-block align-middle" />
        </Link>
      </div>

      {/* ── Delete confirmation dialog ── */}
      {deleteConfirming && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setDeleteConfirming(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900">Delete post?</h3>
            <p className="text-sm text-slate-500 mt-2">This action cannot be undone. Your post will be permanently removed.</p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setDeleteConfirming(false)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 bg-rose-500 text-white rounded-xl font-semibold text-sm hover:bg-rose-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting…</> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit modal ── */}
      {editOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setEditOpen(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Edit post</h3>
              <button onClick={() => setEditOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                maxLength={60}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
              <textarea
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                maxLength={200}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Location</label>
              <input
                type="text"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value as PostCategory)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white"
              >
                <option value="hotel">Hotel</option>
                <option value="restaurant">Restaurant</option>
                <option value="destination">Destination</option>
                <option value="flight">Flight</option>
                <option value="activity">Activity</option>
                <option value="cruise">Cruise</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Update Video <span className="text-slate-400 font-normal">(optional)</span></label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={editVideoUrl}
                  onChange={(e) => { setEditVideoUrl(e.target.value); setEditNewVideoUrl(null); setEditNewThumbnailUrl(null); setEditVideoError(null); }}
                  placeholder="Paste new TikTok link"
                  disabled={editVideoProcessing}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleEditProcessVideo}
                  disabled={editVideoProcessing || !editVideoUrl.trim()}
                  className="px-3 py-2 bg-sky-500 text-white rounded-xl text-xs font-semibold hover:bg-sky-600 transition-colors disabled:opacity-50 whitespace-nowrap flex items-center gap-1.5"
                >
                  {editVideoProcessing ? <><Loader2 className="w-3 h-3 animate-spin" /> Processing</> : 'Process'}
                </button>
              </div>
              {editVideoError && (
                <p className="text-xs text-rose-500 mt-1">{editVideoError}</p>
              )}
              {editAiGenerating && (
                <div className="flex items-center gap-2 mt-2">
                  <Loader2 className="w-3.5 h-3.5 text-violet-500 animate-spin" />
                  <p className="text-xs text-violet-600 font-medium">AI analyzing content...</p>
                </div>
              )}
              {editNewVideoUrl && !editAiGenerating && (
                <div className="flex items-center gap-2 mt-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
                  <p className="text-xs text-teal-600 font-medium">Video and content updated</p>
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setEditOpen(false)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={saving}
                className="flex-1 py-2.5 bg-sky-500 text-white rounded-xl font-semibold text-sm hover:bg-sky-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Fullscreen video modal (mobile tap-to-play) ── */}
      {showVideoModal && fullscreenEmbedUrl && (
        <div
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          onClick={() => setShowVideoModal(false)}
        >
          <button
            onClick={() => setShowVideoModal(false)}
            className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 text-white"
            aria-label="Close video"
          >
            ✕
          </button>
          <iframe
            src={fullscreenEmbedUrl}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </article>
  );
}
