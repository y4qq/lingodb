import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedCourseBySlug } from "@/lib/courses/service";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Props = { params: Promise<{ slug: string }> };

export default function CoursePage({ params }: Props) {
  return (
    <Suspense fallback={<CoursePageFallback />}>
      <CourseContent params={params} />
    </Suspense>
  );
}

async function CourseContent({ params }: Props) {
  const { slug } = await params;
  const course = await getPublishedCourseBySlug(slug);
  if (!course) notFound();

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
            <BreadcrumbPage>{course.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          {course.title}
        </h1>
        {course.description && (
          <p className="text-muted-foreground">{course.description}</p>
        )}
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Packs</h2>
        {course.packs.length === 0 ? (
          <p className="text-muted-foreground text-sm">No packs yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {course.packs.map((pack) => (
              <Card key={pack.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <CardTitle>{pack.title}</CardTitle>
                      {pack.description && (
                        <CardDescription>{pack.description}</CardDescription>
                      )}
                    </div>
                    <Badge variant="secondary">Pack {pack.position}</Badge>
                  </div>
                </CardHeader>
                <CardFooter>
                  <Button asChild variant="outline">
                    <Link href={`/courses/${course.slug}/${pack.slug}`}>
                      Open pack
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function CoursePageFallback() {
  return (
    <div className="flex flex-col gap-8">
      <div className="bg-muted/30 h-4 w-48 animate-pulse rounded" />
      <div className="flex flex-col gap-2">
        <div className="bg-muted/30 h-9 w-72 animate-pulse rounded" />
        <div className="bg-muted/30 h-4 w-96 animate-pulse rounded" />
      </div>
      <div className="flex flex-col gap-3">
        <div className="bg-muted/30 h-5 w-16 animate-pulse rounded" />
        <div className="bg-muted/30 h-32 animate-pulse rounded-xl border" />
        <div className="bg-muted/30 h-32 animate-pulse rounded-xl border" />
      </div>
    </div>
  );
}
