'use client';

import { useRef, useState, useEffect } from 'react';
import { Volume2, VolumeX, X } from 'lucide-react';
import { RealtorOverlay } from '@/components/feed/RealtorOverlay';
import { User } from '@/lib/types';

interface PostVideoPlayerProps {
  src: string;
  poster?: string;
  user?: User;
}

export function PostVideoPlayer({ src, poster, user }: PostVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const tryPlay = () => { video.play().catch(() => {}); };
    video.addEventListener('canplay', tryPlay);
    tryPlay();
    return () => { video.removeEventListener('canplay', tryPlay); };
  }, []);

  useEffect(() => {
    if (!expanded) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [expanded]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    const newMuted = !video.muted;
    video.muted = newMuted;
    if (!newMuted) video.volume = 1;
    setMuted(newMuted);
  };

  return (
    <>
      {/* Backdrop when expanded */}
      {expanded && (
        <div
          className="fixed inset-0 z-[9998] bg-black/90"
          onClick={() => setExpanded(false)}
        />
      )}

      {/* Single video element — repositioned via CSS */}
      <div className={
        expanded
          ? 'fixed inset-0 z-[9999] flex items-center justify-center'
          : 'contents'
      }>
        <video
          ref={videoRef}
          src={src}
          className={
            expanded
              ? 'w-auto h-full max-h-[90vh] aspect-[9/16] object-contain bg-black rounded-2xl'
              : 'w-full h-full object-cover cursor-pointer'
          }
          autoPlay
          muted
          playsInline
          loop
          preload="auto"
          disablePictureInPicture
          controlsList="nodownload nofullscreen noremoteplayback nopictureinpicture"
          poster={poster}
          onClick={() => { if (!expanded) setExpanded(true); }}
        />
      </div>

      {/* Close button when expanded */}
      {expanded && (
        <button
          onClick={() => setExpanded(false)}
          className="fixed top-4 right-4 z-[10000] w-10 h-10 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Mute / unmute toggle */}
      <button
        onClick={toggleMute}
        className={
          expanded
            ? 'fixed bottom-6 right-6 z-[10000] w-10 h-10 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors'
            : 'absolute bottom-14 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors'
        }
        aria-label={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>

      {/* Realtor overlay when expanded */}
      {expanded && user && <RealtorOverlay user={user} />}
    </>
  );
}
