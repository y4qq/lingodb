"use client";

import { Suspense, use, useEffect, useRef, useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import {
  AudioPlayerProvider,
  useAudioPlayer,
} from "@/components/audio-player";
import { LessonPlayerView } from "@/components/app/lesson-player";
import { LessonRatingForm } from "@/components/app/lesson-rating-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  markLessonCompleted as markLessonCompletedAction,
  saveLessonPosition,
} from "@/lib/domains/courses/actions/progress";
import type {
  PlaybackLesson,
  PlaybackResult,
  PlaybackUnit,
} from "@/lib/domains/courses/actions/playback";
import { cn } from "@/lib/utils";

const POSITION_SAVE_INTERVAL_MS = 5000;
const COMPLETION_THRESHOLD = 0.95;

const COUNTDOWN_SECONDS = 5;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Server-action promise is created by the parent when the user opens a
  // lesson, so the fetch happens exactly once per open and we avoid the
  // useEffect-driven "fetch on mount" pattern the LessonDialog used to run.
  payloadPromise: Promise<PlaybackResult> | undefined;
  startLessonSlug: string;
};

export function LessonDialog({
  open,
  onOpenChange,
  payloadPromise,
  startLessonSlug,
}: Props) {
  const close = () => onOpenChange(false);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[100svh] w-screen max-w-none flex-col overflow-hidden rounded-none p-0 sm:max-w-none"
      >
        <DialogTitle className="sr-only">Lesson player</DialogTitle>
        {open && payloadPromise && (
          <Suspense fallback={<LoadingChrome onClose={close} />}>
            <LessonDialogBody
              payloadPromise={payloadPromise}
              startLessonSlug={startLessonSlug}
              onClose={close}
            />
          </Suspense>
        )}
      </DialogContent>
    </Dialog>
  );
}

function LessonDialogBody({
  payloadPromise,
  startLessonSlug,
  onClose,
}: {
  payloadPromise: Promise<PlaybackResult>;
  startLessonSlug: string;
  onClose: () => void;
}) {
  const result = use(payloadPromise);

  if (!result.ok) {
    return (
      <Chrome onClose={onClose}>
        <CenteredMessage
          title="Couldn't load lesson"
          body={result.error}
          onClose={onClose}
        />
      </Chrome>
    );
  }

  const payload = result.data;

  if (payload.unit.lessons.length === 0) {
    return (
      <Chrome onClose={onClose} unitTitle={payload.unit.title}>
        <CenteredMessage
          title="No lessons in this unit"
          body="Check back soon."
          onClose={onClose}
        />
      </Chrome>
    );
  }

  const startIndex = Math.max(
    0,
    payload.unit.lessons.findIndex((l) => l.slug === startLessonSlug),
  );

  return (
    <Playback unit={payload.unit} startIndex={startIndex} onClose={onClose} />
  );
}

function LoadingChrome({ onClose }: { onClose: () => void }) {
  return (
    <Chrome onClose={onClose}>
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground animate-pulse text-sm">
          Loading lesson…
        </div>
      </div>
    </Chrome>
  );
}

type Phase = "countdown" | "playing" | "rating" | "completed" | "error";

