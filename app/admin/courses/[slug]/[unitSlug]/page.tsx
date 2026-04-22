import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getAdminUnitBySlugs } from "@/lib/domains/courses/queries/admin";
import { PageHeader } from "@/components/common/page-header";
import { PageHeaderSkeleton } from "@/components/common/page-header-skeleton";
import { DataTable, type Column } from "@/components/common/data-table";
import { LessonCreateDialog } from "@/components/admin/lesson-create-dialog";
import { UnitEditDialog } from "@/components/admin/unit-edit-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type Props = { params: Promise<{ slug: string; unitSlug: string }> };

type UnitResult = NonNullable<Awaited<ReturnType<typeof getAdminUnitBySlugs>>>;
type LessonRow = UnitResult["unit"]["lessons"][number];

const lessonColumns: Column<LessonRow>[] = [
  {
    header: "#",
    cell: (l) => (
      <span className="text-muted-foreground tabular-nums">{l.position}</span>
    ),
    className: "w-12",
  },
  {
    header: "Title",
    cell: (l) => <span className="font-medium">{l.title}</span>,
  },
  {
    header: "Slug",
    cell: (l) => (
      <span className="text-muted-foreground font-mono text-xs">{l.slug}</span>
    ),
  },
  {
    header: "Status",
    cell: (l) => (
      <Badge variant={l.isPublished ? "default" : "secondary"}>
        {l.isPublished ? "Published" : "Draft"}
      </Badge>
    ),
    className: "w-28",
  },
];

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
    <>
      <PageHeader
        breadcrumbs={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/courses", label: "Courses" },
          { href: `/admin/courses/${course.slug}`, label: course.title },
          { label: unit.title },
        ]}
        title={unit.title}
        meta={
          <Badge variant={unit.isPublished ? "default" : "secondary"}>
            {unit.isPublished ? "Published" : "Draft"}
          </Badge>
        }
        description={
          unit.description ?? `Unit ${unit.position} · ${unit.slug}`
        }
        action={
          <div className="flex items-center gap-2">
            <LessonCreateDialog unitId={unit.id} />
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
          </div>
        }
      />

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Lessons</h2>
        <DataTable
          columns={lessonColumns}
          data={unit.lessons}
          rowKey={(l) => l.id}
          rowHref={(l) =>
            `/admin/courses/${course.slug}/${unit.slug}/${l.slug}`
          }
          empty="No lessons yet."
        />
      </section>
    </>
  );
}

function Fallback() {
  return (
    <>
      <PageHeaderSkeleton />
      <Skeleton className="h-64 w-full" />
    </>
  );
}
