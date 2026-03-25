import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { EXPEDIA_URL } from '@/lib/agoda';

const FALLBACK = {
  title: '',
  description: '',
  category: 'destination',
  location: '',
};

// Extract TikTok metadata via tikwm.com
async function fetchTikTokMeta(url: string) {
  try {
    const res = await fetch(
      `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`,
      { signal: AbortSignal.timeout(10000) },
    );
    const json = await res.json();
    if (json.code !== 0 || !json.data) return null;
    const d = json.data;
    return {
      title: d.title ?? '',
      author: d.author?.nickname ?? d.author?.unique_id ?? '',
      hashtags: (d.title ?? '').match(/#\w+/g)?.join(', ') ?? '',
      region: d.region ?? '',
      musicTitle: d.music_info?.title ?? '',
    };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { url, platform, locationHint } = await req.json();
    console.log('[ai/generate-post] called with url:', url, 'platform:', platform, 'locationHint:', locationHint);

    if (!url || typeof url !== 'string') {
      console.log('[ai/generate-post] missing url, returning 400');
      return NextResponse.json(
        { error: 'Missing required field: url' },
        { status: 400 },
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      console.log('[ai/generate-post] no ANTHROPIC_API_KEY');
      return NextResponse.json(FALLBACK);
    }

    // Fetch TikTok metadata if applicable
    const isTikTok = platform === 'tiktok' || /tiktok\.com/i.test(url);
    console.log('[ai/generate-post] isTikTok:', isTikTok);
    const tikTokMeta = isTikTok ? await fetchTikTokMeta(url) : null;
    console.log('[ai/generate-post] tikTokMeta:', JSON.stringify(tikTokMeta));

    // Build context for Claude
    let contextBlock = `Video URL: ${url}\nPlatform: ${platform ?? 'unknown'}`;
    if (locationHint) {
      contextBlock += `\nUser-provided location: ${locationHint}`;
    }
    if (tikTokMeta) {
      contextBlock += `\n\n--- TikTok metadata (READ EVERY WORD) ---`;
      if (tikTokMeta.title) contextBlock += `\nCaption: ${tikTokMeta.title}`;
      if (tikTokMeta.author) contextBlock += `\nAuthor: ${tikTokMeta.author}`;
      if (tikTokMeta.hashtags) contextBlock += `\nHashtags: ${tikTokMeta.hashtags}`;
      if (tikTokMeta.region) contextBlock += `\nRegion code: ${tikTokMeta.region}`;
      if (tikTokMeta.musicTitle) contextBlock += `\nMusic: ${tikTokMeta.musicTitle}`;
    }

    const client = new Anthropic();

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `You are a travel content analyst for a travel recommendation app. Your job is to extract real information from TikTok video metadata and generate an engaging post.

${contextBlock}

STEP 1 — EXTRACT LOCATION (most critical field):
Read the caption word by word and each hashtag individually. Identify city names, region names, and country names.
Location must be ONLY the city/region and country. NEVER include hotel names, restaurant names, or establishment names in location — those go in the title.
Examples:
- Caption mentions "Four Seasons" + hashtag #bali → location: "Bali, Indonesia" (NOT "Four Seasons, Bali, Indonesia")
- Caption mentions "Nobu" + hashtag #malibu → location: "Malibu, USA" (NOT "Nobu, Malibu, USA")
- Hashtag #amalficoast → location: "Amalfi Coast, Italy"
- Hashtag #tokyo → location: "Tokyo, Japan"
IMPORTANT: If NO city or country appears anywhere in caption or hashtags, return "" for location. Never guess.

STEP 2 — GENERATE TITLE (max 60 chars):
Put the establishment/venue name HERE in the title. Make it catchy and specific.
Good: "Four Seasons Bali — The OG Pool Villa Resort"
Good: "Sunset Dinner at Nobu Malibu"
Bad: "Beautiful Resort Experience" (too generic)

STEP 3 — GENERATE DESCRIPTION (max 200 chars):
Write in first person as if YOU visited. Make readers want to book immediately. Be vivid and specific about what makes this place special. Use sensory language — what you see, feel, taste.
Good: "Waking up to infinity pool views over the Indian Ocean. This place redefined luxury for me — every villa feels like your own private paradise."
Bad: "Great place with nice views and good service." (boring, generic)

STEP 4 — PICK CATEGORY:
hotel = accommodation (resorts, villas, hotels, stays)
restaurant = dining (restaurants, cafes, bars, street food)
destination = attraction or place (beaches, temples, cities, landmarks)
flight = airline or airport content
activity = experiences and tours (excursions, adventures, classes, events)
cruise = cruise ships and river cruises

Return ONLY valid JSON (no markdown, no code fences):
{
  "title": "Venue/place name in title (max 60 chars)",
  "description": "First-person inspiring description (max 200 chars)",
  "category": "hotel",
  "location": "City, Country"
}`,
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json(FALLBACK);
    }

    let raw = textBlock.text.trim();
    if (raw.startsWith('```')) {
      raw = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    }

    const result = JSON.parse(raw);

    const aiFields = {
      title: (result.title ?? '').slice(0, 60),
      description: (result.description ?? '').slice(0, 200),
      category: result.category ?? 'destination',
      location: result.location ?? '',
    };

    const response = {
      ...aiFields,
      expediaUrl: EXPEDIA_URL,
    };
    console.log('[ai/generate-post] success response:', JSON.stringify(response));
    return NextResponse.json(response);
  } catch (err) {
    console.error('[ai/generate-post]', err);
    return NextResponse.json(FALLBACK);
  }
}
