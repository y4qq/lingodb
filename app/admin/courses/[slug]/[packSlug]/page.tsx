import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getAdminPackBySlugs } from "@/lib/domains/courses/queries/admin";
import { PageHeader } from "@/components/common/page-header";
import { PageHeaderSkeleton } from "@/components/common/page-header-skeleton";
import { DataTable, type Column } from "@/components/common/data-table";
import { LessonCreateDialog } from "@/components/admin/lesson-create-dialog";
import { PackEditDialog } from "@/components/admin/pack-edit-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type Props = { params: Promise<{ slug: string; packSlug: string }> };

type PackResult = NonNullable<Awaited<ReturnType<typeof getAdminPackBySlugs>>>;
type LessonRow = PackResult["pack"]["lessons"][number];

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

export default function AdminPackPage({ params }: Props) {
  return (
    <Suspense fallback={<Fallback />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: Props) {
  const { slug, packSlug } = await params;
  const result = await getAdminPackBySlugs(slug, packSlug);
  if (!result) notFound();

  const { course, pack } = result;

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/courses", label: "Courses" },
          { href: `/admin/courses/${course.slug}`, label: course.title },
          { label: pack.title },
        ]}
        title={pack.title}
        meta={
          <Badge variant={pack.isPublished ? "default" : "secondary"}>
            {pack.isPublished ? "Published" : "Draft"}
          </Badge>
        }
        description={
          pack.description ?? `Pack ${pack.position} · ${pack.slug}`
        }
        action={
          <div className="flex items-center gap-2">
            <LessonCreateDialog packId={pack.id} />
            <PackEditDialog
              pack={{
                id: pack.id,
                title: pack.title,
                description: pack.description,
                position: pack.position,
                isPublished: pack.isPublished,
                isFree: pack.isFree,
              }}
            />
          </div>
        }
      />

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Lessons</h2>
        <DataTable
          columns={lessonColumns}
          data={pack.lessons}
          rowKey={(l) => l.id}
          rowHref={(l) =>
            `/admin/courses/${course.slug}/${pack.slug}/${l.slug}`
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
