"use client";

import { useState } from "react";
import {
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Volume,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useAudioPlayer } from "@/components/audio-player";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const SPEED_STEPS = [0.75, 1, 1.25, 1.5, 1.75, 2];
const VOLUME_STEPS = [0, 0.25, 0.5, 0.75, 1];

type Props = {
  disabled?: boolean;
};

export function LessonPlayerView({ disabled = false }: Props) {
  const {
    track,
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    volume,
    toggle,
    seek,
    skipBy,
    setPlaybackRate,
    setVolume,
  } = useAudioPlayer();
  const [scrubbing, setScrubbing] = useState<number | null>(null);

  const max = duration > 0 ? duration : track?.durationSeconds ?? 0;
  const displayTime = scrubbing ?? currentTime;
  const remaining = Math.max(0, max - displayTime);
  const transportDisabled = disabled || !track;

  function cycleSpeed() {
    const idx = SPEED_STEPS.findIndex((s) => Math.abs(s - playbackRate) < 0.01);
    const next = SPEED_STEPS[(idx + 1) % SPEED_STEPS.length] ?? 1;
    setPlaybackRate(next);
  }

  function cycleVolume() {
    const idx = VOLUME_STEPS.findIndex((v) => Math.abs(v - volume) < 0.01);
    const next =
      VOLUME_STEPS[(idx + 1) % VOLUME_STEPS.length] ?? 1;
    setVolume(next);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
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
          disabled={transportDisabled || max <= 0}
          className="[&_[data-slot=slider-range]]:bg-muted-foreground/70 [&_[data-slot=slider-track]]:bg-muted [&_[data-slot=slider-thumb]]:bg-muted-foreground [&_[data-slot=slider-thumb]]:ring-transparent"
          aria-label="Seek"
        />
        <div className="text-muted-foreground flex justify-between font-mono text-base tabular-nums">
          <span>{formatTime(displayTime)}</span>
          <span>-{formatTime(remaining)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          onClick={cycleSpeed}
          aria-label={`Playback speed ${playbackRate}x`}
          className="text-muted-foreground hover:text-foreground h-14 min-w-16 rounded-full text-base font-semibold tabular-nums"
        >
          {formatSpeed(playbackRate)}
        </Button>

        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            onClick={() => skipBy(-15)}
            disabled={transportDisabled}
            aria-label="Back 15 seconds"
            className="text-muted-foreground hover:text-foreground size-20 rounded-full"
          >
            <SkipIcon direction="back" label="15" />
          </Button>
          <Button
            variant="ghost"
            onClick={toggle}
            disabled={transportDisabled}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="text-muted-foreground hover:text-foreground size-28 rounded-full [&_svg:not([class*='size-'])]:size-16"
          >
            {isPlaying ? (
              <Pause className="fill-current" />
            ) : (
              <Play className="translate-x-1 fill-current" />
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={() => skipBy(15)}
            disabled={transportDisabled}
            aria-label="Forward 15 seconds"
            className="text-muted-foreground hover:text-foreground size-20 rounded-full"
          >
            <SkipIcon direction="forward" label="15" />
          </Button>
        </div>

        <Button
          variant="ghost"
          onClick={cycleVolume}
          aria-label={`Volume ${Math.round(volume * 100)}%`}
          className={cn(
            "text-muted-foreground hover:text-foreground h-14 min-w-16 rounded-full",
            "[&_svg:not([class*='size-'])]:size-7",
          )}
        >
          <VolumeIcon volume={volume} />
        </Button>
      </div>
    </div>
  );
}

function SkipIcon({
  direction,
  label,
}: {
  direction: "back" | "forward";
  label: string;
}) {
  const Icon = direction === "back" ? RotateCcw : RotateCw;
  return (
    <span className="relative inline-flex size-12 items-center justify-center">
      <Icon className="size-12" />
      <span className="absolute text-[11px] font-semibold leading-none">
        {label}
      </span>
    </span>
  );
}

function VolumeIcon({ volume }: { volume: number }) {
  if (volume <= 0.01) return <VolumeX />;
  if (volume < 0.34) return <Volume />;
  if (volume < 0.67) return <Volume1 />;
  return <Volume2 />;
}

function formatSpeed(rate: number): string {
  if (Number.isInteger(rate)) return `${rate}×`;
  return `${rate}×`;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
