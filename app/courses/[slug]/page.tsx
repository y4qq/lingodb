import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourseCommentsForMe } from "@/lib/domains/comments/queries/public";
import { getMyCourseBySlug } from "@/lib/domains/courses/queries/public";
import {
  CommentsPanel,
  CommentsSidebar,
} from "@/components/app/comments-panel";
import { PageHeader } from "@/components/common/page-header";
import { PageHeaderSkeleton } from "@/components/common/page-header-skeleton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Props = { params: Promise<{ slug: string }> };

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
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <PageHeader breadcrumbs={[]} title="Units" />

      <div className="grid gap-10 lg:grid-cols-8 lg:items-start">
        <section className="flex flex-col gap-6 lg:col-span-4">
          {course.units.length === 0 ? (
            <p className="text-sm text-muted-foreground">No units yet.</p>
          ) : (
            course.units.map((unit) => (
              <Card key={unit.id}>
                <CardHeader className="items-center text-center">
                  <CardTitle>{unit.title}</CardTitle>
                  {unit.description && (
                    <CardDescription>{unit.description}</CardDescription>
                  )}
                </CardHeader>
                <CardFooter>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/courses/${course.slug}/${unit.slug}`}>
                      Open unit
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </section>

        <CommentsSidebar
          className="sticky top-6 hidden max-h-[calc(100vh-10rem)] lg:col-span-4 lg:flex"
          target={{ kind: "course", courseId: course.id }}
          initialComments={comments}
          currentUserId={currentUserId}
        />
      </div>

      <div className="lg:hidden">
        <CommentsPanel
          target={{ kind: "course", courseId: course.id }}
          initialComments={comments}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  );
}

function Fallback() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <PageHeaderSkeleton />
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="flex flex-col gap-4 lg:col-span-2">
          <Skeleton className="h-48 w-full rounded-4xl" />
          <Skeleton className="h-48 w-full rounded-4xl" />
          <Skeleton className="h-48 w-full rounded-4xl" />
        </section>
        <Skeleton className="hidden h-full w-full rounded-4xl lg:col-span-1 lg:block" />
      </div>
    </div>
  );
}
