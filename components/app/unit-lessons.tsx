"use client";

import { useState } from "react";
import { FloatingPanelCard } from "@/components/ui/floating-panel";
import { LessonDialog } from "@/components/app/lesson-dialog";
import { cn } from "@/lib/utils";

type Lesson = {
  id: string;
  slug: string;
  icon: string | null;
  title: string;
  description: string | null;
};

type Props = {
  courseSlug: string;
  unitSlug: string;
  lessons: Lesson[];
};

export function UnitLessons({ courseSlug, unitSlug, lessons }: Props) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  return (
    <>
      {lessons.map((lesson) => (
        <FloatingPanelCard asChild key={lesson.id}>
          <button type="button" onClick={() => setOpenSlug(lesson.slug)}>
            <div
              className={cn(
                "flex size-12 shrink-0 items-center justify-center text-4xl leading-none",
              )}
            >
              {lesson.icon ?? ""}
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <div className="font-heading text-base font-semibold">
                {lesson.title}
              </div>
              {lesson.description && (
                <div className="text-base text-muted-foreground">
                  {lesson.description}
                </div>
              )}
            </div>
          </button>
        </FloatingPanelCard>
      ))}
      <LessonDialog
        open={openSlug !== null}
        onOpenChange={(open) => {
          if (!open) setOpenSlug(null);
        }}
        courseSlug={courseSlug}
        unitSlug={unitSlug}
        startLessonSlug={openSlug ?? ""}
      />
    </>
  );
}
