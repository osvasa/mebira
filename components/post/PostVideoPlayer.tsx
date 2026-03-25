'use client';

import { useRef, useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface PostVideoPlayerProps {
  src: string;
  poster?: string;
}

export function PostVideoPlayer({ src, poster }: PostVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const tryPlay = () => { video.play().catch(() => {}); };
    video.addEventListener('canplay', tryPlay);
    tryPlay();
    return () => { video.removeEventListener('canplay', tryPlay); };
  }, []);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const newMuted = !video.muted;
    video.muted = newMuted;
    if (!newMuted) video.volume = 1;
    setMuted(newMuted);
  };

  return (
    <>
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover"
        autoPlay
        muted
        playsInline
        loop
        preload="auto"
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback nopictureinpicture"
        poster={poster}
      />

      {/* Mute / unmute toggle */}
      <button
        onClick={toggleMute}
        className="absolute bottom-14 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
        aria-label={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>
    </>
  );
}
