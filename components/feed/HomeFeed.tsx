'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { StoriesRow } from '@/components/feed/StoriesRow';
import { PostCard } from '@/components/feed/PostCard';
import { FeedSidebar } from '@/components/feed/FeedSidebar';
import { Post, Story, TrendingDestination, User } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

interface HomeFeedProps {
  posts: Post[];
  seed: number;
  totalPosts: number;
  stories: Story[];
  trendingDestinations: TrendingDestination[];
  suggestedUsers: User[];
}

export function HomeFeed({ posts: initialPosts, seed, totalPosts, stories, trendingDestinations, suggestedUsers }: HomeFeedProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPosts.length < totalPosts);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Get current user on mount
  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUserId(data.user.id);
    });
  }, []);

  const handleDeletePost = useCallback((postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }, []);

  const handleUpdatePost = useCallback((postId: string, updates: { title: string; description: string; location: string }) => {
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, ...updates } : p));
  }, []);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/posts?offset=${posts.length}&limit=10&seed=${seed}`);
      const data = await res.json();
      if (data.posts?.length) {
        setPosts((prev) => [...prev, ...data.posts]);
      }
      setHasMore(data.hasMore ?? false);
    } catch {
      // Network error — stop trying
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, posts.length]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: '400px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  const displayPosts =
    activeCategory === 'all'
      ? posts
      : posts.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

      <main className="max-w-5xl mx-auto px-0 sm:px-4 md:px-6 py-4 sm:py-6">
        <div className="flex gap-6 items-start">

          {/* ── Feed column ── */}
          <div className="flex-1 min-w-0 space-y-3 sm:space-y-4">
            <StoriesRow stories={stories} />

            {displayPosts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                <GlobeIcon className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="font-semibold text-slate-700 text-lg">No posts in this category yet</p>
                <p className="text-slate-400 text-sm mt-1">Be the first to share a recommendation!</p>
              </div>
            ) : (
              displayPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={currentUserId}
                  onDelete={handleDeletePost}
                  onUpdate={handleUpdatePost}
                />
              ))
            )}

            {/* Sentinel for infinite scroll */}
            <div ref={sentinelRef} />

            {loading && (
              <div className="flex justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
              </div>
            )}
          </div>

          {/* ── Sticky sidebar ── */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-[116px]">
              <FeedSidebar
                trendingDestinations={trendingDestinations}
                suggestedUsers={suggestedUsers}
              />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
