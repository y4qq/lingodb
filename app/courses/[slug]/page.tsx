import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getMyCourseBySlug } from "@/lib/domains/courses/queries/public";
import { PageHeader } from "@/components/common/page-header";
import { PageHeaderSkeleton } from "@/components/common/page-header-skeleton";
import { DataTable, type Column } from "@/components/common/data-table";
import { Skeleton } from "@/components/ui/skeleton";

type Props = { params: Promise<{ slug: string }> };

type Course = NonNullable<Awaited<ReturnType<typeof getMyCourseBySlug>>>;
type PackRow = Course["packs"][number];

const packColumns: Column<PackRow>[] = [
  {
    header: "#",
    cell: (p) => (
      <span className="text-muted-foreground tabular-nums">{p.position}</span>
    ),
    className: "w-12",
  },
  {
    header: "Title",
    cell: (p) => <span className="font-medium">{p.title}</span>,
  },
  {
    header: "Description",
    cell: (p) => (
      <span className="text-muted-foreground">{p.description ?? "—"}</span>
    ),
  },
];

export default function CoursePage({ params }: Props) {
  return (
    <Suspense fallback={<Fallback />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: Props) {
  const { slug } = await params;
  const course = await getMyCourseBySlug(slug);
  if (!course) notFound();

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { href: "/courses", label: "Courses" },
          { label: course.title },
        ]}
        title={course.title}
        description={course.description ?? undefined}
      />

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Packs</h2>
        <DataTable
          columns={packColumns}
          data={course.packs}
          rowKey={(p) => p.id}
          rowHref={(p) => `/courses/${course.slug}/${p.slug}`}
          empty="No packs yet."
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
