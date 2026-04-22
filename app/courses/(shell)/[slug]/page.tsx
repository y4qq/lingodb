import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCourseCommentsForMe } from "@/lib/domains/comments/queries/public";
import { getMyCourseBySlug } from "@/lib/domains/courses/queries/public";
import {
  CommentsPanel,
  CommentsSidebar,
} from "@/components/app/comments-panel";
import { UnitCard } from "@/components/app/unit-card";
import { PageHeaderSkeleton } from "@/components/common/page-header-skeleton";
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
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">

      <div className="grid  lg:grid-cols-8 lg:items-start">
        <section className="lg:col-span-5 border-x-2 px-16">
          {course.units.length === 0 ? (
            <p className="py-10 text-sm text-muted-foreground">No units yet.</p>
          ) : (
            <div className="flex flex-col gap-16 py-10">
              {course.units.map((unit) => (
                <section key={unit.id} className="flex flex-col gap-5">
                  <h2 className="font-heading text-xl font-bold tracking-tight">
                    {unit.title}
                  </h2>
                  {unit.lessons.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No lessons yet.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {unit.lessons.map((lesson, lessonIndex) => (
                        <UnitCard
                          key={lesson.id}
                          href={`/courses/${course.slug}/${unit.slug}/${lesson.slug}`}
                          unitNumber={lessonIndex + 1}
                          title={lesson.title}
                          description={lesson.description}
                        />
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>
          )}
        </section>

        <CommentsSidebar
          className="sticky top-0 hidden h-[100vh] w-full lg:col-span-3 lg:flex"
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
