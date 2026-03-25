import Link from 'next/link';
import { Story } from '@/lib/types';

interface StoriesRowProps {
  stories: Story[];
}

export function StoriesRow({ stories }: StoriesRowProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
        Top Destinations
      </p>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-0.5">
        {stories.map((story) => (
          <Link
            key={story.id}
            href={`/search?q=${encodeURIComponent(story.destination)}&source=destinations`}
            className="group relative flex-shrink-0 w-[130px] h-[88px] rounded-xl overflow-hidden block"
          >
            {/* City photo */}
            <img
              src={story.image}
              alt={story.destination}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
            />

            {/* Gradient overlay — stronger at bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            {/* City name */}
            <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2">
              <p className="text-white text-xs font-bold leading-tight drop-shadow-sm">
                {story.destination}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
