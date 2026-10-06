"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AMBIENT_VIDEO_URL, AMBIENT_POSTER_URL } from "@/lib/constants";

type Props = { soundOnLabel: string; soundOffLabel: string };

function SpeakerOffIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor" stroke="none" />
      <line x1="22" y1="9" x2="16" y2="15" />
      <line x1="16" y1="9" x2="22" y2="15" />
    </svg>
  );
}

function SpeakerOnIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor" stroke="none" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  );
}

export default function HeroVideo({ soundOnLabel, soundOffLabel }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rampRef = useRef<number | null>(null);
  const [soundOn, setSoundOn] = useState(false);

  const stopRamp = useCallback(() => {
    if (rampRef.current !== null) {
      cancelAnimationFrame(rampRef.current);
      rampRef.current = null;
    }
  }, []);

  useEffect(() => stopRamp, [stopRamp]);

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;

    if (soundOn) {
      video.muted = true;
      video.volume = 0;
      stopRamp();
      setSoundOn(false);
      return;
    }

    // Разрешаем звук только по жесту пользователя: muted=false внутри клика
    // не блокируется автополиси браузера, затем плавно поднимаем громкость.
    video.muted = false;
    video.play()?.catch(() => {});
    const start = performance.now();
    const duration = 1200;
    stopRamp();
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      video.volume = progress;
      if (progress < 1) {
        rampRef.current = requestAnimationFrame(step);
      } else {
        rampRef.current = null;
      }
    };
    rampRef.current = requestAnimationFrame(step);
    setSoundOn(true);
  };

  return (
    <div className="absolute inset-0 bg-night">
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster={AMBIENT_POSTER_URL}
        aria-hidden="true"
      >
        <source src={AMBIENT_VIDEO_URL} type="video/mp4" />
      </video>
      <button
        type="button"
        onClick={toggleSound}
        aria-label={soundOn ? soundOnLabel : soundOffLabel}
        title={soundOn ? soundOnLabel : soundOffLabel}
        className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-night-soft/70 ring-1 ring-night-line backdrop-blur-md transition-colors hover:bg-night-soft/95"
      >
        {soundOn ? (
          <SpeakerOnIcon className="h-5 w-5 text-ink" />
        ) : (
          <SpeakerOffIcon className="h-5 w-5 text-ink" />
        )}
      </button>
    </div>
  );
}