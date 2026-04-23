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
  playbackRate: number;
  volume: number;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  play: (track: Track) => void;
  pause: () => void;
  toggle: () => void;
  seek: (seconds: number) => void;
  skipBy: (seconds: number) => void;
  setPlaybackRate: (rate: number) => void;
  setVolume: (volume: number) => void;
  close: () => void;
};

const AudioPlayerContext = createContext<AudioPlayerApi | null>(null);

export function AudioPlayerProvider({
  children,
  onEnded,
}: {
  children: ReactNode;
  onEnded?: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [track, setTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [volume, setVolumeState] = useState(1);
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    audio.src = track.src;
    audio.currentTime = 0;
    audio.playbackRate = playbackRate;
    audio.volume = volume;
    setCurrentTime(0);
    setDuration(track.durationSeconds ?? 0);
    void audio.play().catch(() => {
      // Autoplay can be blocked (no user gesture); stay paused silently.
    });
    // playbackRate/volume applied here on track change; dedicated effects
    // below handle live updates without re-triggering the track load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const play = useCallback((next: Track) => {
    setTrack((prev) => {
      if (prev?.id === next.id) {
        void audioRef.current?.play().catch(() => {});
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
    if (audio.paused) void audio.play().catch(() => {});
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

  const setPlaybackRate = useCallback((rate: number) => {
    setPlaybackRateState(rate);
  }, []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(Math.max(0, Math.min(1, v)));
  }, []);

  const api = useMemo<AudioPlayerApi>(
    () => ({
      track,
      isPlaying,
      currentTime,
      duration,
      playbackRate,
      volume,
      audioRef,
      play,
      pause,
      toggle,
      seek,
      skipBy,
      setPlaybackRate,
      setVolume,
      close,
    }),
    [
      track,
      isPlaying,
      currentTime,
      duration,
      playbackRate,
      volume,
      play,
      pause,
      toggle,
      seek,
      skipBy,
      setPlaybackRate,
      setVolume,
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
        onEnded={() => {
          setIsPlaying(false);
          onEndedRef.current?.();
        }}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => {
          const d = e.currentTarget.duration;
          if (Number.isFinite(d)) setDuration(d);
        }}
        onError={() => {
          setIsPlaying(false);
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
