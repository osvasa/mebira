import { NextRequest, NextResponse } from 'next/server';
import { EXPEDIA_URL } from '@/lib/agoda';

/**
 * POST /api/agoda/search
 * Now returns the default Expedia affiliate URL.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { hotelName, location } = body;

    if (!hotelName || !location) {
      return NextResponse.json({ error: 'hotelName and location are required' }, { status: 400 });
    }

    return NextResponse.json({
      hotelId: null,
      hotelName: null,
      price: null,
      currency: 'USD',
      image: null,
      bookingUrl: EXPEDIA_URL,
    });
  } catch (err) {
    console.error('[agoda/search] route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
