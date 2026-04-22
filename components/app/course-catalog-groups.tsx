import type { ReactNode } from "react";

export type CatalogCourse = {
  id: string;
  title: string;
  baseLanguage: { id: string; name: string };
  targetLanguage: { code: string; name: string };
};

type Props<T extends CatalogCourse> = {
  courses: T[];
  renderCard: (course: T) => ReactNode;
  emptyState?: ReactNode;
};

export function CourseCatalogGroups<T extends CatalogCourse>({
  courses,
  renderCard,
  emptyState,
}: Props<T>) {
  if (courses.length === 0) {
    return <>{emptyState}</>;
  }

  const groups = groupByBaseLanguage(courses);

  return (
    <div className="flex flex-col gap-10">
      {groups.map((group) => (
        <section key={group.baseLanguage.id} className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold tracking-tight">
            Courses for {group.baseLanguage.name} speakers
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {group.courses.map(renderCard)}
          </div>
        </section>
      ))}
    </div>
  );
}

function groupByBaseLanguage<T extends CatalogCourse>(courses: T[]) {
  const byId = new Map<string, { baseLanguage: T["baseLanguage"]; courses: T[] }>();
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
