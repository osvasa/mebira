'use client';

import { Plane, ExternalLink } from 'lucide-react';
import { BookingCategories } from '@/components/post/BookingCategories';

interface Props {
  destination: string;
  country: string;
}

export function AgodaFlightSearch({ destination }: Props) {
  const destCity = destination.split(',')[0].trim();

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Plane className="w-4 h-4 text-sky-500" />
        <h3 className="text-sm font-bold text-slate-900">Fly to {destCity}</h3>
      </div>

      {/* Booking category buttons */}
      <BookingCategories />

      {/* Search flights button */}
      <a
        href="https://mebira.pro"
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="flex items-center justify-center gap-2 w-full mt-4 py-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-xl font-bold text-sm hover:from-sky-600 hover:to-sky-700 active:scale-[0.98] transition-all shadow-md shadow-sky-200"
      >
        <Plane className="w-4 h-4" />
        Search Flights
        <ExternalLink className="w-3.5 h-3.5 opacity-70" />
      </a>
    </div>
  );
}
