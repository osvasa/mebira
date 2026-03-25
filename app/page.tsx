export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { HomeFeed } from '@/components/feed/HomeFeed';
import {
  fetchPosts,
  fetchSuggestedUsers,
  fetchTrendingDestinations,
  buildStories,
} from '@/lib/supabase/queries';

export default async function HomePage() {
  const seed = Math.floor(Math.random() * 2147483647);
  const [allPosts, suggestedUsers, trendingDestinations, stories] = await Promise.all([
    fetchPosts(seed),
    fetchSuggestedUsers(),
    fetchTrendingDestinations(),
    buildStories(),
  ]);

  return (
    <HomeFeed
      posts={allPosts.slice(0, 10)}
      seed={seed}
      totalPosts={allPosts.length}
      stories={stories}
      trendingDestinations={trendingDestinations}
      suggestedUsers={suggestedUsers}
    />
  );
}
