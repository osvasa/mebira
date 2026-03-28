import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// SimplyRETS test credentials (returns realistic fake MLS data)
const SIMPLYRETS_BASE = 'https://api.simplyrets.com';
const SIMPLYRETS_AUTH = 'Basic ' + Buffer.from('simplyrets:simplyrets').toString('base64');

interface SimplyRetsListing {
  mlsId: number;
  listPrice: number;
  property: {
    bedrooms: number;
    bathsFull: number;
    bathsHalf: number;
    area: number;
    type: string;
    subType: string;
    style: string;
  };
  remarks: string;
  address: {
    full: string;
    city: string;
    state: string;
    postalCode: string;
    streetName: string;
    streetNumber: string;
  };
  photos: string[];
}

type MebiraCategory = 'house' | 'apartment' | 'villa' | 'commercial' | 'land' | 'rental' | 'preconstruction';

function mapPropertyType(type: string, subType: string): MebiraCategory {
  const t = (type || '').toLowerCase();
  const st = (subType || '').toLowerCase();

  if (st.includes('condo') || t.includes('condo')) return 'apartment';
  if (st.includes('multi') || t.includes('multi')) return 'apartment';
  if (t.includes('land') || t.includes('lot')) return 'land';
  if (t.includes('commercial')) return 'commercial';
  if (t.includes('rental') || st.includes('rental')) return 'rental';
  if (t.includes('residential') || t.includes('single')) return 'house';
  return 'house';
}

function formatListing(listing: SimplyRetsListing) {
  const addr = listing.address;
  const prop = listing.property;
  return {
    listingId: String(listing.mlsId),
    price: listing.listPrice ? `$${listing.listPrice.toLocaleString('en-US')}` : null,
    bedrooms: prop?.bedrooms ?? null,
    bathrooms: (prop?.bathsFull ?? 0) + (prop?.bathsHalf ?? 0) * 0.5 || null,
    sqft: prop?.area ?? null,
    description: listing.remarks || null,
    address: addr?.full || null,
    city: addr?.city || null,
    state: addr?.state || null,
    location: [addr?.city, addr?.state].filter(Boolean).join(', ') || null,
    photos: listing.photos || [],
    category: mapPropertyType(prop?.type || '', prop?.subType || ''),
    title: addr?.full
      ? `${addr.streetNumber || ''} ${addr.streetName || ''}`.trim() || addr.full
      : null,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, mlsId } = body as { address?: string; mlsId?: string };

    if (!address && !mlsId) {
      return NextResponse.json(
        { error: 'Provide an address or MLS ID.' },
        { status: 400 },
      );
    }

    let url: string;
    if (mlsId) {
      url = `${SIMPLYRETS_BASE}/listings/${encodeURIComponent(mlsId)}`;
    } else {
      url = `${SIMPLYRETS_BASE}/listings?q=${encodeURIComponent(address!)}&limit=1`;
    }

    console.log(`[mls/lookup] Fetching: ${url}`);

    const res = await fetch(url, {
      headers: { Authorization: SIMPLYRETS_AUTH },
    });

    if (!res.ok) {
      console.error(`[mls/lookup] SimplyRETS returned ${res.status}`);
      return NextResponse.json(
        { error: `MLS lookup failed (${res.status}). Check the ID or address and try again.` },
        { status: res.status === 404 ? 404 : 502 },
      );
    }

    const data = await res.json();

    // mlsId returns a single object; address search returns an array
    if (mlsId) {
      if (!data || !data.mlsId) {
        return NextResponse.json({ error: 'Listing not found.' }, { status: 404 });
      }
      return NextResponse.json(formatListing(data));
    }

    // Address search returns array
    const listings = Array.isArray(data) ? data : [];
    if (listings.length === 0) {
      return NextResponse.json(
        { error: 'No listings found for that address.' },
        { status: 404 },
      );
    }

    return NextResponse.json(formatListing(listings[0]));
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[mls/lookup] Error:', msg, err);
    return NextResponse.json({ error: `MLS lookup failed: ${msg}` }, { status: 500 });
  }
}
