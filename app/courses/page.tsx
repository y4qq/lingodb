import { Suspense } from "react";
import Link from "next/link";
import { listPublishedCourses } from "@/lib/courses/service";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CoursesPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Courses</h1>
        <p className="text-muted-foreground text-sm">
          Pick a course to start learning.
        </p>
      </header>

      <Suspense fallback={<CoursesListFallback />}>
        <CoursesList />
      </Suspense>
    </div>
  );
}

async function CoursesList() {
  const courses = await listPublishedCourses();

  if (courses.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No courses are available yet. Check back soon.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <Card key={course.id}>
          <CardHeader>
            <CardTitle>{course.title}</CardTitle>
            {course.description && (
              <CardDescription>{course.description}</CardDescription>
            )}
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href={`/courses/${course.slug}`}>View course</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

function CoursesListFallback() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="bg-muted/30 h-40 animate-pulse rounded-xl border"
        />
      ))}
    </div>
  );
}
