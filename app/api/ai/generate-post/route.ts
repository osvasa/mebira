import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { EXPEDIA_URL } from '@/lib/agoda';

const FALLBACK = {
  title: '',
  description: '',
  category: 'apartment',
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
          content: `You are a real estate content analyst for Mebira, a short-form real estate discovery platform. Your job is to extract property information from TikTok video metadata and generate an engaging listing post.

${contextBlock}

STEP 1 — EXTRACT LOCATION (most critical field):
Read the caption word by word and each hashtag individually. Identify city names, neighborhoods, and country names.
Location must be ONLY the city/neighborhood. NEVER include property names or developer names in location — those go in the title.
Examples:
- Caption mentions "penthouse" + hashtag #miami → location: "Miami Beach"
- Hashtag #tulum → location: "Tulum"
- Hashtag #dubaimarina → location: "Dubai Marina"
IMPORTANT: If NO city or area appears anywhere in caption or hashtags, return "" for location. Never guess.

STEP 2 — EXTRACT COUNTRY:
Return ONLY the country name from the location context. Examples: "Mexico", "USA", "UAE", "Spain".

STEP 3 — GENERATE TITLE (max 60 chars):
Put the property name or key feature HERE in the title. Make it catchy and specific.
Good: "Oceanfront Penthouse — 3BR with Private Pool"
Good: "Modern Loft in the Heart of Roma Norte"
Bad: "Beautiful Property" (too generic)

STEP 4 — GENERATE DESCRIPTION (max 200 chars):
Write in first person as if YOU toured this property. Make readers want to inquire immediately. Highlight key features: size, views, amenities, neighborhood vibe, price range if visible.
Good: "Floor-to-ceiling windows with unobstructed ocean views. This 2,400 sqft penthouse has a private rooftop terrace that makes every sunset feel like an event."
Bad: "Nice apartment with good views." (boring, generic)

STEP 5 — PICK CATEGORY:
apartment = condos, apartments, penthouses, lofts, studios
house = single-family homes, townhouses, duplexes
villa = luxury villas, estates, mansions, beachfront homes
commercial = offices, retail, warehouses, mixed-use
land = plots, lots, development land, farms
rental = short-term rentals, vacation rentals, furnished apartments

Return ONLY valid JSON (no markdown, no code fences):
{
  "title": "Property name or feature in title (max 60 chars)",
  "description": "First-person inspiring description (max 200 chars)",
  "category": "apartment",
  "location": "City or Neighborhood",
  "country": "Country"
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
