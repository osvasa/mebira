import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2, R2_BUCKET, getPublicUrl } from '@/lib/r2';

export const runtime = 'nodejs';
export const maxDuration = 120;
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('video') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No video provided' }, { status: 400 });
    }

    // 500MB limit
    if (file.size > 500 * 1024 * 1024) {
      return NextResponse.json({ error: 'File exceeds 500MB limit' }, { status: 400 });
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

    await r2.send(new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buf,
      ContentType: contentTypeMap[ext] || 'video/mp4',
    }));

    const url = getPublicUrl(key);
    console.log(`[upload-video] ${file.name}: ${(buf.length / 1024 / 1024).toFixed(1)}MB -> ${url}`);

    return NextResponse.json({ url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[upload-video] ERROR:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
