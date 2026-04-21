import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedPackBySlugs } from "@/lib/domains/courses/queries/public";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type Props = {
  params: Promise<{ slug: string; packSlug: string }>;
};

export default function PackPage({ params }: Props) {
  return (
    <Suspense fallback={<PackPageFallback />}>
      <PackContent params={params} />
    </Suspense>
  );
}

async function PackContent({ params }: Props) {
  const { slug, packSlug } = await params;
  const result = await getPublishedPackBySlugs(slug, packSlug);
  if (!result) notFound();

  const { course, pack } = result;

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/courses">Courses</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/courses/${course.slug}`}>{course.title}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{pack.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">{pack.title}</h1>
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
            {pack.lessons.map((lesson) => (
              <li
                key={lesson.id}
                className="flex items-start gap-3 rounded-md border px-4 py-3 text-sm"
              >
                <span className="text-muted-foreground tabular-nums">
                  {lesson.position}.
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{lesson.title}</span>
                  {lesson.description && (
                    <span className="text-muted-foreground">
                      {lesson.description}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function PackPageFallback() {
  return (
    <div className="flex flex-col gap-8">
      <div className="bg-muted/30 h-4 w-64 animate-pulse rounded" />
      <div className="flex flex-col gap-2">
        <div className="bg-muted/30 h-9 w-48 animate-pulse rounded" />
        <div className="bg-muted/30 h-4 w-80 animate-pulse rounded" />
      </div>
      <div className="flex flex-col gap-3">
        <div className="bg-muted/30 h-5 w-20 animate-pulse rounded" />
        <div className="bg-muted/30 h-14 animate-pulse rounded-md" />
        <div className="bg-muted/30 h-14 animate-pulse rounded-md" />
      </div>
    </div>
  );
}
