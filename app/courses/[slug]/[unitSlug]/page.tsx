import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getUnitCommentsForMe } from "@/lib/domains/comments/queries/public";
import { getMyUnitBySlugs } from "@/lib/domains/courses/queries/public";
import { CommentsPanel } from "@/components/app/comments-panel";
import { PageHeader } from "@/components/common/page-header";
import { PageHeaderSkeleton } from "@/components/common/page-header-skeleton";
import { DataTable, type Column } from "@/components/common/data-table";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  params: Promise<{ slug: string; unitSlug: string }>;
};

type UnitResult = NonNullable<Awaited<ReturnType<typeof getMyUnitBySlugs>>>;
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
    header: "Description",
    cell: (l) => (
      <span className="text-muted-foreground">{l.description ?? "—"}</span>
    ),
  },
];

export default function UnitPage({ params }: Props) {
  return (
    <Suspense fallback={<Fallback />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: Props) {
  const { slug, unitSlug } = await params;
  const result = await getMyUnitBySlugs(slug, unitSlug);
  if (!result) notFound();

  const { course, unit } = result;
  const { comments, currentUserId } = await getUnitCommentsForMe(unit.id);

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { href: `/courses/${course.slug}`, label: "Units" },
        ]}
        title={unit.title}
        description={unit.description ?? undefined}
      />

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Lessons</h2>
        <DataTable
          columns={lessonColumns}
          data={unit.lessons}
          rowKey={(l) => l.id}
          rowHref={(l) => `/courses/${course.slug}/${unit.slug}/${l.slug}`}
          empty="No lessons yet."
        />
      </section>

      <CommentsPanel
        target={{ kind: "unit", unitId: unit.id }}
        initialComments={comments}
        currentUserId={currentUserId}
      />
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
