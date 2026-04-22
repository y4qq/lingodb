"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CourseCatalogGroups,
  type CatalogCourse,
} from "@/components/app/course-catalog-groups";
import { LanguageCourseCard } from "@/components/app/language-course-card";
import { enrollInCourse } from "@/lib/domains/users/actions/user";

type Props = {
  courses: CatalogCourse[];
};

export function EnrollCatalog({ courses }: Props) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [state, action] = useActionState(enrollInCourse, undefined);
  const [, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (state?.ok) {
      router.push(`/courses/${state.data.courseSlug}`);
    } else if (state && !state.ok) {
      setPendingId(null);
    }
  }, [state, router]);

  const error = state && !state.ok ? state.error : null;

  function handleEnroll(courseId: string) {
    if (pendingId) return;
    setPendingId(courseId);
    const fd = new FormData();
    fd.append("courseId", courseId);
    startTransition(() => action(fd));
  }

  return (
    <div className="flex flex-col gap-4">
      <CourseCatalogGroups
        courses={courses}
        renderCard={(course) => (
          <LanguageCourseCard
            key={course.id}
            course={course}
            pending={pendingId === course.id}
            disabled={pendingId !== null && pendingId !== course.id}
            onClick={() => handleEnroll(course.id)}
          />
        )}
        emptyState={
          <p className="text-muted-foreground text-sm">
            You&apos;re enrolled in every available course.
          </p>
        }
      />
      {error && (
        <p className="text-destructive text-center text-xs">{error}</p>
      )}
    </div>
  );
}
