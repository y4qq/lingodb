"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type Track = {
  id: string;
  label: string;
  src: string;
  context?: string;
  durationSeconds?: number | null;
};

export type AudioPlayerApi = {
  track: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  play: (track: Track) => void;
  pause: () => void;
  toggle: () => void;
  seek: (seconds: number) => void;
  skipBy: (seconds: number) => void;
  close: () => void;
};

const AudioPlayerContext = createContext<AudioPlayerApi | null>(null);

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [track, setTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    audio.src = track.src;
    audio.currentTime = 0;
    setCurrentTime(0);
    setDuration(track.durationSeconds ?? 0);
    void audio.play().catch(() => {
      // Autoplay can be blocked (no user gesture); stay paused silently.
    });
  }, [track]);

  const play = useCallback((next: Track) => {
    setTrack((prev) => {
      if (prev?.id === next.id) {
        void audioRef.current?.play();
        return prev;
      }
      return next;
    });
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play();
    else audio.pause();
  }, []);

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = seconds;
    setCurrentTime(seconds);
  }, []);

  const skipBy = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const bound = Number.isFinite(audio.duration) ? audio.duration : Infinity;
    const next = Math.max(0, Math.min(bound, audio.currentTime + seconds));
    audio.currentTime = next;
    setCurrentTime(next);
  }, []);

  const close = useCallback(() => {
    audioRef.current?.pause();
    setTrack(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  const api = useMemo<AudioPlayerApi>(
    () => ({
      track,
      isPlaying,
      currentTime,
      duration,
      audioRef,
      play,
      pause,
      toggle,
      seek,
      skipBy,
      close,
    }),
    [
      track,
      isPlaying,
      currentTime,
      duration,
      play,
      pause,
      toggle,
      seek,
      skipBy,
      close,
    ],
  );

  return (
    <AudioPlayerContext value={api}>
      {children}
      {/* Hidden audio element owned by the provider. */}
      <audio
        ref={audioRef}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => {
          const d = e.currentTarget.duration;
          if (Number.isFinite(d)) setDuration(d);
        }}
        className="hidden"
      />
    </AudioPlayerContext>
  );
}

export function useAudioPlayer(): AudioPlayerApi {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) {
    throw new Error("useAudioPlayer must be used inside <AudioPlayerProvider>");
  }
  return ctx;
}
