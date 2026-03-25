// One-time script: Backfill country field on all posts using Claude Haiku
// Run: node scripts/backfill-countries.js

const { createClient } = require('@supabase/supabase-js');
const Anthropic = require('@anthropic-ai/sdk').default;
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function getCountry(location) {
  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 50,
    messages: [
      {
        role: 'user',
        content: `What country is this location in? Reply with only the country name, nothing else. Location: ${location}`,
      },
    ],
  });
  return message.content[0].text.trim();
}

async function main() {
  // Fetch all posts
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, location, country')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to fetch posts:', error.message);
    process.exit(1);
  }

  console.log(`Found ${posts.length} posts total.`);

  // Filter to only posts without a country
  const toBackfill = posts.filter((p) => !p.country);
  console.log(`${toBackfill.length} posts need country backfill.\n`);

  let success = 0;
  let failed = 0;

  for (const post of toBackfill) {
    try {
      const country = await getCountry(post.location);
      console.log(`[${post.id}] "${post.location}" → ${country}`);

      const { error: updateError } = await supabase
        .from('posts')
        .update({ country })
        .eq('id', post.id);

      if (updateError) {
        console.error(`  ✗ Update failed: ${updateError.message}`);
        failed++;
      } else {
        success++;
      }
    } catch (err) {
      console.error(`  ✗ API error for "${post.location}": ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone. ${success} updated, ${failed} failed.`);
}

main().catch(console.error);
