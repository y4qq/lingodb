import { listAvailableCoursesForMe } from "@/lib/domains/courses/queries/public";
import { EnrollCatalog } from "./enroll-catalog";

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

      <EnrollCatalog
        courses={available.map((c) => ({
          id: c.id,
          title: c.title,
          baseLanguage: {
            id: c.baseLanguage.id,
            name: c.baseLanguage.name,
          },
          targetLanguage: {
            code: c.targetLanguage.code,
            name: c.targetLanguage.name,
          },
        }))}
      />
    </div>
  );
}