function Playback({
  unit,
  startIndex,
  onClose,
}: {
  unit: PlaybackUnit;
  startIndex: number;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [phase, setPhase] = useState<Phase>("countdown");
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  // The lesson currently visible to the user. Captured in a ref so the audio
  // provider's `onEnded` callback (which holds onto the first-render closure)
  // can mark the right lesson when it fires.
  const currentLessonRef = useRef(unit.lessons[startIndex]);
  currentLessonRef.current = unit.lessons[currentIndex];

  function handleEnded() {
    const lesson = currentLessonRef.current;
    const version = lesson ? pickPlayableVersion(lesson.audioVersions) : null;
    if (lesson && version) {
      void markLessonCompletedAction({
        lessonId: lesson.id,
        audioVersionId: version.id,
      }).catch(() => {});
    }
    // Pause on the just-finished lesson and ask for feedback. The rating phase
    // advances to the next lesson (or the unit-complete screen) when the user
    // submits or skips.
    setPhase("rating");
  }

  function advanceAfterRating() {
    if (currentIndex >= unit.lessons.length - 1) {
      setPhase("completed");
      return;
    }
    setCurrentIndex((i) => i + 1);
    setCountdown(COUNTDOWN_SECONDS);
    setPhase("countdown");
  }

  return (
    <AudioPlayerProvider onEnded={handleEnded}>
      <PlaybackView
        unit={unit}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
        phase={phase}
        setPhase={setPhase}
        countdown={countdown}
        setCountdown={setCountdown}
        onClose={onClose}
        onAdvanceAfterRating={advanceAfterRating}
      />
      <ProgressTracker
        lesson={unit.lessons[currentIndex]}
        active={phase === "playing"}
      />
    </AudioPlayerProvider>
  );
}

function PlaybackView({
  unit,
  currentIndex,
  setCurrentIndex,
  phase,
  setPhase,
  countdown,
  setCountdown,
  onClose,
  onAdvanceAfterRating,
}: {
  unit: PlaybackUnit;
  currentIndex: number;
  setCurrentIndex: (updater: (i: number) => number) => void;
  phase: Phase;
  setPhase: (p: Phase) => void;
  countdown: number;
  setCountdown: (n: number) => void;
  onClose: () => void;
  onAdvanceAfterRating: () => void;
}) {
  const { play, close } = useAudioPlayer();
  const lesson = unit.lessons[currentIndex];

  useEffect(() => {
    if (phase === "countdown" || phase === "rating") close();
  }, [phase, currentIndex, close]);

  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown <= 1) {
      const id = setTimeout(() => {
        const version = pickPlayableVersion(lesson.audioVersions);
        if (!version || !version.signedUrl) {
          setPhase("error");
          return;
        }
        // Resume from saved position only when the user is returning to a
        // lesson they haven't completed; otherwise start fresh.
        const resumeFrom =
          lesson.completedAt === null &&
          (lesson.lastAudioVersionId === null ||
            lesson.lastAudioVersionId === version.id)
            ? lesson.lastPositionSeconds
            : 0;
        play({
          id: version.id,
          label: version.label,
          src: version.signedUrl,
          durationSeconds: version.audioDurationSeconds,
          startPositionSeconds: resumeFrom,
        });
        setPhase("playing");
      }, 1000);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, countdown, lesson, play, setCountdown, setPhase]);

  const showPlayback = phase === "countdown" || phase === "playing";
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < unit.lessons.length - 1;

  function goToLesson(delta: -1 | 1) {
    const target = currentIndex + delta;
    if (target < 0 || target >= unit.lessons.length) return;
    close();
    setCurrentIndex(() => target);
    setCountdown(COUNTDOWN_SECONDS);
    setPhase("countdown");
  }

  const showLessonContext =
    showPlayback || phase === "rating";

  return (
    <Chrome
      onClose={onClose}
      unitTitle={showLessonContext ? unit.title : undefined}
      lessonTitle={showLessonContext ? lesson.title : undefined}
      bottom={
        showPlayback ? (
          <VersionSelector versions={lesson.audioVersions} />
        ) : null
      }
    >
      {showPlayback ? (
        <div className="flex h-full flex-col gap-8 px-6 pb-8 pt-6">
          <div className="relative flex-1">
            <div className="h-full rounded-3xl border-2 border-dashed border-border/60 bg-muted/30" />
            {phase === "countdown" && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center"
                aria-live="polite"
              >
                <p className="text-muted-foreground text-sm uppercase tracking-widest">
                  Starting in
                </p>
                <div
                  key={countdown}
                  className="font-heading text-[10rem] font-semibold leading-none tabular-nums duration-300 animate-in fade-in-0 zoom-in-95"
                >
                  {countdown}
                </div>
              </div>
            )}
            {hasPrev && (
              <LessonNavChevron
                direction="prev"
                onClick={() => goToLesson(-1)}
              />
            )}
            {hasNext && (
              <LessonNavChevron
                direction="next"
                onClick={() => goToLesson(1)}
              />
            )}
          </div>
          <LessonPlayerView disabled={phase !== "playing"} />
        </div>
      ) : phase === "rating" ? (
        <LessonRatingForm
          lessonId={lesson.id}
          lessonTitle={lesson.title}
          isLastLesson={currentIndex === unit.lessons.length - 1}
          initial={lesson.myFeedback}
          onDone={onAdvanceAfterRating}
        />
      ) : phase === "completed" ? (
        <CompletedBody unitTitle={unit.title} onClose={onClose} />
      ) : (
        <CenteredMessage
          title="This lesson has no audio"
          body="Try a different lesson or contact support."
          onClose={onClose}
        />
      )}
    </Chrome>
  );
}

function LessonNavChevron({
  direction,
  onClick,
}: {
  direction: "prev" | "next";
  onClick: () => void;
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  const label = direction === "prev" ? "Previous lesson" : "Next lesson";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "group absolute top-1/2 -translate-y-1/2 flex items-center justify-center",
        "text-muted-foreground/40 hover:text-muted-foreground transition-colors",
        "h-32 w-16 rounded-full",
        "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring/50",
        direction === "prev" ? "left-2" : "right-2",
      )}
    >
      <Icon className="size-12" />
    </button>
  );
}

function Chrome({
  onClose,
  unitTitle,
  lessonTitle,
  bottom,
  children,
}: {
  onClose: () => void;
  unitTitle?: string;
  lessonTitle?: string;
  bottom?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="flex items-center gap-4 border-b-2 border-border px-6 py-4">
        <Button
          variant="ghost"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground h-14 gap-2 px-4 text-base font-medium [&_svg:not([class*='size-'])]:size-6"
        >
          <X />
          <span>Close</span>
        </Button>
        <div className="min-w-0 flex-1 px-4 text-center">
          {unitTitle && (
            <p className="text-muted-foreground truncate text-xs uppercase tracking-widest">
              {unitTitle}
            </p>
          )}
          {lessonTitle && (
            <h1 className="font-heading truncate text-lg font-semibold tracking-tight">
              {lessonTitle}
            </h1>
          )}
        </div>
        <div aria-hidden="true" className="h-14 w-[140px] shrink-0" />
      </header>

      <main className="flex flex-1 flex-col overflow-hidden">{children}</main>

      <footer className="flex min-h-20 items-center justify-center border-t-2 border-border px-6 py-4">
        {bottom}
      </footer>
    </>
  );
}

