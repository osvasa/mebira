import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2, R2_BUCKET, getPublicUrl } from '@/lib/r2';

const MAX_SIZE = 100 * 1024 * 1024; // 100 MB

export async function POST(req: NextRequest) {
  try {
    // Validate R2 config before attempting upload
    if (!process.env.CLOUDFLARE_R2_ENDPOINT) {
      console.error('[video/upload] CLOUDFLARE_R2_ENDPOINT not configured');
      return NextResponse.json(
        { error: 'Video uploads are not configured. Please contact support.' },
        { status: 503 },
      );
    }
    if (!process.env.CLOUDFLARE_R2_PUBLIC_URL) {
      console.error('[video/upload] CLOUDFLARE_R2_PUBLIC_URL not configured');
      return NextResponse.json(
        { error: 'Video uploads are not configured. Please contact support.' },
        { status: 503 },
      );
    }

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (err) {
      console.error('[video/upload] Failed to parse form data:', err);
      return NextResponse.json(
        { error: 'Invalid upload. Please try again with a video file.' },
        { status: 400 },
      );
    }

    const file = formData.get('video') as File | null;

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { error: 'No video file received. Please select a file and try again.' },
        { status: 400 },
      );
    }

    if (!file.type.startsWith('video/')) {
      return NextResponse.json(
        { error: `"${file.name}" is not a video file (type: ${file.type}). Please upload MP4, MOV, or WebM.` },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `File is ${Math.round(file.size / 1024 / 1024)}MB. Maximum size is 100MB.` },
        { status: 400 },
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: 'File is empty. Please select a valid video file.' },
        { status: 400 },
      );
    }

    console.log(`[video/upload] Uploading ${file.name} (${Math.round(file.size / 1024 / 1024)}MB, ${file.type})`);

    const buffer = Buffer.from(await file.arrayBuffer());

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'mp4';
    const safeExt = ['mp4', 'mov', 'webm', 'avi', 'mkv'].includes(ext) ? ext : 'mp4';
    const id = randomUUID();
    const key = `videos/${id}.${safeExt}`;

    await r2.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      }),
    );

    const publicUrl = getPublicUrl(key);
    console.log(`[video/upload] Success: ${key}`);
    return NextResponse.json({ url: publicUrl, key, platform: 'upload' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[video/upload] Error:', msg, err);

    // Provide user-friendly error messages for common failures
    if (msg.includes('fetch') || msg.includes('ECONNREFUSED') || msg.includes('network')) {
      return NextResponse.json(
        { error: 'Could not connect to storage service. Please try again in a moment.' },
        { status: 502 },
      );
    }
    if (msg.includes('AccessDenied') || msg.includes('credentials') || msg.includes('Forbidden')) {
      return NextResponse.json(
        { error: 'Storage access error. Please contact support.' },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: `Upload failed: ${msg}` },
      { status: 500 },
    );
  }
}
