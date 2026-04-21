import { Suspense } from "react";
import Link from "next/link";
import { listAdminCourses } from "@/lib/domains/courses/queries/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type CourseRow = Awaited<ReturnType<typeof listAdminCourses>>[number];

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
          <Button asChild>
            <Link href="/admin/courses/new">Create course</Link>
          </Button>
        }
      />
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <CoursesList />
      </Suspense>
    </>
  );
}

async function CoursesList() {
  const rows = await listAdminCourses();
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
