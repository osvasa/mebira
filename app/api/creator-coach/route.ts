import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic();

const FALLBACK_TIPS = [
  {
    type: 'suggestion',
    icon: '📸',
    title: 'Add a stunning photo',
    detail: 'Posts with high-quality photos get 8× more engagement.',
  },
  {
    type: 'opportunity',
    icon: '💰',
    title: 'Include a price range',
    detail: 'Adding pricing info boosts Expedia clicks by 40%.',
  },
  {
    type: 'suggestion',
    icon: '📍',
    title: 'Be specific with location',
    detail: 'Exact locations build trust and help followers plan better.',
  },
];

export async function POST(req: NextRequest) {
  try {
    const { title, description, category, location, price, hasImage, tags } = await req.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ tips: FALLBACK_TIPS, overallScore: 25 });
    }

    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      thinking: { type: 'adaptive' },
      messages: [
        {
          role: 'user',
          content: `You are an expert travel content coach helping creators on Osvasa maximize engagement and affiliate earnings. Analyze this post draft and give exactly 3 coaching tips.

Draft:
- Title: ${title || '(empty)'}
- Category: ${category || 'not set'}
- Location: ${location || '(empty)'}
- Description: ${description || '(empty)'}
- Has photo: ${hasImage ? 'Yes ✓' : 'No — this is critical!'}
- Price range: ${price || '(not set)'}
- Tags: ${tags?.length > 0 ? tags.join(', ') : '(none)'}

Be encouraging, specific, and data-driven. Never harsh. Always find something positive.

Tip types:
- "success" = something done well (shown in green) — always include at least one
- "suggestion" = helpful improvement (shown in blue)
- "opportunity" = high-impact missing element (shown in amber)

Key data points to reference:
- No photo → "Posts with photos earn 8× more engagement"
- No price → "Adding pricing boosts Expedia clicks by 40%"
- No location → "Specific locations build 2× more trust with readers"
- Strong description → "Great storytelling drives 3× more saves"
- Good tags → "5+ tags expand reach by 60%"

Return ONLY valid JSON (no markdown, no code fences):
{
  "tips": [
    {
      "type": "success" | "suggestion" | "opportunity",
      "icon": "one emoji",
      "title": "Encouraging title under 38 chars",
      "detail": "Specific tip with a data stat, under 88 chars"
    }
  ],
  "overallScore": 0-100
}

Scoring guide: 0-15 = basically empty, 20-40 = minimal content, 45-65 = decent draft, 70-85 = good post, 86-100 = excellent.`,
        },
      ],
    });

    // Find the text block (skip thinking blocks)
    const textBlock = message.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') throw new Error('No text response');

    let raw = textBlock.text.trim();
    if (raw.startsWith('```')) {
      raw = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    }

    const result = JSON.parse(raw);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[creator-coach]', err);
    return NextResponse.json({ tips: FALLBACK_TIPS, overallScore: 0 });
  }
}
