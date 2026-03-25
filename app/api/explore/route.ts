import { NextRequest, NextResponse } from 'next/server';
import { fetchExplorePosts } from '@/lib/supabase/queries';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') ?? 'all';
  const offset = parseInt(searchParams.get('offset') ?? '0', 10);
  const limit = 20;

  const posts = await fetchExplorePosts(category, offset, limit);
  return NextResponse.json({ posts, hasMore: posts.length === limit });
}
