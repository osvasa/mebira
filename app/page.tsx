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
  const [allPosts, suggestedUsers, trendingDestinations, stories] = await Promise.all([
    fetchPosts(),
    fetchSuggestedUsers(),
    fetchTrendingDestinations(),
    buildStories(),
  ]);

  return (
    <HomeFeed
      posts={allPosts.slice(0, 10)}
      totalPosts={allPosts.length}
      stories={stories}
      trendingDestinations={trendingDestinations}
      suggestedUsers={suggestedUsers}
    />
  );
}
