'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { VideoOverlay } from '@/components/ui/VideoOverlay';

interface PostVideoPlayerProps {
  src: string;
  poster?: string;
}

export function PostVideoPlayer({ src, poster }: PostVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [overlayOpen, setOverlayOpen] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const tryPlay = () => { video.play().catch(() => {}); };
    video.addEventListener('canplay', tryPlay);
    tryPlay();
    return () => { video.removeEventListener('canplay', tryPlay); };
  }, []);

  // Pause inline video when overlay opens, resume when closed
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (overlayOpen) {
      video.pause();
    } else {
      video.play().catch(() => {});
    }
  }, [overlayOpen]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    const newMuted = !video.muted;
    video.muted = newMuted;
    if (!newMuted) video.volume = 1;
    setMuted(newMuted);
  };

  const handleClose = useCallback(() => setOverlayOpen(false), []);

  return (
    <>
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover cursor-pointer"
        autoPlay
        muted
        playsInline
        loop
        preload="auto"
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback nopictureinpicture"
        poster={poster}
        onClick={() => setOverlayOpen(true)}
      />

      {/* Mute / unmute toggle */}
      <button
        onClick={toggleMute}
        className="absolute bottom-14 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
        aria-label={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>

      {/* Fullscreen overlay */}
      <VideoOverlay src={src} open={overlayOpen} onClose={handleClose} />
    </>
  );
}
