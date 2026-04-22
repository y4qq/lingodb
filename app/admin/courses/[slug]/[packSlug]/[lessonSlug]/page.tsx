import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getAdminLessonBySlugs } from "@/lib/domains/courses/queries/admin";
import { PageHeader } from "@/components/common/page-header";
import { PageHeaderSkeleton } from "@/components/common/page-header-skeleton";
import { AudioSelectionProvider } from "@/components/admin/audio-selection-provider";
import { AudioVersionsHeaderActions } from "@/components/admin/audio-versions-header-actions";
import { AudioVersionsTable } from "@/components/admin/audio-versions-table";
import {
  AudioPlayerBar,
  AudioPlayerProvider,
} from "@/components/audio-player";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  params: Promise<{ slug: string; packSlug: string; lessonSlug: string }>;
};

export default function AdminLessonPage({ params }: Props) {
  return (
    <Suspense fallback={<Fallback />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: Props) {
  const { slug, packSlug, lessonSlug } = await params;
  const result = await getAdminLessonBySlugs(slug, packSlug, lessonSlug);
  if (!result) notFound();

  const { course, pack, lesson } = result;

  return (
    <AudioPlayerProvider>
      <AudioSelectionProvider>
        <PageHeader
          breadcrumbs={[
            { href: "/admin", label: "Dashboard" },
            { href: "/admin/courses", label: "Courses" },
            { href: `/admin/courses/${course.slug}`, label: course.title },
            {
              href: `/admin/courses/${course.slug}/${pack.slug}`,
              label: pack.title,
            },
            { label: lesson.title },
          ]}
          title={lesson.title}
          meta={
            <Badge variant={lesson.isPublished ? "default" : "secondary"}>
              {lesson.isPublished ? "Published" : "Draft"}
            </Badge>
          }
          description={
            lesson.description ?? `Lesson ${lesson.position} · ${lesson.slug}`
          }
          action={
            <AudioVersionsHeaderActions
              lessonId={lesson.id}
              versions={lesson.audioVersions}
            />
          }
        />

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-medium">Audio versions</h2>
          <AudioVersionsTable versions={lesson.audioVersions} />
        </section>
      </AudioSelectionProvider>
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
