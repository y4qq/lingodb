import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getMyPackBySlugs } from "@/lib/domains/courses/queries/public";
import { PageHeader } from "@/components/common/page-header";
import { PageHeaderSkeleton } from "@/components/common/page-header-skeleton";
import { DataTable, type Column } from "@/components/common/data-table";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  params: Promise<{ slug: string; packSlug: string }>;
};

type PackResult = NonNullable<Awaited<ReturnType<typeof getMyPackBySlugs>>>;
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
    header: "Description",
    cell: (l) => (
      <span className="text-muted-foreground">{l.description ?? "—"}</span>
    ),
  },
];

export default function PackPage({ params }: Props) {
  return (
    <Suspense fallback={<Fallback />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: Props) {
  const { slug, packSlug } = await params;
  const result = await getMyPackBySlugs(slug, packSlug);
  if (!result) notFound();

  const { course, pack } = result;

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { href: "/courses", label: "Courses" },
          { href: `/courses/${course.slug}`, label: course.title },
          { label: pack.title },
        ]}
        title={pack.title}
        description={pack.description ?? undefined}
      />

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Lessons</h2>
        <DataTable
          columns={lessonColumns}
          data={pack.lessons}
          rowKey={(l) => l.id}
          rowHref={(l) => `/courses/${course.slug}/${pack.slug}/${l.slug}`}
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
