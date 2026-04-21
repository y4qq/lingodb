import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminCourseBySlug } from "@/lib/domains/courses/queries/admin";
import { AdminToolbar } from "@/components/admin/admin-toolbar";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";

type Props = { params: Promise<{ slug: string }> };

type Course = NonNullable<Awaited<ReturnType<typeof getAdminCourseBySlug>>>;
type PackRow = Course["packs"][number];

function buildPackColumns(courseSlug: string): Column<PackRow>[] {
  return [
    {
      header: "#",
      cell: (p) => (
        <span className="text-muted-foreground tabular-nums">{p.position}</span>
      ),
      className: "w-12",
    },
    {
      header: "Title",
      cell: (p) => (
        <Link
          href={`/admin/courses/${courseSlug}/${p.slug}`}
          className="font-medium hover:underline"
        >
          {p.title}
        </Link>
      ),
    },
    {
      header: "Slug",
      cell: (p) => (
        <span className="text-muted-foreground font-mono text-xs">
          {p.slug}
        </span>
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
}

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
    <div className="flex flex-col gap-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/admin">Admin</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/admin/courses">Courses</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{course.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {course.title}
          </h1>
          <Badge variant={course.isPublished ? "default" : "secondary"}>
            {course.isPublished ? "Published" : "Draft"}
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          {course.baseLanguage.name} → {course.targetLanguage.name} ·{" "}
          {course.slug}
        </p>
        {course.description && (
          <p className="text-muted-foreground">{course.description}</p>
        )}
      </header>

      <section className="flex flex-col gap-4">
        <AdminToolbar
          title="Packs"
          headingLevel="h2"
          action={
            <Button asChild>
              <Link href={`/admin/courses/${course.slug}/new`}>
                Create pack
              </Link>
            </Button>
          }
        />
        <DataTable
          columns={buildPackColumns(course.slug)}
          data={course.packs}
          rowKey={(p) => p.id}
          rowHref={(p) => `/admin/courses/${course.slug}/${p.slug}`}
          empty="No packs yet."
        />
      </section>
    </div>
  );
}

function Fallback() {
  return (
    <div className="flex flex-col gap-8">
      <div className="bg-muted/30 h-4 w-48 animate-pulse rounded" />
      <div className="flex flex-col gap-2">
        <div className="bg-muted/30 h-8 w-72 animate-pulse rounded" />
        <div className="bg-muted/30 h-4 w-96 animate-pulse rounded" />
      </div>
      <div className="bg-muted/30 h-48 animate-pulse rounded-md" />
    </div>
  );
}
