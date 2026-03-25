#!/usr/bin/env node

/**
 * Local video generation script for Mebira.
 *
 * Usage:
 *   node scripts/generate-video.js \
 *     --name "Four Seasons Bora Bora" \
 *     --location "Bora Bora, French Polynesia" \
 *     --category hotel \
 *     --images "/path/to/img1.jpg,/path/to/img2.jpg"
 */

const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');
const crypto = require('crypto');
const execFileAsync = promisify(execFile);

// ── Load .env.local ──
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EXPEDIA_URL = process.env.NEXT_PUBLIC_EXPEDIA_URL;
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
const R2_ENDPOINT = process.env.CLOUDFLARE_R2_ENDPOINT;
const R2_ACCESS_KEY = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const R2_SECRET_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET || 'mebira-videos';
const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL;

const TEMP_PREFIX = '/tmp/mebira-';
const VOICEOVER_PATH = `${TEMP_PREFIX}voiceover.mp3`;
const MUSIC_PATH = `${TEMP_PREFIX}music.mp3`;
const MIXED_PATH = `${TEMP_PREFIX}mixed.mp3`;
const FINAL_PATH = `${TEMP_PREFIX}final.mp4`;

// ── Parse CLI args ──
function parseArgs() {
  const args = process.argv.slice(2);
  const result = { name: '', location: '', category: 'hotel', images: [] };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--name': result.name = args[++i]; break;
      case '--location': result.location = args[++i]; break;
      case '--category': result.category = args[++i]; break;
      case '--images': result.images = args[++i].split(',').map(p => p.trim()); break;
    }
  }

  if (!result.name || !result.location || result.images.length === 0) {
    console.error('Usage: node scripts/generate-video.js --name "..." --location "..." --category hotel --images "/path/img1.jpg,/path/img2.jpg"');
    process.exit(1);
  }

  for (const img of result.images) {
    if (!fs.existsSync(img)) {
      console.error(`Image not found: ${img}`);
      process.exit(1);
    }
  }

  return result;
}

function log(step, msg) {
  console.log(`\n[${ step }] ${msg}`);
}

// ── API helpers ──

async function callClaude(prompt, maxTokens = 500) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Claude API ${res.status}: ${body}`);
  }
  const data = await res.json();
  return data.content[0].text;
}

async function generateVoiceover(script) {
  // Use macOS say command → AIFF → convert to MP3 via ffmpeg
  const aiffPath = `${TEMP_PREFIX}voiceover.aiff`;
  await execFileAsync('say', ['-v', 'Samantha', '-r', '160', '-o', aiffPath, script]);
  await execFileAsync('ffmpeg', ['-y', '-i', aiffPath, '-acodec', 'libmp3lame', '-ab', '192k', VOICEOVER_PATH]);
  try { fs.unlinkSync(aiffPath); } catch { /* ignore */ }
  return VOICEOVER_PATH;
}

async function generateMusic() {
  const res = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': ELEVENLABS_API_KEY,
    },
    body: JSON.stringify({
      text: 'relaxing ambient cinematic travel background music',
      duration_seconds: 60,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`ElevenLabs Music ${res.status}: ${body}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(MUSIC_PATH, buf);
  return MUSIC_PATH;
}

async function getAudioDuration(filePath) {
  const { stdout } = await execFileAsync('ffprobe', [
    '-v', 'quiet', '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1', filePath,
  ]);
  const d = parseFloat(stdout.trim());
  if (isNaN(d) || d <= 0) throw new Error(`Could not determine duration of ${filePath}`);
  return d;
}

async function mixAudio(voiceoverPath, musicPath, duration) {
  await execFileAsync('ffmpeg', [
    '-y',
    '-i', voiceoverPath,
    '-i', musicPath,
    '-filter_complex',
    '[1:a]volume=0.2[bg];[0:a][bg]amix=inputs=2:duration=first:dropout_transition=2[out]',
    '-map', '[out]',
    '-t', String(duration),
    MIXED_PATH,
  ]);
  return MIXED_PATH;
}

async function buildVideo(imagePaths, audioPath, duration) {
  const numImages = imagePaths.length;
  const displayDuration = duration / numImages;
  const fadeDuration = 0.5;

  const args = ['-y'];

  for (const img of imagePaths) {
    args.push('-loop', '1', '-t', String(displayDuration), '-i', img);
  }
  args.push('-i', audioPath);

  if (numImages === 1) {
    args.push(
      '-filter_complex',
      '[0:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black,setsar=1,format=yuv420p[v]',
      '-map', '[v]', '-map', `${numImages}:a`,
      '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
      '-c:a', 'aac', '-b:a', '128k',
      '-shortest', '-movflags', '+faststart',
      FINAL_PATH,
    );
  } else {
    let fc = '';
    for (let i = 0; i < numImages; i++) {
      fc += `[${i}:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black,setsar=1,format=yuv420p[v${i}];`;
    }
    let lastLabel = 'v0';
    for (let i = 1; i < numImages; i++) {
      const offset = displayDuration * i - fadeDuration;
      const outLabel = i === numImages - 1 ? 'vout' : `xf${i}`;
      fc += `[${lastLabel}][v${i}]xfade=transition=fade:duration=${fadeDuration}:offset=${Math.max(0, offset)}[${outLabel}];`;
      lastLabel = outLabel;
    }
    args.push(
      '-filter_complex', fc.replace(/;$/, ''),
      '-map', '[vout]', '-map', `${numImages}:a`,
      '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
      '-c:a', 'aac', '-b:a', '128k',
      '-shortest', '-movflags', '+faststart',
      FINAL_PATH,
    );
  }

  await execFileAsync('ffmpeg', args, { maxBuffer: 100 * 1024 * 1024 });
  return FINAL_PATH;
}

