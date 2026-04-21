import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminPackBySlugs } from "@/lib/domains/courses/queries/admin";
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

type Props = { params: Promise<{ slug: string; packSlug: string }> };

type PackResult = NonNullable<Awaited<ReturnType<typeof getAdminPackBySlugs>>>;
type LessonRow = PackResult["pack"]["lessons"][number];

function buildLessonColumns(
  courseSlug: string,
  packSlug: string,
): Column<LessonRow>[] {
  return [
    {
      header: "#",
      cell: (l) => (
        <span className="text-muted-foreground tabular-nums">{l.position}</span>
      ),
      className: "w-12",
    },
    {
      header: "Title",
      cell: (l) => (
        <Link
          href={`/admin/courses/${courseSlug}/${packSlug}/${l.slug}`}
          className="font-medium hover:underline"
        >
          {l.title}
        </Link>
      ),
    },
    {
      header: "Slug",
      cell: (l) => (
        <span className="text-muted-foreground font-mono text-xs">
          {l.slug}
        </span>
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
}

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
            <BreadcrumbLink asChild>
              <Link href={`/admin/courses/${course.slug}`}>{course.title}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{pack.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{pack.title}</h1>
          <Badge variant={pack.isPublished ? "default" : "secondary"}>
            {pack.isPublished ? "Published" : "Draft"}
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          Pack {pack.position} · {pack.slug}
        </p>
        {pack.description && (
          <p className="text-muted-foreground">{pack.description}</p>
        )}
      </header>

      <section className="flex flex-col gap-4">
        <AdminToolbar
          title="Lessons"
          headingLevel="h2"
          action={
            <Button asChild>
              <Link
                href={`/admin/courses/${course.slug}/${pack.slug}/new`}
              >
                Create lesson
              </Link>
            </Button>
          }
        />
        <DataTable
          columns={buildLessonColumns(course.slug, pack.slug)}
          data={pack.lessons}
          rowKey={(l) => l.id}
          rowHref={(l) =>
            `/admin/courses/${course.slug}/${pack.slug}/${l.slug}`
          }
          empty="No lessons yet."
        />
      </section>
    </div>
  );
}

function Fallback() {
  return (
    <div className="flex flex-col gap-8">
      <div className="bg-muted/30 h-4 w-64 animate-pulse rounded" />
      <div className="bg-muted/30 h-8 w-56 animate-pulse rounded" />
      <div className="bg-muted/30 h-48 animate-pulse rounded-md" />
    </div>
  );
}
