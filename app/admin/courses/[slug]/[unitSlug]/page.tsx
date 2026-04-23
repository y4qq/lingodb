import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminUnitBySlugs } from "@/lib/domains/courses/queries/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { LessonCreateDialog } from "@/components/admin/lesson-create-dialog";
import { UnitEditDialog } from "@/components/admin/unit-edit-dialog";
import { Badge } from "@/components/ui/badge";
import {
  FloatingPanel,
  FloatingPanelBody,
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

type Props = { params: Promise<{ slug: string; unitSlug: string }> };

export default function AdminUnitPage({ params }: Props) {
  return (
    <Suspense fallback={<Fallback />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: Props) {
  const { slug, unitSlug } = await params;
  const result = await getAdminUnitBySlugs(slug, unitSlug);
  if (!result) notFound();

  const { course, unit } = result;

  return (
    <FloatingPanelLayoutFull>
      <AdminPageHeader
        breadcrumbs={[
          { href: "/admin/courses", label: "Courses" },
          { href: `/admin/courses/${course.slug}`, label: course.title },
        ]}
        title={
          <>
            <span className="truncate">{unit.title}</span>
            <Badge variant={unit.isPublished ? "default" : "secondary"}>
              {unit.isPublished ? "Published" : "Draft"}
            </Badge>
          </>
        }
        action={
          <UnitEditDialog
            unit={{
              id: unit.id,
              title: unit.title,
              description: unit.description,
              position: unit.position,
              isPublished: unit.isPublished,
              isFree: unit.isFree,
            }}
          />
        }
      />
      <FloatingPanel className="flex-1">
        <FloatingPanelHeader>
          <FloatingPanelTitle>Lessons</FloatingPanelTitle>
          <FloatingPanelHeaderAction>
            <LessonCreateDialog unitId={unit.id} />
          </FloatingPanelHeaderAction>
        </FloatingPanelHeader>
        <FloatingPanelBody>
          {unit.lessons.length === 0 ? (
            <p className="px-8 py-10 text-base text-muted-foreground">
              No lessons yet.
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
                {unit.lessons.map((l) => (
                  <FloatingPanelTableRow
                    key={l.id}
                    className="relative cursor-pointer"
                  >
                    <FloatingPanelTableCell className="tabular-nums text-muted-foreground">
                      {l.position}
                    </FloatingPanelTableCell>
                    <FloatingPanelTableCell>
                      <Link
                        href={`/admin/courses/${course.slug}/${unit.slug}/${l.slug}`}
                        tabIndex={-1}
                        aria-hidden
                        className="absolute inset-0"
                      />
                      <span className="font-heading font-semibold">
                        {l.title}
                      </span>
                    </FloatingPanelTableCell>
                    <FloatingPanelTableCell>
                      <span className="font-mono text-sm text-muted-foreground">
                        {l.slug}
                      </span>
                    </FloatingPanelTableCell>
                    <FloatingPanelTableCell>
                      <Badge variant={l.isPublished ? "default" : "secondary"}>
                        {l.isPublished ? "Published" : "Draft"}
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
      <AdminPageHeader
        breadcrumbs={[{ href: "/admin/courses", label: "Courses" }]}
        title={<Skeleton className="h-6 w-56" />}
        action={<Skeleton className="h-9 w-24" />}
      />
      <FloatingPanel className="flex-1">
        <FloatingPanelHeader>
          <FloatingPanelTitle>Lessons</FloatingPanelTitle>
          <FloatingPanelHeaderAction>
            <Skeleton className="h-9 w-32" />
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
