import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminCourseBySlug } from "@/lib/domains/courses/queries/admin";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";

type Props = { params: Promise<{ slug: string }> };

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

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Packs</h2>
        {course.packs.length === 0 ? (
          <p className="text-muted-foreground text-sm">No packs yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {course.packs.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-4 rounded-md border px-4 py-3 text-sm"
              >
                <div className="flex flex-col gap-0.5">
                  <Link
                    href={`/admin/courses/${course.slug}/${p.slug}`}
                    className="font-medium hover:underline"
                  >
                    {p.title}
                  </Link>
                  <span className="text-muted-foreground text-xs">
                    Position {p.position} · {p.slug}
                  </span>
                </div>
                <Badge variant={p.isPublished ? "default" : "secondary"}>
                  {p.isPublished ? "Published" : "Draft"}
                </Badge>
              </li>
            ))}
          </ul>
        )}
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
      <div className="flex flex-col gap-2">
        <div className="bg-muted/30 h-5 w-16 animate-pulse rounded" />
        <div className="bg-muted/30 h-14 animate-pulse rounded-md" />
        <div className="bg-muted/30 h-14 animate-pulse rounded-md" />
      </div>
    </div>
  );
}
