import { Suspense } from "react";
import Link from "next/link";
import { listAdminCourses } from "@/lib/domains/courses/queries/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminCoursesPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Courses</h1>
          <p className="text-muted-foreground text-sm">
            All courses, published and draft.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/courses/new">New course</Link>
        </Button>
      </header>
      <Suspense fallback={<AdminCoursesListFallback />}>
        <AdminCoursesList />
      </Suspense>
    </div>
  );
}

async function AdminCoursesList() {
  const rows = await listAdminCourses();

  if (rows.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No courses yet. Create one to get started.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {rows.map((c) => (
        <li
          key={c.id}
          className="flex items-center justify-between gap-4 rounded-md border px-4 py-3 text-sm"
        >
          <div className="flex flex-col gap-0.5">
            <Link
              href={`/admin/courses/${c.slug}`}
              className="font-medium hover:underline"
            >
              {c.title}
            </Link>
            <span className="text-muted-foreground text-xs">
              {c.baseLanguage.name} → {c.targetLanguage.name} · {c.slug}
            </span>
          </div>
          <Badge variant={c.isPublished ? "default" : "secondary"}>
            {c.isPublished ? "Published" : "Draft"}
          </Badge>
        </li>
      ))}
    </ul>
  );
}

function AdminCoursesListFallback() {
  return (
    <div className="flex flex-col gap-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="bg-muted/30 h-14 animate-pulse rounded-md" />
      ))}
    </div>
  );
}
