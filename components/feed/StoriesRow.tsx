import Link from 'next/link';
import { Story } from '@/lib/types';

interface StoriesRowProps {
  stories: Story[];
}

const counties = [
  { id: 'county-1', name: 'Miami-Dade County', image: 'https://images.unsplash.com/photo-1535498730771-e735b998cd64?w=800' },
  { id: 'county-2', name: 'Broward County', image: 'https://images.unsplash.com/photo-1593696954577-ab3d39317b97?w=800' },
  { id: 'county-3', name: 'Palm Beach County', image: 'https://images.unsplash.com/photo-1583843569955-bb6c1f6a83b9?w=800' },
  { id: 'county-4', name: 'Martin County', image: 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800' },
  { id: 'county-5', name: 'St. Lucie County', image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800' },
];

export function StoriesRow({ stories }: StoriesRowProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
        Top Markets
      </p>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-0.5">
        {counties.map((county) => (
          <Link
            key={county.id}
            href="/explore"
            className="group relative flex-shrink-0 w-[130px] h-[88px] rounded-xl overflow-hidden block"
          >
            {/* County photo */}
            <img
              src={county.image}
              alt={county.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
            />

            {/* Gradient overlay — stronger at bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            {/* County name */}
            <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2">
              <p className="text-white text-xs font-bold leading-tight drop-shadow-sm">
                {county.name}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
