"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
} from "lucide-react";
import {
  AudioPlayerProvider,
  useAudioPlayer,
} from "@/components/audio-player";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

export type LessonPlayerVersion = {
  id: string;
  label: string;
  audioDurationSeconds: number | null;
  isCurrent: boolean;
  signedUrl: string | null;
};

type Props = {
  courseSlug: string;
  unitSlug: string;
  unitTitle: string;
  lessonTitle: string;
  lessonDescription: string | null;
  versions: LessonPlayerVersion[];
};

export function LessonPlayer(props: Props) {
  return (
    <AudioPlayerProvider>
      <LessonPlayerUI {...props} />
    </AudioPlayerProvider>
  );
}

function LessonPlayerUI({
  courseSlug,
  unitSlug,
  unitTitle,
  lessonTitle,
  lessonDescription,
  versions,
}: Props) {
  const { track, isPlaying, currentTime, duration, play, toggle, seek, skipBy } =
    useAudioPlayer();
  const [scrubbing, setScrubbing] = useState<number | null>(null);
  const startedRef = useRef(false);

  const playable = versions.filter((v) => v.signedUrl);
  const currentByFlag = playable.find((v) => v.isCurrent);
  const initial = currentByFlag ?? playable[0] ?? null;
  const activeVersion = versions.find((v) => v.id === track?.id) ?? initial;

  useEffect(() => {
    if (startedRef.current || !initial) return;
    startedRef.current = true;
    play({
      id: initial.id,
      label: initial.label,
      src: initial.signedUrl!,
      durationSeconds: initial.audioDurationSeconds,
    });
  }, [initial, play]);

  const max = duration > 0 ? duration : track?.durationSeconds ?? 0;
  const displayTime = scrubbing ?? currentTime;
  const remaining = Math.max(0, max - displayTime);

  function selectVersion(v: LessonPlayerVersion) {
    if (!v.signedUrl) return;
    play({
      id: v.id,
      label: v.label,
      src: v.signedUrl,
      durationSeconds: v.audioDurationSeconds,
    });
  }

  return (
    <div className="flex min-h-svh flex-col">
      <header className="px-6 py-4">
        <Button asChild variant="ghost" size="icon" aria-label="Back to unit">
          <Link href={`/courses/${courseSlug}/${unitSlug}`}>
            <ChevronLeft />
          </Link>
        </Button>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-12 px-6 py-8">
        <div className="flex max-w-xl flex-col items-center gap-2 text-center">
          <p className="text-muted-foreground text-sm">{unitTitle}</p>
          <h1 className="text-2xl font-semibold tracking-tight">{lessonTitle}</h1>
          {lessonDescription && (
            <p className="text-muted-foreground mt-2 text-sm">
              {lessonDescription}
            </p>
          )}
        </div>

        <div className="flex w-full max-w-md flex-col gap-6">
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

          <div className="flex items-center justify-center gap-6">
            <Button
              variant="ghost"
              size="icon-lg"
              onClick={() => skipBy(-15)}
              aria-label="Back 15 seconds"
            >
              <RotateCcw />
              <span className="text-[10px] font-medium">15</span>
            </Button>
            <Button
              size="icon"
              className="size-16 rounded-full"
              onClick={toggle}
              disabled={!track}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="size-6 fill-current" />
              ) : (
                <Play className="size-6 translate-x-px fill-current" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon-lg"
              onClick={() => skipBy(15)}
              aria-label="Forward 15 seconds"
            >
              <RotateCw />
              <span className="text-[10px] font-medium">15</span>
            </Button>
          </div>
        </div>
      </main>

      <footer className="flex items-center justify-center px-6 py-6">
        {activeVersion &&
          (playable.length >= 2 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <span>{activeVersion.label}</span>
                  <ChevronDown data-icon="inline-end" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="min-w-56">
                {versions.map((v) => {
                  const isActive = v.id === activeVersion.id;
                  const disabled = !v.signedUrl;
                  return (
                    <DropdownMenuItem
                      key={v.id}
                      disabled={disabled}
                      onSelect={() => selectVersion(v)}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="flex items-center gap-2">
                        <Check
                          className={cn(
                            "size-3.5",
                            isActive ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <span className="font-medium">{v.label}</span>
                        {v.isCurrent && (
                          <Badge variant="secondary" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </span>
                      <span className="text-muted-foreground font-mono text-xs tabular-nums">
                        {formatTime(v.audioDurationSeconds ?? 0)}
                      </span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <span className="text-muted-foreground px-3 text-sm">
              {activeVersion.label}
            </span>
          ))}
      </footer>
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
