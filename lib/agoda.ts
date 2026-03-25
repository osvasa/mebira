export const EXPEDIA_URL = process.env.NEXT_PUBLIC_EXPEDIA_URL ?? 'https://expedia.com/affiliates/osvasa/socialtravel';

// ── Types ──────────────────────────────────────────────────────────────────

export interface AgodaHotel {
  id: number;
  name: string;
  stars: number;
  rating: number;
  reviewCount: number;
  thumbnail: string;
  priceFrom: number;
  currency: string;
  url: string;
  city: string;
}

// ── URL builders ───────────────────────────────────────────────────────────

/** Build a booking search URL for the given destination */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function buildHotelSearchUrl(_destination: string, _query?: string): string {
  return EXPEDIA_URL;
}

/** Build a flight search URL */
export function buildFlightUrl(
  _originIATA: string, // eslint-disable-line @typescript-eslint/no-unused-vars
  _destinationIATA: string, // eslint-disable-line @typescript-eslint/no-unused-vars
  _departDate: string, // eslint-disable-line @typescript-eslint/no-unused-vars
): string {
  return EXPEDIA_URL;
}

// ── IATA lookup ────────────────────────────────────────────────────────────

const CITY_IATA: Record<string, string> = {
  // Destinations in mock data
  Maldives: 'MLE',
  Male: 'MLE',
  Bali: 'DPS',
  Ubud: 'DPS',
  Denpasar: 'DPS',
  Santorini: 'JTR',
  Tokyo: 'TYO',
  Shinjuku: 'TYO',
  Kyoto: 'KIX',
  Osaka: 'KIX',
  Sapporo: 'CTS',
  Tulum: 'CUN',
  Cancun: 'CUN',
  Positano: 'NAP',
  Naples: 'NAP',
  Rome: 'FCO',
  Amalfi: 'NAP',
  Marrakech: 'RAK',
  Phuket: 'HKT',
  'Chiang Mai': 'CNX',
  Bangkok: 'BKK',
  Paris: 'CDG',
  Amsterdam: 'AMS',
  Barcelona: 'BCN',
  Madrid: 'MAD',
  Berlin: 'BER',
  Frankfurt: 'FRA',
  Zurich: 'ZRH',
  Vienna: 'VIE',
  Athens: 'ATH',
  Lisbon: 'LIS',
  Prague: 'PRG',
  Budapest: 'BUD',
  Copenhagen: 'CPH',
  Stockholm: 'ARN',
  Oslo: 'OSL',
  Helsinki: 'HEL',
  Dubai: 'DXB',
  Doha: 'DOH',
  Riyadh: 'RUH',
  'Tel Aviv': 'TLV',
  Cairo: 'CAI',
  Nairobi: 'NBO',
  'Cape Town': 'CPT',
  Singapore: 'SIN',
  'Kuala Lumpur': 'KUL',
  Jakarta: 'CGK',
  Manila: 'MNL',
  Taipei: 'TPE',
  'Ho Chi Minh City': 'SGN',
  Hanoi: 'HAN',
  'Hong Kong': 'HKG',
  Seoul: 'ICN',
  Beijing: 'PEK',
  Shanghai: 'PVG',
  Mumbai: 'BOM',
  Delhi: 'DEL',
  Sydney: 'SYD',
  Melbourne: 'MEL',
  Auckland: 'AKL',
  'New York': 'JFK',
  'Los Angeles': 'LAX',
  'San Francisco': 'SFO',
  Chicago: 'ORD',
  Miami: 'MIA',
  Toronto: 'YYZ',
  Vancouver: 'YVR',
  'Mexico City': 'MEX',
  'Buenos Aires': 'EZE',
  'São Paulo': 'GRU',
  Lima: 'LIM',
  Bogota: 'BOG',
  Istanbul: 'IST',
  London: 'LHR',
};

/**
 * Fuzzy-match a city/location string to an IATA code.
 * Returns null if no match found.
 */
export function cityToIATA(location: string): string | null {
  const loc = location.toLowerCase();
  for (const [city, iata] of Object.entries(CITY_IATA)) {
    if (loc.includes(city.toLowerCase()) || city.toLowerCase().includes(loc)) {
      return iata;
    }
  }
  return null;
}

/** Format tomorrow's date as YYYY-MM-DD */
export function tomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

/** Format n days from now as YYYY-MM-DD */
export function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

export interface AgodaSearchResult {
  hotelId: number | null;
  hotelName: string | null;
  price: number | null;
  currency: string;
  image: string | null;
  bookingUrl: string;
}

/** Search placeholder — returns the default Expedia affiliate URL */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function searchAgodaHotel(_params: {
  hotelName: string;
  location: string;
  postId?: string;
  creatorUsername?: string;
}): Promise<AgodaSearchResult> {
  return {
    hotelId: null,
    hotelName: null,
    price: null,
    currency: 'USD',
    image: null,
    bookingUrl: EXPEDIA_URL,
  };
}
