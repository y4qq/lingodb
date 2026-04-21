import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminCourseBySlug } from "@/lib/domains/courses/queries/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPageHeaderSkeleton } from "@/components/admin/admin-page-header-skeleton";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
      <AdminPageHeader
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
      />

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-medium">Packs</h2>
          <Button asChild>
            <Link href={`/admin/courses/${course.slug}/new`}>Create pack</Link>
          </Button>
        </div>
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
      <AdminPageHeaderSkeleton />
      <Skeleton className="h-64 w-full" />
    </>
  );
}
