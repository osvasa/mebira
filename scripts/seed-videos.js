#!/usr/bin/env node

/**
 * Mebira — Seed Videos
 *
 * Downloads real estate stock videos from Pexels, uploads to R2,
 * and updates each seeded post with a video_url.
 *
 * Usage: node scripts/seed-videos.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const { createClient } = require('@supabase/supabase-js');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { randomUUID } = require('crypto');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const R2_ENDPOINT = process.env.CLOUDFLARE_R2_ENDPOINT;
const R2_ACCESS_KEY = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const R2_SECRET_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET || 'mebira-videos';
const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}
if (!R2_ENDPOINT || !R2_ACCESS_KEY || !R2_SECRET_KEY || !R2_PUBLIC_URL) {
  console.error('Missing R2 credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const r2 = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: { accessKeyId: R2_ACCESS_KEY, secretAccessKey: R2_SECRET_KEY },
});

// Search queries matched to categories for finding stock videos
const SEARCH_QUERIES = {
  apartment: [
    'luxury apartment interior',
    'modern apartment tour',
    'penthouse interior design',
    'city apartment view',
  ],
  house: [
    'luxury house exterior',
    'modern house tour',
    'family home interior',
    'house with pool',
  ],
  villa: [
    'luxury villa pool',
    'beachfront villa tour',
    'mediterranean villa',
    'luxury estate aerial',
  ],
  commercial: [
    'modern office interior',
    'commercial building exterior',
    'retail space interior',
  ],
  land: [
    'aerial land view',
    'coastal landscape drone',
  ],
  rental: [
    'furnished apartment interior',
    'vacation rental tour',
    'airbnb interior design',
  ],
};

// Pexels API — free with key
const PEXELS_KEY = 'bAKfGt4WIuyWrx6H7Cd1roXiqTOkt0WJ09cihUIJGXc8fPo4OWvi3sEg';

async function searchPexelsVideo(query) {
  const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=3&orientation=portrait`;
  const res = await fetch(url, {
    headers: { Authorization: PEXELS_KEY },
  });
  if (!res.ok) {
    console.error(`  Pexels search failed (${res.status}) for "${query}"`);
    return null;
  }
  const data = await res.json();
  const videos = data.videos || [];
  if (videos.length === 0) return null;

  // Pick a random one from top 3
  const video = videos[Math.floor(Math.random() * videos.length)];
  const files = video.video_files || [];

  // Prefer HD portrait, fallback to any
  const portrait = files.find(f => f.height > f.width && f.height >= 720);
  const hd = files.find(f => f.height >= 720);
  const best = portrait || hd || files[0];
  return best?.link || null;
}

async function downloadVideo(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed (${res.status}): ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function uploadToR2(buffer, key) {
  await r2.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: 'video/mp4',
  }));
  return `${R2_PUBLIC_URL.replace(/\/+$/, '')}/${key}`;
}

async function main() {
  console.log('='.repeat(50));
  console.log('  Mebira — Seed Videos');
  console.log('='.repeat(50));

  // Fetch all posts without video_url
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, category, location')
    .is('video_url', null)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to fetch posts:', error.message);
    process.exit(1);
  }

  console.log(`\nFound ${posts.length} posts without videos\n`);

  if (posts.length === 0) {
    console.log('All posts already have videos. Nothing to do.');
    return;
  }

  // Track which queries we've used per category to rotate
  const queryIndex = {};

  let success = 0;
  let failed = 0;

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const cat = post.category;
    const queries = SEARCH_QUERIES[cat] || SEARCH_QUERIES.apartment;

    // Rotate through queries for variety
    if (!queryIndex[cat]) queryIndex[cat] = 0;
    const query = queries[queryIndex[cat] % queries.length];
    queryIndex[cat]++;

    console.log(`[${i + 1}/${posts.length}] "${post.title}"`);
    console.log(`  Category: ${cat}, Search: "${query}"`);

    try {
      // Find a Pexels video
      const videoUrl = await searchPexelsVideo(query);
      if (!videoUrl) {
        console.log('  No video found, skipping');
        failed++;
        continue;
      }

      // Download
      console.log('  Downloading...');
      const buffer = await downloadVideo(videoUrl);
      console.log(`  Downloaded: ${(buffer.length / 1024 / 1024).toFixed(1)}MB`);

      // Upload to R2
      const key = `videos/seed-${randomUUID()}.mp4`;
      console.log('  Uploading to R2...');
      const r2Url = await uploadToR2(buffer, key);

      // Update post
      const { error: updateError } = await supabase
        .from('posts')
        .update({ video_url: r2Url })
        .eq('id', post.id);

      if (updateError) {
        console.log(`  Update failed: ${updateError.message}`);
        failed++;
      } else {
        console.log(`  Done: ${r2Url}`);
        success++;
      }
    } catch (err) {
      console.log(`  Error: ${err.message}`);
      failed++;
    }

    // Small delay to be nice to Pexels
    await new Promise(r => setTimeout(r, 500));
  }

  // Verify
  const { count } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .not('video_url', 'is', null);

  console.log('\n' + '='.repeat(50));
  console.log('  DONE');
  console.log('='.repeat(50));
  console.log(`  Success: ${success}`);
  console.log(`  Failed:  ${failed}`);
  console.log(`  Posts with video_url: ${count}`);
  console.log('='.repeat(50));
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
