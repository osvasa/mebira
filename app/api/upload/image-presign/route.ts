import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2, R2_BUCKET, getPublicUrl } from '@/lib/r2';

export async function POST(req: NextRequest) {
  try {
    if (!process.env.CLOUDFLARE_R2_ENDPOINT || !process.env.CLOUDFLARE_R2_PUBLIC_URL) {
      return NextResponse.json(
        { error: 'Image uploads are not configured.' },
        { status: 503 },
      );
    }

    const { filename, contentType, folder } = await req.json();

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: 'Missing filename or contentType.' },
        { status: 400 },
      );
    }

    if (!contentType.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed.' },
        { status: 400 },
      );
    }

    const allowedFolders = ['avatars', 'covers'];
    const safeFolder = allowedFolders.includes(folder) ? folder : 'avatars';

    const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
    const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg';
    const id = randomUUID();
    const key = `${safeFolder}/${id}.${safeExt}`;

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
    console.error('[upload/image-presign] Error:', msg);
    return NextResponse.json({ error: `Failed to generate upload URL: ${msg}` }, { status: 500 });
  }
}
