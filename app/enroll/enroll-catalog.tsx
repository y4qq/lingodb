"use client";

import "react-flagpack-react-19/dist/style.css";
import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Flag from "react-flagpack-react-19";
import type { CatalogCourse } from "@/components/app/course-catalog-groups";
import { flagForLanguageCode } from "@/lib/domains/courses/language-flags";
import {
  FloatingPanelCard,
  FloatingPanelDivider,
} from "@/components/ui/floating-panel";
import { Spinner } from "@/components/ui/spinner";
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

  if (courses.length === 0) {
    return (
      <p className="px-6 py-10 text-base text-muted-foreground">
        You&apos;re enrolled in every available course.
      </p>
    );
  }

  const groups = groupByBaseLanguage(courses);

  return (
    <div className="flex flex-col">
      {groups.map((group) => (
        <section key={group.baseLanguage.id} className="flex flex-col">
          <FloatingPanelDivider asChild>
            <h2>Courses for {group.baseLanguage.name} speakers</h2>
          </FloatingPanelDivider>
          {group.courses.map((course) => {
            const pending = pendingId === course.id;
            const disabled = pendingId !== null && !pending;
            const flag = flagForLanguageCode(course.targetLanguage.code);
            return (
              <FloatingPanelCard key={course.id} asChild>
                <button
                  type="button"
                  onClick={() => handleEnroll(course.id)}
                  disabled={disabled || pending}
                >
                  <div className="flex shrink-0 items-center justify-center">
                    {flag ? (
                      <Flag code={flag} size="M" hasBorderRadius hasBorder />
                    ) : (
                      <div className="size-8 rounded-sm bg-muted" aria-hidden />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 font-heading text-base font-semibold">
                    {course.targetLanguage.name}
                  </div>
                  {pending && (
                    <Spinner
                      className="size-4 text-muted-foreground"
                      aria-label="Enrolling"
                    />
                  )}
                </button>
              </FloatingPanelCard>
            );
          })}
        </section>
      ))}
      {error && (
        <p className="border-b-2 border-border px-6 py-4 text-center text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function groupByBaseLanguage(courses: CatalogCourse[]) {
  const byId = new Map<
    string,
    { baseLanguage: CatalogCourse["baseLanguage"]; courses: CatalogCourse[] }
  >();
  for (const course of courses) {
    const existing = byId.get(course.baseLanguage.id);
    if (existing) {
      existing.courses.push(course);
    } else {
      byId.set(course.baseLanguage.id, {
        baseLanguage: course.baseLanguage,
        courses: [course],
      });
    }
  }
  const groups = [...byId.values()];
  groups.sort((a, b) =>
    a.baseLanguage.name.localeCompare(b.baseLanguage.name),
  );
  for (const g of groups) {
    g.courses.sort((a, b) =>
      a.targetLanguage.name.localeCompare(b.targetLanguage.name),
    );
  }
  return groups;
}
