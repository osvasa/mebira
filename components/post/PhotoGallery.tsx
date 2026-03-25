'use client';

interface PhotoGalleryProps {
  photoUrls?: string[] | null;
  category: string;
  location: string;
}

export function PhotoGallery({ photoUrls, category, location }: PhotoGalleryProps) {
  // Use uploaded photos if available, otherwise fall back to Unsplash
  const photos = (photoUrls && photoUrls.length > 0)
    ? photoUrls.slice(0, 6)
    : Array.from({ length: 6 }, (_, i) => {
        const query = `real-estate,${category},${location}`.replace(/\s+/g, '-');
        return `https://source.unsplash.com/400x300/?${encodeURIComponent(query)}&sig=${i}`;
      });

  return (
    <div className="grid grid-cols-3 gap-2">
      {photos.map((src, i) => (
        <div key={i} className="aspect-[4/3] rounded-lg overflow-hidden bg-slate-100">
          <img
            src={src}
            alt={`Property photo ${i + 1}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
}
