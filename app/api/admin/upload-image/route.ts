import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseServer } from '@/lib/supabase/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2, R2_BUCKET, getPublicUrl } from '@/lib/r2';
import { randomUUID } from 'crypto';
import sharp from 'sharp';

export const runtime = 'nodejs';
export const maxDuration = 30;
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Verify admin
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    if (!user?.email || user.email !== adminEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('image') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const rawBuf = Buffer.from(await file.arrayBuffer());

    // Resize and compress: max 1920px wide, 80% JPEG quality
    const compressed = await sharp(rawBuf)
      .resize({ width: 1920, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    const key = `temp/${randomUUID()}.jpg`;

    await r2.send(new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: compressed,
      ContentType: 'image/jpeg',
    }));

    console.log(`[upload-image] ${file.name}: ${(rawBuf.length / 1024).toFixed(0)}KB → ${(compressed.length / 1024).toFixed(0)}KB`);

    const url = getPublicUrl(key);
    return NextResponse.json({ url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[upload-image] ERROR:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
