"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { enrollInCourse } from "@/lib/domains/users/actions/user";
import { AddCourseMenuButton } from "@/components/app/app-sidebar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Course = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  baseLanguage: { name: string };
  targetLanguage: { name: string };
};

export function AddCourseDialog({ courses }: { courses: Course[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <AddCourseMenuButton />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a course</DialogTitle>
          <DialogDescription>
            Enroll in another course to add it to your library.
          </DialogDescription>
        </DialogHeader>
        <AddCourseBody
          courses={courses}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function AddCourseBody({
  courses,
  onClose,
}: {
  courses: Course[];
  onClose: () => void;
}) {
  if (courses.length === 0) {
    return (
      <>
        <p className="text-muted-foreground text-sm">
          You&apos;re already enrolled in every published course.
        </p>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {courses.map((c) => (
        <EnrollRow key={c.id} course={c} onEnrolled={onClose} />
      ))}
    </div>
  );
}

function EnrollRow({
  course,
  onEnrolled,
}: {
  course: Course;
  onEnrolled: () => void;
}) {
  const [state, action, isPending] = useActionState(enrollInCourse, undefined);
  const router = useRouter();

  useEffect(() => {
    if (state?.ok) {
      onEnrolled();
      router.refresh();
    }
  }, [state, onEnrolled, router]);

  const error = state && !state.ok ? state.error : undefined;

  return (
    <form
      action={action}
      className="flex items-center justify-between gap-3 rounded-md border px-4 py-3 text-sm"
    >
      <input type="hidden" name="courseId" value={course.id} />
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate font-medium">{course.title}</span>
        <span className="text-muted-foreground truncate text-xs">
          {course.baseLanguage.name} → {course.targetLanguage.name}
        </span>
        {error && <span className="text-destructive text-xs">{error}</span>}
      </div>
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Enrolling…" : "Enroll"}
      </Button>
    </form>
  );
}
