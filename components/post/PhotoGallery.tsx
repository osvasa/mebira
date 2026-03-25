'use client';

interface PhotoGalleryProps {
  category: string;
  location: string;
}

export function PhotoGallery({ category, location }: PhotoGalleryProps) {
  // Generate 6 unique Unsplash source URLs with cache-busting via sig param
  const photos = Array.from({ length: 6 }, (_, i) => {
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
