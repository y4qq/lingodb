"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { FloatingPanelCard } from "@/components/ui/floating-panel";
import { LessonDialog } from "@/components/app/lesson-dialog";
import {
  getUnitForPlayback,
  type PlaybackResult,
} from "@/lib/domains/courses/actions/playback";
import { cn } from "@/lib/utils";

type Lesson = {
  id: string;
  slug: string;
  icon: string | null;
  title: string;
  description: string | null;
  progress: {
    lastPositionSeconds: number;
    completedAt: Date | null;
  };
};

type Props = {
  courseSlug: string;
  unitSlug: string;
  lessons: Lesson[];
};

// Clicking a lesson kicks off the server action *once* and stashes the
// resulting promise in state, which `LessonDialog` then unwraps with
// React 19's `use()` hook. Keeping the promise in state (not re-deriving it
// on every render) is what gives `use()` a stable reference to suspend on.
export function UnitLessons({ courseSlug, unitSlug, lessons }: Props) {
  const [opened, setOpened] = useState<{
    slug: string;
    payloadPromise: Promise<PlaybackResult>;
  } | null>(null);

  function openLesson(slug: string) {
    setOpened({
      slug,
      payloadPromise: getUnitForPlayback(courseSlug, unitSlug),
    });
  }

  return (
    <>
      {lessons.map((lesson) => {
        const isCompleted = lesson.progress.completedAt !== null;
        const isInProgress =
          !isCompleted && lesson.progress.lastPositionSeconds > 0;
        return (
          <FloatingPanelCard asChild key={lesson.id}>
            <button type="button" onClick={() => openLesson(lesson.slug)}>
              <div
                className={cn(
                  "flex size-12 shrink-0 items-center justify-center text-4xl leading-none",
                )}
              >
                {lesson.icon ?? ""}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="font-heading text-base font-semibold">
                  {lesson.title}
                </div>
                {lesson.description && (
                  <div className="text-base text-muted-foreground">
                    {lesson.description}
                  </div>
                )}
              </div>
              {isCompleted ? (
                <CheckCircle2
                  aria-label="Completed"
                  className="size-6 shrink-0 text-primary"
                />
              ) : isInProgress ? (
                <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  In progress
                </span>
              ) : null}
            </button>
          </FloatingPanelCard>
        );
      })}
      <LessonDialog
        open={opened !== null}
        onOpenChange={(open) => {
          if (!open) setOpened(null);
        }}
        payloadPromise={opened?.payloadPromise}
        startLessonSlug={opened?.slug ?? ""}
      />
    </>
  );
}
