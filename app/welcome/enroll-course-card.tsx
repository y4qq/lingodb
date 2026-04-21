"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { enrollInCourse } from "@/lib/domains/users/actions/user";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Course = {
  id: string;
  title: string;
  description: string | null;
};

export function EnrollCourseCard({ course }: { course: Course }) {
  const [state, action, isPending] = useActionState(enrollInCourse, undefined);
  const router = useRouter();

  useEffect(() => {
    if (state?.ok) {
      router.push(`/courses/${state.data.courseSlug}`);
    }
  }, [state, router]);

  const error = state && !state.ok ? state.error : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{course.title}</CardTitle>
        {course.description && (
          <CardDescription>{course.description}</CardDescription>
        )}
      </CardHeader>
      <CardFooter className="flex flex-col items-stretch gap-2">
        <form action={action}>
          <input type="hidden" name="courseId" value={course.id} />
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Enrolling…" : "Enroll"}
          </Button>
        </form>
        {error && <p className="text-destructive text-xs">{error}</p>}
      </CardFooter>
    </Card>
  );
}
