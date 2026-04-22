import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { requireUserWithProfile } from "@/lib/auth/guards";
import { getMyLessonBySlugs } from "@/lib/domains/courses/queries/public";
import { setActiveCourseForMe } from "@/lib/domains/users/actions/user";
import { assertCanAccessMyCourse } from "@/lib/domains/users/queries/user";
import { LessonPlayer } from "@/components/app/lesson-player";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  params: Promise<{ slug: string; unitSlug: string; lessonSlug: string }>;
};

export default function LessonPage({ params }: Props) {
  return (
    <Suspense fallback={<Fallback />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: Props) {
  const { slug, unitSlug, lessonSlug } = await params;

  const { profile } = await requireUserWithProfile();
  const access = await assertCanAccessMyCourse(slug);
  if (!access) redirect("/enroll");
  if (profile.activeCourseId !== access.courseId) {
    await setActiveCourseForMe(access.courseId);
  }

  const result = await getMyLessonBySlugs(slug, unitSlug, lessonSlug);
  if (!result) notFound();

  const { course, unit, lesson } = result;

  return (
    <LessonPlayer
      courseSlug={course.slug}
      unitTitle={unit.title}
      lessonTitle={lesson.title}
      lessonDescription={lesson.description ?? null}
      versions={lesson.audioVersions.map((v) => ({
        id: v.id,
        label: v.label,
        audioDurationSeconds: v.audioDurationSeconds,
        isCurrent: v.isCurrent,
        signedUrl: v.signedUrl,
      }))}
    />
  );
}

function Fallback() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6">
      <Skeleton className="h-48 w-full max-w-md" />
    </div>
  );
}
