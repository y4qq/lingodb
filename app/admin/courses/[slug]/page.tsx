import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getAdminCourseBySlug } from "@/lib/domains/courses/queries/admin";
import { PageHeader } from "@/components/common/page-header";
import { PageHeaderSkeleton } from "@/components/common/page-header-skeleton";
import { CourseEditDialog } from "@/components/admin/course-edit-dialog";
import { DataTable, type Column } from "@/components/common/data-table";
import { PackCreateDialog } from "@/components/admin/pack-create-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type Props = { params: Promise<{ slug: string }> };

type Course = NonNullable<Awaited<ReturnType<typeof getAdminCourseBySlug>>>;
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
    header: "Slug",
    cell: (p) => (
      <span className="text-muted-foreground font-mono text-xs">{p.slug}</span>
    ),
  },
  {
    header: "Status",
    cell: (p) => (
      <Badge variant={p.isPublished ? "default" : "secondary"}>
        {p.isPublished ? "Published" : "Draft"}
      </Badge>
    ),
    className: "w-28",
  },
];

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
    <>
      <PageHeader
        breadcrumbs={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/courses", label: "Courses" },
          { label: course.title },
        ]}
        title={course.title}
        meta={
          <Badge variant={course.isPublished ? "default" : "secondary"}>
            {course.isPublished ? "Published" : "Draft"}
          </Badge>
        }
        description={
          course.description ??
          `${course.baseLanguage.name} → ${course.targetLanguage.name} · ${course.slug}`
        }
        action={
          <div className="flex items-center gap-2">
            <PackCreateDialog courseId={course.id} />
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
        }
      />

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Packs</h2>
        <DataTable
          columns={packColumns}
          data={course.packs}
          rowKey={(p) => p.id}
          rowHref={(p) => `/admin/courses/${course.slug}/${p.slug}`}
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
