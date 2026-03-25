'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationMapProps {
  location: string;
}

export function LocationMap({ location }: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    async function init() {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`,
          { headers: { 'User-Agent': 'Mebira/1.0' } }
        );
        const data = await res.json();
        if (!data.length) { setError(true); return; }

        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);

        const map = L.map(mapRef.current!, {
          scrollWheelZoom: false,
          attributionControl: true,
        }).setView([lat, lon], 14);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        const icon = L.divIcon({
          className: '',
          html: `<div style="width:24px;height:24px;background:#C8102E;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        L.marker([lat, lon], { icon }).addTo(map);
        mapInstance.current = map;
      } catch {
        setError(true);
      }
    }

    init();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [location]);

  if (error) return null;

  return (
    <div
      ref={mapRef}
      className="w-full rounded-xl overflow-hidden z-0"
      style={{ height: '300px' }}
    />
  );
}
