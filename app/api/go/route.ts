import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Service role client — bypasses RLS, works for unauthenticated visitors
function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get('post');
  const creatorId = searchParams.get('creator');
  const debug = searchParams.get('debug') === '1';

  const logs: string[] = [];
  function log(msg: string) { console.log(msg); logs.push(msg); }

  log(`[go] route hit postId=${postId} creatorId=${creatorId}`);
  log(`[go] env check: hasUrl=${!!process.env.NEXT_PUBLIC_SUPABASE_URL} hasServiceKey=${!!process.env.SUPABASE_SERVICE_ROLE_KEY} serviceKeyLength=${process.env.SUPABASE_SERVICE_ROLE_KEY?.length ?? 0}`);

  if (!postId) {
    log('[go] no postId, redirecting to /');
    if (debug) return NextResponse.json({ logs });
    return NextResponse.redirect(new URL('/', req.url));
  }

  const supabase = createServiceClient();

  // Fetch post
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('id, title, location, category, expedia_url')
    .eq('id', postId)
    .maybeSingle();

  log(`[go] post lookup: ${post ? post.title : 'NOT FOUND'} ${postError ? 'ERROR: ' + postError.message : ''}`);

  if (!post) {
    log('[go] post not found, redirecting to /');
    if (debug) return NextResponse.json({ logs });
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Build redirect URL
  const EXPEDIA_FALLBACK = 'https://expedia.com/affiliates/osvasa/socialtravel';
  const redirectUrl =
    typeof post.expedia_url === 'string' && post.expedia_url.startsWith('http')
      ? post.expedia_url
      : EXPEDIA_FALLBACK;

  log(`[go] redirectUrl: ${redirectUrl}`);

  // Fetch creator username
  let creatorUsername: string | null = null;
  if (creatorId) {
    const { data: creator } = await supabase
      .from('users')
      .select('username')
      .eq('id', creatorId)
      .maybeSingle();
    creatorUsername = creator?.username ?? null;
  }

  // Log click — must await so it actually executes before the response is sent
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
  const userAgent = req.headers.get('user-agent') || '';
  const referer = req.headers.get('referer') || '';

  log('[go] inserting click tracking row...');
  const { error: clickError } = await supabase
    .from('click_tracking')
    .insert({
      post_id: postId,
      creator_id: creatorId || null,
      creator_username: creatorUsername,
      post_title: post.title,
      post_location: post.location,
      ip_address: ip,
      user_agent: userAgent,
      referer: referer,
      agoda_url: redirectUrl,
    });

  if (clickError) {
    log(`[go] click tracking insert FAILED: ${clickError.message} | ${clickError.details} | ${clickError.hint}`);
  } else {
    log('[go] click tracking insert SUCCESS');
  }

  if (debug) return NextResponse.json({ logs, redirectUrl });
  return NextResponse.redirect(redirectUrl);
}
