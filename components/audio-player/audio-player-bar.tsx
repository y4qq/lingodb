"use client";

import { useState } from "react";
import { Pause, Play, RotateCcw, RotateCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useAudioPlayer } from "./audio-player-provider";

export function AudioPlayerBar() {
  const {
    track,
    isPlaying,
    currentTime,
    duration,
    toggle,
    seek,
    skipBy,
    close,
  } = useAudioPlayer();
  const [scrubbing, setScrubbing] = useState<number | null>(null);

  if (!track) return null;

  const displayTime = scrubbing ?? currentTime;
  const max = duration > 0 ? duration : track.durationSeconds ?? 0;
  const remaining = Math.max(0, max - displayTime);

  return (
    <div className="bg-background sticky bottom-0 z-40 -mx-6 border-t">
      <div className="relative mx-auto flex max-w-xl flex-col gap-3 px-6 py-4">
        <Button
          variant="ghost"
          size="icon-sm"
          className="absolute top-2 right-2"
          onClick={close}
          aria-label="Close player"
        >
          <X />
        </Button>

        <div className="flex flex-col items-center text-center">
          <span className="truncate text-sm font-medium">{track.label}</span>
          {track.context && (
            <span className="text-muted-foreground truncate text-xs">
              {track.context}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-muted-foreground w-10 text-right font-mono text-xs tabular-nums">
            {formatTime(displayTime)}
          </span>
          <Slider
            min={0}
            max={max || 1}
            step={0.1}
            value={[displayTime]}
            onValueChange={([v]) => setScrubbing(v)}
            onValueCommit={([v]) => {
              setScrubbing(null);
              seek(v);
            }}
            disabled={max <= 0}
            className="flex-1"
            aria-label="Seek"
          />
          <span className="text-muted-foreground w-12 font-mono text-xs tabular-nums">
            -{formatTime(remaining)}
          </span>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => skipBy(-15)}
            aria-label="Back 15 seconds"
          >
            <RotateCcw />
            <span className="text-xs font-medium">15</span>
          </Button>
          <Button
            size="icon"
            className="size-12 rounded-full"
            onClick={toggle}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="size-5 fill-current" />
            ) : (
              <Play className="size-5 translate-x-px fill-current" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => skipBy(15)}
            aria-label="Forward 15 seconds"
          >
            <RotateCw />
            <span className="text-xs font-medium">15</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
