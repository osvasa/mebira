'use client';

interface PhotoGalleryProps {
  photoUrls?: string[] | null;
  category: string;
  location: string;
}

export function PhotoGallery({ photoUrls }: PhotoGalleryProps) {
  if (!photoUrls || photoUrls.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-2">
      {photoUrls.slice(0, 6).map((src, i) => (
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
