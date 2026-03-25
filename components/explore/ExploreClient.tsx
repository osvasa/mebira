'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Compass, Building2, Home, Castle, Briefcase, Map, KeyRound, LayoutGrid, MapPin, Loader2, Play, ArrowLeft, type LucideIcon } from 'lucide-react';

import { Post } from '@/lib/types';

const categories = [
  { id: 'all',         label: 'All',          Icon: LayoutGrid },
  { id: 'apartment',   label: 'Apartments',   Icon: Building2 },
  { id: 'house',       label: 'Houses',       Icon: Home },
  { id: 'villa',       label: 'Villas',       Icon: Castle },
  { id: 'commercial',  label: 'Commercial',   Icon: Briefcase },
  { id: 'land',        label: 'Land',         Icon: Map },
  { id: 'rental',      label: 'Rentals',      Icon: KeyRound },
];

const categoryConfig: Record<string, { Icon: LucideIcon; color: string }> = {
  apartment:   { Icon: Building2, color: 'text-red-700 bg-red-50' },
  house:       { Icon: Home, color: 'text-green-700 bg-green-50' },
  villa:       { Icon: Castle, color: 'text-yellow-700 bg-yellow-50' },
  commercial:  { Icon: Briefcase, color: 'text-blue-700 bg-blue-50' },
  land:        { Icon: Map, color: 'text-emerald-700 bg-emerald-50' },
  rental:      { Icon: KeyRound, color: 'text-purple-700 bg-purple-50' },
};

interface ExploreClientProps {
  initialPosts: Post[];
}

export function ExploreClient({ initialPosts }: ExploreClientProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPosts.length === 20);
  const [offset, setOffset] = useState(initialPosts.length);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset when category changes
  const handleCategoryChange = useCallback(async (category: string) => {
    setActiveCategory(category);
    setLoading(true);
    setPosts([]);
    setOffset(0);
    setHasMore(true);

    try {
      const res = await fetch(`/api/explore?category=${category}&offset=0`);
      const data = await res.json();
      setPosts(data.posts);
      setHasMore(data.hasMore);
      setOffset(data.posts.length);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  // Infinite scroll
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/explore?category=${activeCategory}&offset=${offset}`);
      const data = await res.json();
      setPosts((prev) => [...prev, ...data.posts]);
      setHasMore(data.hasMore);
      setOffset((prev) => prev + data.posts.length);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, activeCategory, offset]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: '200px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-5 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to feed
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C8102E] to-teal-500 flex items-center justify-center shadow-md">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Explore</h1>
            <p className="text-xs text-slate-400 font-medium">Discover amazing places from creators worldwide</p>
          </div>
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
          {categories.map(({ id, label, Icon }) => {
            const active = activeCategory === id;
            return (
              <button
                key={id}
                onClick={() => handleCategoryChange(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                {label}
              </button>
            );
          })}
        </div>

        {/* Posts grid */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {posts.map((post) => {
              const hasVideo = post.videoUrl?.includes('r2.dev') || post.videoUrl?.includes('r2.cloudflarestorage');
              const cat = categoryConfig[post.category] ?? categoryConfig.destination;
              // Only use image if it's a real upload (R2/supabase), not an Unsplash fallback
              const hasRealImage = post.image && !post.image.includes('unsplash.com') && !post.image.includes('ui-avatars.com');

              return (
                <Link key={post.id} href={`/post/${post.id}`} className="group relative">
                  <div className="aspect-square rounded-xl overflow-hidden bg-slate-100">
                    {hasRealImage ? (
                      <img
                        src={post.image!}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : hasVideo ? (
                      <video
                        src={`${post.videoUrl}#t=0.001`}
                        className="w-full h-full object-cover"
                        preload="metadata"
                        muted
                        playsInline
                        onLoadedMetadata={(e) => { (e.currentTarget as HTMLVideoElement).currentTime = 0.001; }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center p-3">
                        <p className="text-white/90 text-xs font-bold text-center leading-tight">{post.title}</p>
                      </div>
                    )}

                    {/* Video indicator */}
                    {hasVideo && (
                      <div className="absolute top-2 right-2">
                        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
                          <Play className="w-3 h-3 text-white fill-white" />
                        </span>
                      </div>
                    )}

                    {/* Category badge */}
                    <div className="absolute top-2 left-2">
                      <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm ${cat.color}`}>
                        <cat.Icon className="w-3 h-3" />
                      </span>
                    </div>

                    {/* Bottom overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pt-10 pb-2 px-2.5 rounded-b-xl">
                      <p className="text-white font-bold text-xs drop-shadow truncate leading-tight">{post.title}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin className="w-2.5 h-2.5 text-white/80 flex-shrink-0" />
                        <p className="text-white/80 text-[10px] font-medium truncate">{post.location}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : !loading ? (
          <div className="text-center py-20">
            <p className="text-slate-400 text-sm">No posts found.</p>
          </div>
        ) : null}

        {/* Loading / infinite scroll sentinel */}
        {loading && (
          <div className="flex items-center justify-center py-8 gap-2">
            <Loader2 className="w-5 h-5 text-[#C8102E] animate-spin" />
            <span className="text-sm text-slate-400 font-medium">Loading...</span>
          </div>
        )}
        {hasMore && !loading && <div ref={sentinelRef} className="h-1" />}
      </div>
    </div>
  );
}
