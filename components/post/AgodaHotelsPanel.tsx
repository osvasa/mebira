'use client';

import { ExternalLink, Hotel } from 'lucide-react';
import { EXPEDIA_URL } from '@/lib/agoda';
import { BookingCategories } from '@/components/post/BookingCategories';

interface Props {
  destination: string;
  postTitle: string;
}

export function AgodaHotelsPanel({ destination }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Hotel className="w-4 h-4 text-sky-500" />
        <h3 className="text-sm font-bold text-slate-900">
          Hotels in {destination}
        </h3>
      </div>

      <div className="text-center py-2">
        <p className="text-xs text-slate-400 mb-3">
          Search for hotels in {destination}
        </p>
      </div>

      {/* Footer CTA */}
      <a
        href={EXPEDIA_URL}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="flex items-center justify-center gap-2 w-full mt-4 py-2.5 border border-sky-200 text-sky-600 rounded-xl text-xs font-bold hover:bg-sky-50 transition-colors"
      >
        See all hotels in {destination}
        <ExternalLink className="w-3 h-3" />
      </a>
      {/* Booking category buttons */}
      <div className="mt-4">
        <BookingCategories />
      </div>
    </div>
  );
}
