import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2, R2_BUCKET, getPublicUrl } from '@/lib/r2';
import { createClient } from '@/lib/supabase/server';

const ALLOWED_HOSTS = [
  'youtube.com',
  'www.youtube.com',
  'youtu.be',
  'm.youtube.com',
  'tiktok.com',
  'www.tiktok.com',
];

function isAllowedUrl(raw: string): boolean {
  try {
    const { hostname } = new URL(raw);
    return ALLOWED_HOSTS.some(
      (h) => hostname === h || hostname.endsWith(`.${h}`)
    );
  } catch {
    return false;
  }
}

function getPlatform(raw: string): 'tiktok' | 'youtube' | null {
  try {
    const { hostname } = new URL(raw);
    if (hostname.includes('tiktok.com')) return 'tiktok';
    if (hostname.includes('youtube.com') || hostname === 'youtu.be') return 'youtube';
    return null;
  } catch {
    return null;
  }
}

/** Extract YouTube video ID from any YouTube URL format */
function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('/')[0];
    if (u.pathname.startsWith('/shorts/')) return u.pathname.split('/')[2];
    return u.searchParams.get('v');
  } catch {
    return null;
  }
}

/** TikTok: use tikwm.com free API — returns no-watermark MP4 + cover thumbnail */
async function getTikTokData(url: string): Promise<{ videoUrl: string; coverUrl: string | null; videoId: string }> {
  const res = await fetch(
    `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`,
    { headers: { Accept: 'application/json' } }
  );

  if (!res.ok) {
    throw new Error(`tikwm API error: ${res.status}`);
  }

  const json = await res.json();

  if (json.code !== 0 || !json.data?.play) {
    throw new Error(
      `tikwm returned unexpected response: ${JSON.stringify(json).slice(0, 200)}`
    );
  }

  return {
    videoUrl: json.data.play,
    coverUrl: json.data.cover || json.data.origin_cover || null,
    videoId: String(json.data.id),
  };
}

/** YouTube: use @distube/ytdl-core (dynamic import to avoid build-time Node version issues) */
async function getYouTubeData(url: string): Promise<{ videoBuffer: Buffer; coverUrl: string | null }> {
  const videoId = getYouTubeId(url);
  const coverUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : null;

  // Dynamic import — @distube/ytdl-core requires Node 20+ which is available at runtime on Vercel
  const ytdl = await import('@distube/ytdl-core');

  const info = await ytdl.default.getInfo(url);

  // Try mp4 with video+audio first
  let format;
  const mp4Formats = info.formats.filter(
    (f) => f.container === 'mp4' && f.hasVideo && f.hasAudio && f.url
  );

  if (mp4Formats.length > 0) {
    // Pick highest quality mp4
    mp4Formats.sort((a, b) => (b.height ?? 0) - (a.height ?? 0));
    format = mp4Formats[0];
  } else {
    // Fallback: any format with video+audio
    const anyFormats = info.formats.filter(
      (f) => f.hasVideo && f.hasAudio && f.url
    );
    anyFormats.sort((a, b) => (b.height ?? 0) - (a.height ?? 0));
    format = anyFormats[0];
  }

  if (!format || !format.url) {
    throw new Error('No suitable video format found on YouTube');
  }

  const res = await fetch(format.url);
  if (!res.ok) throw new Error(`Failed to download YouTube video: ${res.status}`);
  return { videoBuffer: Buffer.from(await res.arrayBuffer()), coverUrl };
}

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url: string | undefined = body?.url;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Missing required field: url' },
        { status: 400 }
      );
    }

    if (!isAllowedUrl(url)) {
      return NextResponse.json(
        { error: 'URL must be from YouTube or TikTok' },
        { status: 400 }
      );
    }

    const platform = getPlatform(url);

    // 1. Get video data based on platform
    let videoBuffer: Buffer;
    let coverUrl: string | null = null;
    let sourceId: string; // deterministic ID for duplicate detection
    try {
      if (platform === 'tiktok') {
        const tiktokData = await getTikTokData(url);

        // Check for duplicate before downloading
        sourceId = `tt-${tiktokData.videoId}`;
        const supabase = await createClient();
        const { data: existing } = await supabase
          .from('posts')
          .select('id')
          .like('video_url', `%/${sourceId}.mp4`)
          .limit(1);
        if (existing && existing.length > 0) {
          return NextResponse.json(
            { error: 'This video has already been posted on Mebira' },
            { status: 409 }
          );
        }

        const videoRes = await fetch(tiktokData.videoUrl);
        if (!videoRes.ok) {
          throw new Error(`Failed to download TikTok video: ${videoRes.status}`);
        }
        videoBuffer = Buffer.from(await videoRes.arrayBuffer());
        coverUrl = tiktokData.coverUrl;
      } else if (platform === 'youtube') {
        const videoId = getYouTubeId(url);
        sourceId = `yt-${videoId}`;

        // Check for duplicate before downloading
        const supabase = await createClient();
        const { data: existing } = await supabase
          .from('posts')
          .select('id')
          .like('video_url', `%/${sourceId}.mp4`)
          .limit(1);
        if (existing && existing.length > 0) {
          return NextResponse.json(
            { error: 'This video has already been posted on Mebira' },
            { status: 409 }
          );
        }

        const ytData = await getYouTubeData(url);
        videoBuffer = ytData.videoBuffer;
        coverUrl = ytData.coverUrl;
      } else {
        return NextResponse.json(
          { error: 'Unsupported platform' },
          { status: 400 }
        );
      }
    } catch (dlErr: unknown) {
      const msg = dlErr instanceof Error ? dlErr.message : 'Download failed';
      if (msg === 'This video has already been posted on Mebira') {
        return NextResponse.json({ error: msg }, { status: 409 });
      }
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    // 2. Upload video to R2 (deterministic key for duplicate detection)
    const key = `videos/${sourceId}.mp4`;

    await r2.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: videoBuffer,
        ContentType: 'video/mp4',
      })
    );

    // 3. Upload thumbnail to R2 (if available)
    let thumbnailUrl: string | null = null;
    if (coverUrl) {
      try {
        const thumbRes = await fetch(coverUrl);
        if (thumbRes.ok) {
          const thumbBuffer = Buffer.from(await thumbRes.arrayBuffer());
          const contentType = thumbRes.headers.get('content-type') || 'image/jpeg';
          const ext = contentType.includes('png') ? 'png' : 'jpeg';
          const thumbKey = `thumbnails/${sourceId}.${ext}`;

          await r2.send(
            new PutObjectCommand({
              Bucket: R2_BUCKET,
              Key: thumbKey,
              Body: thumbBuffer,
              ContentType: contentType,
            })
          );

          thumbnailUrl = getPublicUrl(thumbKey);
        }
      } catch (thumbErr) {
        console.error('Failed to upload thumbnail:', thumbErr);
      }
    }

    // 4. Return public URLs
    const publicUrl = getPublicUrl(key);
    return NextResponse.json({ url: publicUrl, key, platform, thumbnail_url: thumbnailUrl });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
