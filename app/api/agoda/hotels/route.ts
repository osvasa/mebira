import { NextRequest, NextResponse } from 'next/server';
import { EXPEDIA_URL } from '@/lib/agoda';

/**
 * GET /api/agoda/hotels?destination=Maldives
 * Now redirects to Expedia affiliate URL.
 */
export async function GET(req: NextRequest) {
  const destination = req.nextUrl.searchParams.get('destination') ?? '';

  if (!destination.trim()) {
    return NextResponse.json({ hotels: [], error: 'destination required' }, { status: 400 });
  }

  return NextResponse.json({ hotels: [], fallback: true, expediaUrl: EXPEDIA_URL });
}
