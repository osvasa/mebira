import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { mockPosts } from '@/lib/mockData';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { vibe } = await req.json();

    if (!vibe?.trim()) {
      return NextResponse.json({ error: 'Vibe is required' }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      // Dev fallback: return first 2 posts with mock reasons
      return NextResponse.json({
        matches: [
          { postId: mockPosts[0].id, reason: 'Perfect for your kind of escape', score: 88 },
          { postId: mockPosts[3].id, reason: 'Matches your discovery vibe', score: 74 },
        ],
        summary: '2 vibe matches found',
      });
    }

    // Trim posts to just the metadata Claude needs to match vibes
    const postsContext = mockPosts.map((p) => ({
      id: p.id,
      title: p.title,
      location: p.location,
      country: p.country,
      category: p.category,
      description: p.description.slice(0, 180),
      tags: p.tags,
      price: p.price,
      rating: p.rating,
    }));

    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are a travel vibe matcher for Mebira, a social travel platform. Match the user's vibe description to the most relevant travel posts based on mood, atmosphere, style — not just keywords.

User vibe: "${vibe}"

Available posts:
${JSON.stringify(postsContext, null, 2)}

Instructions:
- Analyze the emotional and aesthetic qualities of the vibe
- Match posts by feeling, atmosphere, and lifestyle — not keyword overlap
- Write reasons that feel personal and evocative (start with "Perfect for", "Ideal for", "Made for")
- Keep reasons under 55 characters

Return ONLY valid JSON, no markdown fences, no extra text:
{
  "matches": [
    { "postId": "string", "reason": "Perfect for...", "score": 85 }
  ],
  "summary": "3 dreamy matches for your vibe"
}

Only include posts scoring >= 45. Max 4 results. Order by score descending.`,
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') throw new Error('No text block');

    let raw = textBlock.text.trim();
    // Strip markdown code fences if Claude wrapped in them
    if (raw.startsWith('```')) {
      raw = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    }

    const result = JSON.parse(raw);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[vibe-search]', err);
    return NextResponse.json(
      { error: 'Vibe search failed', matches: [], summary: '' },
      { status: 500 }
    );
  }
}
