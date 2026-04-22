import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCourseCommentsForMe } from "@/lib/domains/comments/queries/public";
import { getMyCourseBySlug } from "@/lib/domains/courses/queries/public";
import { CommentsPanel } from "@/components/app/comments-panel";
import { PageHeader } from "@/components/common/page-header";
import { PageHeaderSkeleton } from "@/components/common/page-header-skeleton";
import { DataTable, type Column } from "@/components/common/data-table";
import { Skeleton } from "@/components/ui/skeleton";

type Props = { params: Promise<{ slug: string }> };

type Course = NonNullable<Awaited<ReturnType<typeof getMyCourseBySlug>>>;
type UnitRow = Course["units"][number];

const unitColumns: Column<UnitRow>[] = [
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

  const { comments, currentUserId } = await getCourseCommentsForMe(course.id);

  return (
    <>
      <PageHeader breadcrumbs={[]} title="Units" />

      <section className="flex flex-col gap-4">
        <DataTable
          columns={unitColumns}
          data={course.units}
          rowKey={(p) => p.id}
          rowHref={(p) => `/courses/${course.slug}/${p.slug}`}
          empty="No units yet."
        />
      </section>

      <CommentsPanel
        target={{ kind: "course", courseId: course.id }}
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
