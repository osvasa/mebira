'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Volume2, VolumeX } from 'lucide-react';

interface VideoOverlayProps {
  src: string;
  open: boolean;
  onClose: () => void;
}

export function VideoOverlay({ src, open, onClose }: VideoOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  useEffect(() => {
    if (open && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9998]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 sm:bg-black/80"
        onClick={onClose}
      />

      {/* Video container */}
      <div className="absolute inset-0 z-[9999] flex items-center justify-center pointer-events-none">
        <video
          ref={videoRef}
          src={src}
          autoPlay
          muted={muted}
          playsInline
          loop
          className="w-auto h-full max-h-[90vh] sm:max-h-[85vh] aspect-[9/16] object-contain bg-black rounded-none sm:rounded-2xl pointer-events-auto"
        />
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-[10000] w-10 h-10 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Mute toggle */}
      <button
        onClick={() => {
          setMuted(!muted);
          if (videoRef.current) videoRef.current.muted = !muted;
        }}
        className="fixed bottom-6 right-6 z-[10000] w-10 h-10 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
        aria-label={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>
    </div>
  );
}
