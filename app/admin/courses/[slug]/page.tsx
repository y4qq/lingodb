import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminCourseBySlug } from "@/lib/domains/courses/queries/admin";
import { CourseEditDialog } from "@/components/admin/course-edit-dialog";
import { UnitCreateDialog } from "@/components/admin/unit-create-dialog";
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

type Props = { params: Promise<{ slug: string }> };

export default function AdminCoursePage({ params }: Props) {
  return (
    <Suspense fallback={<Fallback />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: Props) {
  const { slug } = await params;
  const course = await getAdminCourseBySlug(slug);
  if (!course) notFound();

  return (
    <FloatingPanelLayoutFull>
      <FloatingPanel className="flex-1 rounded-none border-0 shadow-lg lg:rounded-xl lg:border-2">
        <FloatingPanelHeader>
          <FloatingPanelTitle className="flex items-center gap-3">
            <span>{course.title}</span>
            <Badge variant={course.isPublished ? "default" : "secondary"}>
              {course.isPublished ? "Published" : "Draft"}
            </Badge>
          </FloatingPanelTitle>
          <FloatingPanelDescription>
            {course.description ??
              `${course.baseLanguage.name} → ${course.targetLanguage.name} · ${course.slug}`}
          </FloatingPanelDescription>
          <FloatingPanelHeaderAction>
            <div className="flex items-center gap-2">
              <UnitCreateDialog courseId={course.id} />
              <CourseEditDialog
                course={{
                  id: course.id,
                  title: course.title,
                  description: course.description,
                  isPublished: course.isPublished,
                  isFree: course.isFree,
                }}
              />
            </div>
          </FloatingPanelHeaderAction>
        </FloatingPanelHeader>
        <FloatingPanelBody>
          {course.units.length === 0 ? (
            <p className="px-8 py-10 text-base text-muted-foreground">
              No units yet.
            </p>
          ) : (
            <FloatingPanelTable>
              <FloatingPanelTableHeader>
                <tr>
                  <FloatingPanelTableHead className="w-16">
                    #
                  </FloatingPanelTableHead>
                  <FloatingPanelTableHead>Title</FloatingPanelTableHead>
                  <FloatingPanelTableHead>Slug</FloatingPanelTableHead>
                  <FloatingPanelTableHead className="w-32">
                    Status
                  </FloatingPanelTableHead>
                </tr>
              </FloatingPanelTableHeader>
              <FloatingPanelTableBody>
                {course.units.map((u) => (
                  <FloatingPanelTableRow
                    key={u.id}
                    className="relative cursor-pointer"
                  >
                    <FloatingPanelTableCell className="tabular-nums text-muted-foreground">
                      {u.position}
                    </FloatingPanelTableCell>
                    <FloatingPanelTableCell>
                      <Link
                        href={`/admin/courses/${course.slug}/${u.slug}`}
                        tabIndex={-1}
                        aria-hidden
                        className="absolute inset-0"
                      />
                      <span className="font-heading font-semibold">
                        {u.title}
                      </span>
                    </FloatingPanelTableCell>
                    <FloatingPanelTableCell>
                      <span className="font-mono text-sm text-muted-foreground">
                        {u.slug}
                      </span>
                    </FloatingPanelTableCell>
                    <FloatingPanelTableCell>
                      <Badge variant={u.isPublished ? "default" : "secondary"}>
                        {u.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </FloatingPanelTableCell>
                  </FloatingPanelTableRow>
                ))}
              </FloatingPanelTableBody>
            </FloatingPanelTable>
          )}
        </FloatingPanelBody>
      </FloatingPanel>
    </FloatingPanelLayoutFull>
  );
}

function Fallback() {
  return (
    <FloatingPanelLayoutFull>
      <FloatingPanel className="flex-1 rounded-none border-0 shadow-lg lg:rounded-xl lg:border-2">
        <FloatingPanelHeader>
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-72" />
          <FloatingPanelHeaderAction>
            <Skeleton className="h-9 w-44" />
          </FloatingPanelHeaderAction>
        </FloatingPanelHeader>
        <FloatingPanelBody>
          <Skeleton className="h-24 w-full rounded-none" />
          <Skeleton className="h-24 w-full rounded-none" />
          <Skeleton className="h-24 w-full rounded-none" />
        </FloatingPanelBody>
      </FloatingPanel>
    </FloatingPanelLayoutFull>
  );
}