async function uploadToR2(filePath, key, contentType) {
  const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

  const client = new S3Client({
    region: 'auto',
    endpoint: R2_ENDPOINT,
    credentials: {
      accessKeyId: R2_ACCESS_KEY,
      secretAccessKey: R2_SECRET_KEY,
    },
  });

  const body = fs.readFileSync(filePath);
  await client.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
  }));

  return `${R2_PUBLIC_URL.replace(/\/+$/, '')}/${key}`;
}

async function createPost({ title, description, location, category, videoUrl, thumbnailUrl }) {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Look up admin user ID
  const { data: users, error: userErr } = await supabase
    .from('users')
    .select('id')
    .eq('email', ADMIN_EMAIL)
    .limit(1);

  if (userErr) throw new Error(`Supabase user lookup failed: ${userErr.message}`);
  if (!users || users.length === 0) throw new Error(`Admin user not found: ${ADMIN_EMAIL}`);
  const userId = users[0].id;

  const { data: post, error: postErr } = await supabase
    .from('posts')
    .insert({
      user_id: userId,
      title,
      description,
      photo_url: thumbnailUrl,
      video_url: videoUrl,
      location,
      category,
      expedia_url: EXPEDIA_URL || null,
    })
    .select()
    .single();

  if (postErr) throw new Error(`Supabase insert failed: ${postErr.message}`);
  return post;
}

function cleanup() {
  const files = [VOICEOVER_PATH, MUSIC_PATH, MIXED_PATH, FINAL_PATH];
  for (const f of files) {
    try { fs.unlinkSync(f); } catch { /* ignore */ }
  }
}

// ── Main ──

async function main() {
  const { name, location, category, images } = parseArgs();

  console.log('='.repeat(50));
  console.log('  Mebira Video Generator');
  console.log('='.repeat(50));
  console.log(`  Property: ${name}`);
  console.log(`  Location: ${location}`);
  console.log(`  Category: ${category}`);
  console.log(`  Images:   ${images.length} file(s)`);
  console.log('='.repeat(50));

  try {
    // Step 1: Generate script
    log('1/7', 'Generating voiceover script via Claude...');
    const script = await callClaude(
      `Write a 30-45 second voiceover narration script for a travel video about "${name}" in ${location}. Category: ${category}. The script should be engaging, cinematic, and naturally promote booking a stay or visit. Write ONLY the narration text, no stage directions or formatting. Keep it warm, inviting, and aspirational.`
    );
    console.log(`  Script (${script.length} chars):\n  "${script.substring(0, 120)}..."`);

    // Step 2: Generate voiceover
    log('2/7', 'Generating voiceover audio via macOS say...');
    await generateVoiceover(script);
    const duration = await getAudioDuration(VOICEOVER_PATH);
    console.log(`  Voiceover saved (${duration.toFixed(1)}s)`);

    // Step 3: Build video
    log('3/7', 'Building video slideshow with crossfades...');
    await buildVideo(images, VOICEOVER_PATH, duration);
    const stat = fs.statSync(FINAL_PATH);
    console.log(`  Video saved (${(stat.size / 1024 / 1024).toFixed(1)} MB)`);

    // Step 4: Upload video to R2
    log('4/7', 'Uploading video to Cloudflare R2...');
    const videoId = `gen-${crypto.randomUUID()}`;
    const videoKey = `videos/${videoId}.mp4`;
    const videoUrl = await uploadToR2(FINAL_PATH, videoKey, 'video/mp4');
    console.log(`  Video URL: ${videoUrl}`);

    // Step 5: Upload thumbnail
    log('5/7', 'Uploading thumbnail to R2...');
    const thumbExt = images[0].split('.').pop() || 'jpg';
    const thumbKey = `thumbnails/${videoId}.${thumbExt}`;
    const thumbnailUrl = await uploadToR2(images[0], thumbKey, thumbExt === 'png' ? 'image/png' : 'image/jpeg');
    console.log(`  Thumbnail URL: ${thumbnailUrl}`);

    // Step 6: Generate post metadata
    log('6/7', 'Generating post title and description via Claude...');
    const metaRaw = await callClaude(
      `Generate a social-media post title and description for a travel recommendation about "${name}" in ${location}. Category: ${category}.\n\nReturn ONLY valid JSON: {"title": "...", "description": "..."}\n\nTitle: Short, catchy (under 60 chars). Description: 2-3 sentences, engaging, includes relevant hashtags.`,
      300
    );

    let postTitle = name;
    let postDescription = `Discover ${name} in ${location}`;
    try {
      const match = metaRaw.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        postTitle = parsed.title || postTitle;
        postDescription = parsed.description || postDescription;
      }
    } catch { /* use defaults */ }

    console.log(`  Title: ${postTitle}`);

    // Step 7: Create post in Supabase
    log('7/7', 'Creating post in Supabase...');
    const post = await createPost({
      title: postTitle,
      description: postDescription,
      location,
      category,
      videoUrl,
      thumbnailUrl,
    });

    console.log('\n' + '='.repeat(50));
    console.log('  SUCCESS!');
    console.log('='.repeat(50));
    console.log(`  Post ID:     ${post.id}`);
    console.log(`  Title:       ${postTitle}`);
    console.log(`  Location:    ${location}`);
    console.log(`  Video:       ${videoUrl}`);
    console.log(`  View at:     ${process.env.NEXT_PUBLIC_SITE_URL}/post/${post.id}`);
    console.log('='.repeat(50));

  } catch (err) {
    console.error('\n  ERROR:', err.message || err);
    process.exit(1);
  } finally {
    log('CLEANUP', 'Removing temp files...');
    cleanup();
    console.log('  Done.');
  }
}

main();
