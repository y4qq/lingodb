import { listAvailableCoursesForMe } from "@/lib/domains/courses/queries/public";
import { AddCourseDialog } from "./add-course-dialog";

export async function AddCourseButton() {
  const courses = await listAvailableCoursesForMe();
  return (
    <AddCourseDialog
      courses={courses.map((c) => ({
        id: c.id,
        slug: c.slug,
        title: c.title,
        description: c.description,
        baseLanguage: { name: c.baseLanguage.name },
        targetLanguage: { name: c.targetLanguage.name },
      }))}
    />
  );
}
