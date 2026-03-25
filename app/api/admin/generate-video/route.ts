import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseServer } from '@/lib/supabase/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2, R2_BUCKET, getPublicUrl } from '@/lib/r2';
import { randomUUID } from 'crypto';
import RunwayML from '@runwayml/sdk';

export const runtime = 'nodejs';
export const maxDuration = 300;
export const dynamic = 'force-dynamic';

const CATEGORIES = ['hotel', 'restaurant', 'destination', 'flight', 'activity', 'cruise'];

const STYLE_PROMPTS: Record<string, string> = {
  'luxury-escape': 'Cinematic luxury travel video. Hook: stunning aerial or wide establishing shot. Experience: guests enjoying pool, dining, or suite with beautiful views. Detail: close-up of premium textures, design elements, or signature feature. Closing: golden hour wide shot, emotional and aspirational. Style: smooth camera motion, warm cinematic tones, fast cuts 2-3 seconds each. Goal: make viewer want to book immediately.',
  'adventure-vibe': 'Cinematic adventure travel video. Hook: dramatic landscape or action shot. Experience: exploring, discovering, moving through the destination. Detail: authentic local texture, food, culture, or nature. Closing: epic sunset or panoramic view. Style: dynamic camera motion, vibrant colors, energetic pacing. Goal: inspire wanderlust immediately.',
  'hidden-gem': 'Cinematic travel discovery video. Hook: unexpected beautiful angle of an underrated place. Experience: peaceful, uncrowded, authentic local atmosphere. Detail: unique charm, character, local life. Closing: intimate golden moment. Style: gentle camera motion, natural colors, slow-burn discovery feeling. Goal: make viewer feel they discovered a secret.',
};

async function verifyAdmin() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  if (!user?.email || user.email !== adminEmail) return null;
  return user;
}

function getAdminSupabase() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  let currentStep = 'init';
  try {
    console.log('[generate-video] POST started');

    const user = await verifyAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const propertyName = formData.get('propertyName') as string;
    const location = formData.get('location') as string;
    const category = formData.get('category') as string;
    const style = formData.get('style') as string || 'luxury-escape';
    const creatorId = formData.get('creatorId') as string | null;
    const image = formData.get('image') as File | null;

    if (!propertyName || !location || !category || !image) {
      return NextResponse.json({ error: 'Missing required fields (propertyName, location, category, image)' }, { status: 400 });
    }
    if (!CATEGORIES.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    const batchId = randomUUID();
    const prompt = STYLE_PROMPTS[style] || STYLE_PROMPTS['luxury-escape'];
    console.log(`[generate-video] ${propertyName} / ${location} / ${category} / style: ${style}`);

    // ── STEP 1: Upload image to R2 + prepare data URI ──
    currentStep = 'Step 1: Upload Image';
    console.log(`[generate-video] ${currentStep}`);

    const imgBuffer = Buffer.from(await image.arrayBuffer());
    const imgExt = image.name.split('.').pop() || 'jpg';
    const imgKey = `temp/${batchId}-hero.${imgExt}`;
    await r2.send(new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: imgKey,
      Body: imgBuffer,
      ContentType: imgExt === 'png' ? 'image/png' : 'image/jpeg',
    }));
    const imageR2Url = getPublicUrl(imgKey);
    console.log(`[generate-video] Image uploaded: ${imageR2Url}`);

    // ── STEP 2: Generate video with Runway ──
    currentStep = 'Step 2: Runway Video';
    console.log(`[generate-video] ${currentStep}`);

    const client = new RunwayML({ apiKey: process.env.RUNWAYML_API_SECRET });

    console.log(`[generate-video] Creating Runway task (gen4_turbo, 10s, 720:1280)...`);
    const task = await client.imageToVideo.create({
      model: 'gen4_turbo',
      promptImage: imageR2Url,
      promptText: prompt,
      duration: 10,
      ratio: '720:1280',
    });

    console.log(`[generate-video] Runway task created: ${task.id}`);

    // Poll for completion
    let runwayVideoUrl = '';
    const maxPolls = 60;
    for (let i = 0; i < maxPolls; i++) {
      await new Promise(r => setTimeout(r, 5000));
      const status = await client.tasks.retrieve(task.id);
      console.log(`[generate-video] Poll ${i + 1}: ${status.status}`);

      if (status.status === 'SUCCEEDED') {
        runwayVideoUrl = (status.output as string[])?.[0] || '';
        break;
      }
      if (status.status === 'FAILED') {
        throw new Error(`Runway task failed: ${JSON.stringify(status)}`);
      }
    }
    if (!runwayVideoUrl) throw new Error('Runway timed out after 5 minutes');
    console.log(`[generate-video] Runway video: ${runwayVideoUrl}`);

    // ── STEP 3: Upload video to R2 ──
    currentStep = 'Step 3: Upload to R2';
    console.log(`[generate-video] ${currentStep}`);

    const videoRes = await fetch(runwayVideoUrl);
    if (!videoRes.ok) throw new Error(`Failed to download Runway video: ${videoRes.status}`);
    const videoBuffer = Buffer.from(await videoRes.arrayBuffer());

    const videoKey = `videos/gen-${batchId}.mp4`;
    await r2.send(new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: videoKey,
      Body: videoBuffer,
      ContentType: 'video/mp4',
    }));
    const videoUrl = getPublicUrl(videoKey);
    console.log(`[generate-video] Video on R2: ${videoUrl}`);

    // ── STEP 4: Generate title + description ──
    currentStep = 'Step 4: Post Metadata';
    console.log(`[generate-video] ${currentStep}`);

    const metaRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: `Generate a social-media post title and description for a travel recommendation about "${propertyName}" in ${location}. Category: ${category}.\n\nReturn ONLY valid JSON: {"title": "...", "description": "..."}\n\nTitle: Short, catchy (under 60 chars), no emojis. Description: 2-3 sentences, engaging, no emojis, includes relevant hashtags.`,
        }],
      }),
    });
    if (!metaRes.ok) throw new Error(`Claude meta failed: ${metaRes.status}`);
    const metaData = await metaRes.json();
    const metaText = metaData.content[0].text;

    let postTitle = propertyName;
    let postDescription = `Discover ${propertyName} in ${location}`;
    try {
      const match = metaText.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        postTitle = parsed.title || postTitle;
        postDescription = parsed.description || postDescription;
      }
    } catch { /* use defaults */ }

    // ── STEP 5: Create Supabase post ──
    currentStep = 'Step 5: Create Post';
    console.log(`[generate-video] ${currentStep}`);

    const adminSupabase = getAdminSupabase();
    const postUserId = creatorId || user.id;

    const { data: post, error: postError } = await adminSupabase
      .from('posts')
      .insert({
        user_id: postUserId,
        title: postTitle,
        description: postDescription,
        photo_url: imageR2Url,
        video_url: videoUrl,
        location,
        category,
        expedia_url: process.env.NEXT_PUBLIC_EXPEDIA_URL || null,
      })
      .select()
      .single();

    if (postError) throw new Error(`Supabase insert failed: ${postError.message}`);
    console.log(`[generate-video] Post created: ${post.id}`);

    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        title: postTitle,
        description: postDescription,
        location,
        category,
        videoUrl,
        style,
      },
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const stack = err instanceof Error ? err.stack : '';
    console.error(`[generate-video] FAILED at: ${currentStep}`);
    console.error('[generate-video] ERROR:', message);
    return NextResponse.json({ error: `[${currentStep}] ${message}`, stack }, { status: 500 });
  }
}
