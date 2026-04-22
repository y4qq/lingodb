import { listAvailableCoursesForMe } from "@/lib/domains/courses/queries/public";
import { EnrollCourseCard } from "./enroll-course-card";

export default async function EnrollPage() {
  const available = await listAvailableCoursesForMe();

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Enroll in a course
        </h1>
        <p className="text-muted-foreground">
          Pick a course to get started. You can always add more later.
        </p>
      </header>

      {available.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          You&apos;re enrolled in every available course.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {available.map((course) => (
            <EnrollCourseCard
              key={course.id}
              course={{
                id: course.id,
                title: course.title,
                description: course.description,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
