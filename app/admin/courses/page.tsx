import { Suspense } from "react";
import Link from "next/link";
import { listAdminCoursesWithEnrollments } from "@/lib/domains/courses/queries/admin";
import { CourseCreateButton } from "@/components/admin/course-create-button";
import { Badge } from "@/components/ui/badge";
import {
  FloatingPanel,
  FloatingPanelBody,
  FloatingPanelDescription,
  FloatingPanelHeader,
  FloatingPanelHeaderAction,
  FloatingPanelLayoutFull,
  FloatingPanelTable,
  FloatingPanelTableBody,
  FloatingPanelTableCell,
  FloatingPanelTableHead,
  FloatingPanelTableHeader,
  FloatingPanelTableRow,
  FloatingPanelTitle,
} from "@/components/ui/floating-panel";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminCoursesPage() {
  return (
    <FloatingPanelLayoutFull>
      <FloatingPanel className="flex-1 rounded-none border-0 shadow-lg lg:rounded-xl lg:border-2">
        <FloatingPanelHeader>
          <FloatingPanelTitle>Courses</FloatingPanelTitle>
          <FloatingPanelDescription>
            All courses, published and draft.
          </FloatingPanelDescription>
          <FloatingPanelHeaderAction>
            <Suspense fallback={<Skeleton className="h-9 w-36" />}>
              <CourseCreateButton />
            </Suspense>
          </FloatingPanelHeaderAction>
        </FloatingPanelHeader>
        <FloatingPanelBody>
          <Suspense fallback={<CoursesListFallback />}>
            <CoursesList />
          </Suspense>
        </FloatingPanelBody>
      </FloatingPanel>
    </FloatingPanelLayoutFull>
  );
}

async function CoursesList() {
  const rows = await listAdminCoursesWithEnrollments();

  if (rows.length === 0) {
    return (
      <p className="px-8 py-10 text-base text-muted-foreground">
        No courses yet. Create one to get started.
      </p>
    );
  }

  return (
    <FloatingPanelTable>
      <FloatingPanelTableHeader>
        <tr>
          <FloatingPanelTableHead>Title</FloatingPanelTableHead>
          <FloatingPanelTableHead>Languages</FloatingPanelTableHead>
          <FloatingPanelTableHead>Slug</FloatingPanelTableHead>
          <FloatingPanelTableHead className="w-28 text-right">
            Enrolled
          </FloatingPanelTableHead>
          <FloatingPanelTableHead className="w-32">
            Status
          </FloatingPanelTableHead>
        </tr>
      </FloatingPanelTableHeader>
      <FloatingPanelTableBody>
        {rows.map((c) => (
          <FloatingPanelTableRow key={c.id} className="relative cursor-pointer">
            <FloatingPanelTableCell>
              <Link
                href={`/admin/courses/${c.slug}`}
                tabIndex={-1}
                aria-hidden
                className="absolute inset-0"
              />
              <span className="font-heading font-semibold">{c.title}</span>
            </FloatingPanelTableCell>
            <FloatingPanelTableCell className="text-muted-foreground">
              {c.baseLanguage.name} → {c.targetLanguage.name}
            </FloatingPanelTableCell>
            <FloatingPanelTableCell>
              <span className="font-mono text-sm text-muted-foreground">
                {c.slug}
              </span>
            </FloatingPanelTableCell>
            <FloatingPanelTableCell className="text-right tabular-nums text-muted-foreground">
              {c.enrollmentCount}
            </FloatingPanelTableCell>
            <FloatingPanelTableCell>
              <Badge variant={c.isPublished ? "default" : "secondary"}>
                {c.isPublished ? "Published" : "Draft"}
              </Badge>
            </FloatingPanelTableCell>
          </FloatingPanelTableRow>
        ))}
      </FloatingPanelTableBody>
    </FloatingPanelTable>
  );
}

function CoursesListFallback() {
  return (
    <>
      <Skeleton className="h-24 w-full rounded-none" />
      <Skeleton className="h-24 w-full rounded-none" />
      <Skeleton className="h-24 w-full rounded-none" />
    </>
  );
}
