import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { getCourseCommentsForMe } from "@/lib/domains/comments/queries/public";
import { getMyCourseBySlug } from "@/lib/domains/courses/queries/public";
import {
  CommentsPanel,
  CommentsSidebar,
} from "@/components/app/comments-panel";
import { UnitLessons } from "@/components/app/unit-lessons";
import {
  FloatingPanel,
  FloatingPanelBody,
  FloatingPanelDivider,
  FloatingPanelHeader,
  FloatingPanelLayout,
  FloatingPanelLayoutSide,
  FloatingPanelTitle,
} from "@/components/ui/floating-panel";
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

  const courseComplete =
    course.totalUnitCount > 0 &&
    course.completedUnitCount === course.totalUnitCount;

  return (
    <>
      <FloatingPanelLayout>
        <FloatingPanel className="flex-1">
          <FloatingPanelHeader>
            <FloatingPanelTitle>
              <span className="flex items-center gap-2">
                {course.title}
                {courseComplete && (
                  <CheckCircle2
                    aria-label="Course complete"
                    className="size-5 text-primary"
                  />
                )}
              </span>
            </FloatingPanelTitle>
          </FloatingPanelHeader>

          <FloatingPanelBody>
            {course.units.length === 0 ? (
              <p className="px-6 py-10 text-base text-muted-foreground">
                No units yet.
              </p>
            ) : (
              course.units.map((unit) => {
                const unitComplete =
                  unit.totalLessonCount > 0 &&
                  unit.completedLessonCount === unit.totalLessonCount;
                return (
                  <section key={unit.id} className="flex flex-col">
                    <FloatingPanelDivider asChild>
                      <h2 className="flex items-center justify-between gap-2">
                        <span>{unit.title}</span>
                        {unit.totalLessonCount > 0 && (
                          <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                            <span className="tabular-nums">
                              {unit.completedLessonCount} / {unit.totalLessonCount}
                            </span>
                            {unitComplete && (
                              <CheckCircle2
                                aria-label="Unit complete"
                                className="size-4 text-primary"
                              />
                            )}
                          </span>
                        )}
                      </h2>
                    </FloatingPanelDivider>
                    {unit.lessons.length === 0 ? (
                      <p className="border-b-2 border-border px-6 py-8 text-base text-muted-foreground">
                        No lessons yet.
                      </p>
                    ) : (
                      <UnitLessons
                        courseSlug={course.slug}
                        unitSlug={unit.slug}
                        lessons={unit.lessons.map((l) => ({
                          id: l.id,
                          slug: l.slug,
                          icon: l.icon,
                          title: l.title,
                          description: l.description,
                          progress: {
                            lastPositionSeconds: l.progress.lastPositionSeconds,
                            completedAt: l.progress.completedAt,
                          },
                        }))}
                      />
                    )}
                  </section>
                );
              })
            )}
          </FloatingPanelBody>
        </FloatingPanel>

        <FloatingPanelLayoutSide>
          <CommentsSidebar
            target={{ kind: "course", courseId: course.id }}
            initialComments={comments}
            currentUserId={currentUserId}
          />
        </FloatingPanelLayoutSide>
      </FloatingPanelLayout>

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
    <FloatingPanelLayout>
      <FloatingPanel className="flex-1">
        <FloatingPanelHeader>
          <Skeleton className="h-6 w-48" />
        </FloatingPanelHeader>
        <FloatingPanelBody>
          <Skeleton className="h-20 w-full rounded-none" />
          <Skeleton className="h-20 w-full rounded-none" />
          <Skeleton className="h-20 w-full rounded-none" />
        </FloatingPanelBody>
      </FloatingPanel>
      <FloatingPanelLayoutSide />
    </FloatingPanelLayout>
  );
}