function VersionSelector({
  versions,
}: {
  versions: PlaybackLesson["audioVersions"];
}) {
  const { track, play } = useAudioPlayer();
  const playable = versions.filter((v) => v.signedUrl);
  const currentByFlag = playable.find((v) => v.isCurrent);
  const initial = currentByFlag ?? playable[0] ?? null;
  const activeVersion = versions.find((v) => v.id === track?.id) ?? initial;

  if (!activeVersion) return null;

  function select(v: PlaybackLesson["audioVersions"][number]) {
    if (!v.signedUrl) return;
    play({
      id: v.id,
      label: v.label,
      src: v.signedUrl,
      durationSeconds: v.audioDurationSeconds,
    });
  }

  if (playable.length < 2) {
    return (
      <span className="text-muted-foreground px-3 text-sm">
        {activeVersion.label}
      </span>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-foreground h-12 text-base"
        >
          <span>{activeVersion.label}</span>
          <ChevronDown data-icon="inline-end" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" side="top" className="min-w-64">
        {versions.map((v) => {
          const isActive = v.id === activeVersion.id;
          const disabled = !v.signedUrl;
          return (
            <DropdownMenuItem
              key={v.id}
              disabled={disabled}
              onSelect={() => select(v)}
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
  );
}

function CompletedBody({
  unitTitle,
  onClose,
}: {
  unitTitle: string;
  onClose: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-6 text-center">
      <CheckCircle2 className="text-primary size-20" />
      <div className="flex max-w-md flex-col gap-2">
        <h2 className="font-heading text-3xl font-semibold tracking-tight">
          Unit complete
        </h2>
        <p className="text-muted-foreground">
          Nice work — you&apos;ve finished every lesson in{" "}
          <span className="text-foreground font-medium">{unitTitle}</span>.
        </p>
      </div>
      <Button
        variant="outline"
        size="lg"
        className="text-muted-foreground h-14 px-8 text-base"
        onClick={onClose}
      >
        Back to course
      </Button>
    </div>
  );
}

function CenteredMessage({
  title,
  body,
  onClose,
}: {
  title: string;
  body: string;
  onClose: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <h2 className="font-heading text-xl font-semibold">{title}</h2>
      <p className="text-muted-foreground max-w-md text-sm">{body}</p>
      <Button variant="outline" size="lg" onClick={onClose}>
        Close
      </Button>
    </div>
  );
}

function ProgressTracker({
  lesson,
  active,
}: {
  lesson: PlaybackLesson | undefined;
  active: boolean;
}) {
  const { track, currentTime, duration } = useAudioPlayer();
  const lastSavedAtRef = useRef(0);
  const lastSavedPositionRef = useRef(0);
  const latestPositionRef = useRef(0);
  const completedSentRef = useRef<string | null>(null);

  // Mirror the latest player time into a ref so the unmount-flush effect can
  // read it without resubscribing every frame.
  latestPositionRef.current = currentTime;

  useEffect(() => {
    if (!active || !lesson || !track) return;
    const lessonId = lesson.id;
    const audioVersionId = track.id;
    const now = Date.now();
    const sinceLast = now - lastSavedAtRef.current;
    const movedEnough =
      Math.abs(currentTime - lastSavedPositionRef.current) >= 1;

    if (sinceLast >= POSITION_SAVE_INTERVAL_MS && movedEnough) {
      lastSavedAtRef.current = now;
      lastSavedPositionRef.current = currentTime;
      void saveLessonPosition({
        lessonId,
        audioVersionId,
        positionSeconds: currentTime,
      }).catch(() => {});
    }

    if (
      duration > 0 &&
      currentTime / duration >= COMPLETION_THRESHOLD &&
      completedSentRef.current !== lessonId
    ) {
      completedSentRef.current = lessonId;
      void markLessonCompletedAction({ lessonId, audioVersionId }).catch(
        () => {},
      );
    }
  }, [active, lesson, track, currentTime, duration]);

  // On unmount or lesson/track change, persist the latest known position so
  // the user can resume even if they close the dialog mid-lesson.
  useEffect(() => {
    if (!lesson || !track) return;
    const lessonId = lesson.id;
    const audioVersionId = track.id;
    return () => {
      const position = latestPositionRef.current;
      if (position > 0 && position !== lastSavedPositionRef.current) {
        void saveLessonPosition({
          lessonId,
          audioVersionId,
          positionSeconds: position,
        }).catch(() => {});
      }
    };
  }, [lesson, track]);

  return null;
}

function pickPlayableVersion(versions: PlaybackLesson["audioVersions"]) {
  const playable = versions.filter((v) => v.signedUrl);
  return playable.find((v) => v.isCurrent) ?? playable[0] ?? null;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
