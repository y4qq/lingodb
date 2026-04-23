import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCourseCommentsForMe } from "@/lib/domains/comments/queries/public";
import { getMyCourseBySlug } from "@/lib/domains/courses/queries/public";
import {
  CommentsPanel,
  CommentsSidebar,
} from "@/components/app/comments-panel";
import { UnitCard } from "@/components/app/unit-card";
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

  return (
    <>
      <FloatingPanelLayout>
        <FloatingPanel className="flex-1">
          <FloatingPanelHeader>
            <FloatingPanelTitle>{course.title}</FloatingPanelTitle>
          </FloatingPanelHeader>

          <FloatingPanelBody>
            {course.units.length === 0 ? (
              <p className="px-6 py-10 text-base text-muted-foreground">
                No units yet.
              </p>
            ) : (
              course.units.map((unit) => (
                <section key={unit.id} className="flex flex-col">
                  <FloatingPanelDivider asChild>
                    <h2>{unit.title}</h2>
                  </FloatingPanelDivider>
                  {unit.lessons.length === 0 ? (
                    <p className="border-b-2 border-border px-6 py-8 text-base text-muted-foreground">
                      No lessons yet.
                    </p>
                  ) : (
                    unit.lessons.map((lesson) => (
                      <UnitCard
                        key={lesson.id}
                        href={`/courses/${course.slug}/${unit.slug}/${lesson.slug}`}
                        icon={lesson.icon}
                        title={lesson.title}
                        description={lesson.description}
                      />
                    ))
                  )}
                </section>
              ))
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
