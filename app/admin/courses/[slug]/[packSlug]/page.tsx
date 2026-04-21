import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminPackBySlugs } from "@/lib/domains/courses/queries/admin";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";

type Props = { params: Promise<{ slug: string; packSlug: string }> };

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

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Lessons</h2>
        {pack.lessons.length === 0 ? (
          <p className="text-muted-foreground text-sm">No lessons yet.</p>
        ) : (
          <ol className="flex flex-col gap-2">
            {pack.lessons.map((l) => (
              <li
                key={l.id}
                className="flex items-center justify-between gap-4 rounded-md border px-4 py-3 text-sm"
              >
                <div className="flex items-start gap-3">
                  <span className="text-muted-foreground tabular-nums pt-0.5">
                    {l.position}.
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <Link
                      href={`/admin/courses/${course.slug}/${pack.slug}/${l.slug}`}
                      className="font-medium hover:underline"
                    >
                      {l.title}
                    </Link>
                    <span className="text-muted-foreground text-xs">
                      {l.slug}
                    </span>
                  </div>
                </div>
                <Badge variant={l.isPublished ? "default" : "secondary"}>
                  {l.isPublished ? "Published" : "Draft"}
                </Badge>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function Fallback() {
  return (
    <div className="flex flex-col gap-8">
      <div className="bg-muted/30 h-4 w-64 animate-pulse rounded" />
      <div className="bg-muted/30 h-8 w-56 animate-pulse rounded" />
      <div className="flex flex-col gap-2">
        <div className="bg-muted/30 h-14 animate-pulse rounded-md" />
        <div className="bg-muted/30 h-14 animate-pulse rounded-md" />
      </div>
    </div>
  );
}
