import { redirect } from "next/navigation";
import { listPublishedCourses } from "@/lib/domains/courses/queries/public";
import { listMyEnrollments } from "@/lib/domains/users/queries/user";
import { EnrollCourseCard } from "./enroll-course-card";

export default async function WelcomePage() {
  const enrollments = await listMyEnrollments();
  if (enrollments.length > 0) {
    redirect("/courses");
  }

  const available = await listPublishedCourses();

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome to Fluent Fast
        </h1>
        <p className="text-muted-foreground">
          Pick a course to get started. You can always add more later.
        </p>
      </header>

      {available.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No courses are available yet. Check back soon.
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
