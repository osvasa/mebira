export const dynamic = 'force-dynamic';

import { fetchExplorePosts } from '@/lib/supabase/queries';
import { ExploreClient } from '@/components/explore/ExploreClient';

export default async function ExplorePage() {
  const initialPosts = await fetchExplorePosts('all', 0, 20);

  return <ExploreClient initialPosts={initialPosts} />;
}
