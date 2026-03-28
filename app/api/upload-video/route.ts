import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2, R2_BUCKET, getPublicUrl } from '@/lib/r2';

export const runtime = 'nodejs';
export const maxDuration = 120;
export const dynamic = 'force-dynamic';

// Note: This direct-upload route is limited by Vercel's 4.5MB request body limit.
// For large videos, the client should use /api/video/presign for direct-to-R2 uploads.

export async function POST(req: NextRequest) {
  console.log('[upload-video] Received request, content-length:', req.headers.get('content-length'));

  try {
    // Validate R2 config
    if (!process.env.CLOUDFLARE_R2_ENDPOINT || !process.env.CLOUDFLARE_R2_PUBLIC_URL) {
      console.error('[upload-video] Missing R2 env vars:', {
        hasEndpoint: !!process.env.CLOUDFLARE_R2_ENDPOINT,
        hasPublicUrl: !!process.env.CLOUDFLARE_R2_PUBLIC_URL,
        hasAccessKey: !!process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
        hasSecretKey: !!process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
      });
      return NextResponse.json(
        { error: 'Video uploads are not configured. Please contact support.' },
        { status: 503 },
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn('[upload-video] Unauthorized request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (err) {
      console.error('[upload-video] Failed to parse formData (likely exceeds Vercel 4.5MB body limit):', err);
      return NextResponse.json(
        { error: 'File too large for direct upload. Please try again — the app will use a faster upload method.' },
        { status: 413 },
      );
    }

    const file = formData.get('video') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No video provided' }, { status: 400 });
    }

    console.log(`[upload-video] File: ${file.name}, size: ${(file.size / 1024 / 1024).toFixed(1)}MB, type: ${file.type}`);

    // 100MB limit (consistent with /api/video/upload)
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json({ error: `File is ${Math.round(file.size / 1024 / 1024)}MB. Maximum size is 100MB.` }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4';
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `videos/${timestamp}-${safeName}`;

    const buf = Buffer.from(await file.arrayBuffer());

    const contentTypeMap: Record<string, string> = {
      mp4: 'video/mp4',
      mov: 'video/quicktime',
      webm: 'video/webm',
    };

    console.log(`[upload-video] Uploading to R2: ${key} (${(buf.length / 1024 / 1024).toFixed(1)}MB)`);

    await r2.send(new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buf,
      ContentType: contentTypeMap[ext] || 'video/mp4',
    }));

    const url = getPublicUrl(key);
    console.log(`[upload-video] Success: ${file.name} -> ${url}`);

    return NextResponse.json({ url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[upload-video] ERROR:', message, err);

    if (message.includes('Body exceeded') || message.includes('too large') || message.includes('PayloadTooLargeError')) {
      return NextResponse.json(
        { error: 'File too large for direct upload. Please try again.' },
        { status: 413 },
      );
    }

    return NextResponse.json({ error: `Upload failed: ${message}` }, { status: 500 });
  }
}
