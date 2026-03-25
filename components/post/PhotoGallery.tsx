'use client';

interface PhotoGalleryProps {
  photoUrls?: string[] | null;
  category: string;
  location: string;
}

const FALLBACK_PHOTOS = [
  'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?w=400',
  'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?w=400',
  'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?w=400',
  'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg?w=400',
  'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?w=400',
  'https://images.pexels.com/photos/280229/pexels-photo-280229.jpeg?w=400',
];

export function PhotoGallery({ photoUrls }: PhotoGalleryProps) {
  const photos = (photoUrls && photoUrls.length > 0)
    ? photoUrls.slice(0, 6)
    : FALLBACK_PHOTOS;

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
