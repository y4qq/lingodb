import { Suspense } from "react";
import { listAdminCoursesWithEnrollments } from "@/lib/domains/courses/queries/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CourseCreateButton } from "@/components/admin/course-create-button";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type CourseRow = Awaited<
  ReturnType<typeof listAdminCoursesWithEnrollments>
>[number];

const columns: Column<CourseRow>[] = [
  {
    header: "Title",
    cell: (c) => <span className="font-medium">{c.title}</span>,
  },
  {
    header: "Languages",
    cell: (c) => (
      <span className="text-muted-foreground">
        {c.baseLanguage.name} → {c.targetLanguage.name}
      </span>
    ),
  },
  {
    header: "Slug",
    cell: (c) => (
      <span className="text-muted-foreground font-mono text-xs">{c.slug}</span>
    ),
  },
  {
    header: "Enrolled",
    className: "w-24 text-right",
    cell: (c) => (
      <span className="text-muted-foreground tabular-nums">
        {c.enrollmentCount}
      </span>
    ),
  },
  {
    header: "Status",
    cell: (c) => (
      <Badge variant={c.isPublished ? "default" : "secondary"}>
        {c.isPublished ? "Published" : "Draft"}
      </Badge>
    ),
    className: "w-28",
  },
];

export default function AdminCoursesPage() {
  return (
    <>
      <AdminPageHeader
        breadcrumbs={[
          { href: "/admin", label: "Dashboard" },
          { label: "Courses" },
        ]}
        title="Courses"
        description="All courses, published and draft."
        action={
          <Suspense fallback={<Skeleton className="h-9 w-36" />}>
            <CourseCreateButton />
          </Suspense>
        }
      />
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <CoursesList />
      </Suspense>
    </>
  );
}

async function CoursesList() {
  const rows = await listAdminCoursesWithEnrollments();
  return (
    <DataTable
      columns={columns}
      data={rows}
      rowKey={(c) => c.id}
      rowHref={(c) => `/admin/courses/${c.slug}`}
      empty="No courses yet. Create one to get started."
    />
  );
}
