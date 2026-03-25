import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2, R2_BUCKET, getPublicUrl } from '@/lib/r2';

export async function POST(req: NextRequest) {
  try {
    if (!process.env.CLOUDFLARE_R2_ENDPOINT || !process.env.CLOUDFLARE_R2_PUBLIC_URL) {
      return NextResponse.json(
        { error: 'Video uploads are not configured. Please contact support.' },
        { status: 503 },
      );
    }

    const { filename, contentType } = await req.json();

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: 'Missing filename or contentType.' },
        { status: 400 },
      );
    }

    if (!contentType.startsWith('video/')) {
      return NextResponse.json(
        { error: 'Only video files are allowed.' },
        { status: 400 },
      );
    }

    const ext = filename.split('.').pop()?.toLowerCase() ?? 'mp4';
    const safeExt = ['mp4', 'mov', 'webm', 'avi', 'mkv'].includes(ext) ? ext : 'mp4';
    const id = randomUUID();
    const key = `videos/${id}.${safeExt}`;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 600 });
    const publicUrl = getPublicUrl(key);

    return NextResponse.json({ uploadUrl, publicUrl, key });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[video/presign] Error:', msg);
    return NextResponse.json({ error: `Failed to generate upload URL: ${msg}` }, { status: 500 });
  }
}
