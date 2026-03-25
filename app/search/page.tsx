'use client';

import { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { PostCard } from '@/components/feed/PostCard';
import type { Post } from '@/lib/types';

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-3 border-slate-200 border-t-sky-500 rounded-full animate-spin" />
          </div>
        </main>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q')?.trim() ?? '';
  const source = searchParams.get('source') ?? '';

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const fetchIdRef = useRef(0);

  // Fetch search results when query changes
  useEffect(() => {
    if (!query) {
      setPosts([]);
      setHasMore(false);
      return;
    }

    const id = ++fetchIdRef.current;
    setLoading(true);

    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (id !== fetchIdRef.current) return;
        setPosts(data.posts ?? []);
        setHasMore(data.hasMore ?? false);
      })
      .catch(() => {
        if (id !== fetchIdRef.current) return;
        setPosts([]);
        setHasMore(false);
      })
      .finally(() => {
        if (id !== fetchIdRef.current) return;
        setLoading(false);
      });
  }, [query]);

  // Load more (infinite scroll)
  const loadMore = useCallback(() => {
    if (!query || loadingMore || !hasMore) return;

    const id = fetchIdRef.current;
    setLoadingMore(true);

    fetch(`/api/search?q=${encodeURIComponent(query)}&offset=${posts.length}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (id !== fetchIdRef.current) return;
        setPosts((prev) => [...prev, ...(data.posts ?? [])]);
        setHasMore(data.hasMore ?? false);
      })
      .catch(() => {})
      .finally(() => {
        if (id !== fetchIdRef.current) return;
        setLoadingMore(false);
      });
  }, [query, loadingMore, hasMore, posts.length]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        {/* Results header */}
        {query && (
          <div className="flex items-center gap-1.5 mb-4">
            <p className="text-sm text-gray-400">
              {source === 'destinations' ? 'Top Markets: ' : source === 'trending' ? 'Trending: ' : source === 'tags' ? 'Popular Tags: ' : 'Results for: '}
              <span className="text-gray-600 font-medium">{query}</span>
            </p>
            <button
              onClick={() => { window.location.href = '/'; }}
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity hover:opacity-80"
              style={{ backgroundColor: '#C8102E' }}
              aria-label="Clear search"
            >
              <X className="w-2.5 h-2.5 text-white" />
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-3 border-slate-200 border-t-sky-500 rounded-full animate-spin" />
          </div>
        )}

        {/* Search results */}
        {!loading && posts.length > 0 && (
          <div className="space-y-3 sm:space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {/* No results */}
        {!loading && query && posts.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <p className="font-semibold text-slate-700 text-lg">No results found</p>
            <p className="text-slate-400 text-sm mt-1">
              We couldn&apos;t find any posts matching &ldquo;{query}&rdquo;.
            </p>
          </div>
        )}

        {/* Infinite scroll sentinel */}
        {hasMore && <div ref={sentinelRef} className="h-1" />}

        {/* Loading more */}
        {loadingMore && (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-slate-200 border-t-sky-500 rounded-full animate-spin" />
          </div>
        )}
      </main>
    </div>
  );
}
