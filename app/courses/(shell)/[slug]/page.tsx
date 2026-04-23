import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCourseCommentsForMe } from "@/lib/domains/comments/queries/public";
import { getMyCourseBySlug } from "@/lib/domains/courses/queries/public";
import {
  CommentsPanel,
  CommentsSidebar,
} from "@/components/app/comments-panel";
import { FloatingPanel } from "@/components/app/floating-panel";
import { UnitCard } from "@/components/app/unit-card";
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
    <>
      <div className="relative z-20 flex h-dvh flex-col gap-6 p-6 lg:flex-row lg:pl-0">
        <FloatingPanel className="flex-1 rounded-none shadow-lg border-0 lg:rounded-xl lg:border-2">
          <header className="border-b-2 border-border px-6 py-5">
            <h1 className="font-heading text-xl font-bold tracking-tight">
              {course.title}
            </h1>
          </header>

          <div className="flex-1 overflow-auto">
            {course.units.length === 0 ? (
              <p className="px-6 py-10 text-base text-muted-foreground">
                No units yet.
              </p>
            ) : (
              course.units.map((unit) => (
                <section key={unit.id} className="flex flex-col">
                  <div className="border-b-2 border-border bg-muted/40 px-6 py-3">
                    <h2 className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {unit.title}
                    </h2>
                  </div>
                  {unit.lessons.length === 0 ? (
                    <p className="border-b-2 border-border px-6 py-8 text-base text-muted-foreground">
                      No lessons yet.
                    </p>
                  ) : (
                    unit.lessons.map((lesson, lessonIndex) => (
                      <UnitCard
                        key={lesson.id}
                        href={`/courses/${course.slug}/${unit.slug}/${lesson.slug}`}
                        unitNumber={lessonIndex + 1}
                        title={lesson.title}
                        description={lesson.description}
                      />
                    ))
                  )}
                </section>
              ))
            )}
          </div>
        </FloatingPanel>

        <CommentsSidebar
          className="hidden w-max shrink-0 lg:flex rounded-xl shadow-lg"
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
    </>
  );
}

function Fallback() {
  return (
    <div className="relative z-20 flex h-dvh flex-col gap-6 p-6 lg:flex-row lg:pl-0">
      <FloatingPanel className="flex-1 rounded-none border-0 lg:rounded-md lg:border-2">
        <div className="border-b-2 border-border px-6 py-5">
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="flex-1 overflow-auto">
          <Skeleton className="h-20 w-full rounded-none" />
          <Skeleton className="h-20 w-full rounded-none" />
          <Skeleton className="h-20 w-full rounded-none" />
        </div>
      </FloatingPanel>
      <div className="hidden w-96 shrink-0 lg:block" />
    </div>
  );
}
