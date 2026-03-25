import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { createClient } from '@supabase/supabase-js';
import { r2, R2_BUCKET, getPublicUrl } from '@/lib/r2';

/**
 * POST /api/backfill-thumbnails
 *
 * Finds all posts with a video_url but no photo_url, attempts to fetch
 * a TikTok thumbnail via tikwm.com, uploads it to R2, and updates the post.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY to bypass RLS.
 * If not available, uses the anon key (may be blocked by RLS).
 */
export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const key = serviceKey || anonKey;
  if (!supabaseUrl || !key) {
    return NextResponse.json({ error: 'Missing Supabase env vars' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, key);

  // Find posts missing thumbnails
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, video_url')
    .not('video_url', 'is', null)
    .is('photo_url', null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!posts || posts.length === 0) {
    return NextResponse.json({ message: 'No posts need backfilling', updated: 0 });
  }

  const results: { id: string; status: string; thumbnail_url?: string }[] = [];

  for (const post of posts) {
    try {
      // Try to get a TikTok cover from tikwm — use the R2 video URL as a hint
      // We need the original TikTok URL, but we only have the R2 URL.
      // Instead, we'll try to fetch a frame from the video URL itself using tikwm
      // This won't work for R2 URLs, so we'll skip non-TikTok videos.
      //
      // For now, if the video_url is an R2 URL, we can't automatically get a thumbnail.
      // The user should re-process those posts through /create.

      // Check if video_url looks like a TikTok URL (not an R2 URL)
      if (post.video_url?.includes('tiktok.com')) {
        const tikwmRes = await fetch(
          `https://www.tikwm.com/api/?url=${encodeURIComponent(post.video_url)}`,
          { headers: { Accept: 'application/json' } }
        );
        const json = await tikwmRes.json();
        const coverUrl = json?.data?.cover || json?.data?.origin_cover;

        if (coverUrl) {
          const thumbRes = await fetch(coverUrl);
          if (thumbRes.ok) {
            const thumbBuffer = Buffer.from(await thumbRes.arrayBuffer());
            const contentType = thumbRes.headers.get('content-type') || 'image/jpeg';
            const ext = contentType.includes('png') ? 'png' : 'jpeg';
            const thumbKey = `thumbnails/${randomUUID()}.${ext}`;

            await r2.send(
              new PutObjectCommand({
                Bucket: R2_BUCKET,
                Key: thumbKey,
                Body: thumbBuffer,
                ContentType: contentType,
              })
            );

            const thumbnailUrl = getPublicUrl(thumbKey);

            await supabase
              .from('posts')
              .update({ photo_url: thumbnailUrl })
              .eq('id', post.id);

            results.push({ id: post.id, status: 'updated', thumbnail_url: thumbnailUrl });
            continue;
          }
        }
      }

      results.push({ id: post.id, status: 'skipped — not a TikTok URL' });
    } catch (err) {
      results.push({ id: post.id, status: `error: ${err instanceof Error ? err.message : 'unknown'}` });
    }
  }

  const updated = results.filter((r) => r.status === 'updated').length;
  return NextResponse.json({ message: `Backfilled ${updated}/${posts.length} posts`, results });
}
