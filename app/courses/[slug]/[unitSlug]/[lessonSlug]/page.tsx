import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getMyLessonBySlugs } from "@/lib/domains/courses/queries/public";
import { PageHeader } from "@/components/common/page-header";
import { PageHeaderSkeleton } from "@/components/common/page-header-skeleton";
import {
  AudioPlayerBar,
  AudioPlayerProvider,
} from "@/components/audio-player";
import { LessonAudioTable } from "@/components/app/lesson-audio-table";
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
  const result = await getMyLessonBySlugs(slug, unitSlug, lessonSlug);
  if (!result) notFound();

  const { course, unit, lesson } = result;

  return (
    <AudioPlayerProvider>
      <PageHeader
        breadcrumbs={[
          { href: `/courses/${course.slug}`, label: "Units" },
          {
            href: `/courses/${course.slug}/${unit.slug}`,
            label: unit.title,
          },
        ]}
        title={lesson.title}
        description={lesson.description ?? undefined}
      />

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Audio</h2>
        <LessonAudioTable versions={lesson.audioVersions} />
      </section>
      <AudioPlayerBar />
    </AudioPlayerProvider>
  );
}

function Fallback() {
  return (
    <>
      <PageHeaderSkeleton />
      <Skeleton className="h-48 w-full" />
    </>
  );
}
