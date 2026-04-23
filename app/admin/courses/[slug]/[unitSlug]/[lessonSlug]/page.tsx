import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getAdminLessonBySlugs } from "@/lib/domains/courses/queries/admin";
import { AudioSelectionProvider } from "@/components/admin/audio-selection-provider";
import { AudioVersionsHeaderActions } from "@/components/admin/audio-versions-header-actions";
import { AudioVersionsTable } from "@/components/admin/audio-versions-table";
import {
  AudioPlayerBar,
  AudioPlayerProvider,
} from "@/components/audio-player";
import { Badge } from "@/components/ui/badge";
import {
  FloatingPanel,
  FloatingPanelBody,
  FloatingPanelDescription,
  FloatingPanelHeader,
  FloatingPanelHeaderAction,
  FloatingPanelLayoutFull,
  FloatingPanelTitle,
} from "@/components/ui/floating-panel";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  params: Promise<{ slug: string; unitSlug: string; lessonSlug: string }>;
};

export default function AdminLessonPage({ params }: Props) {
  return (
    <Suspense fallback={<Fallback />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: Props) {
  const { slug, unitSlug, lessonSlug } = await params;
  const result = await getAdminLessonBySlugs(slug, unitSlug, lessonSlug);
  if (!result) notFound();

  const { lesson } = result;

  return (
    <AudioPlayerProvider>
      <AudioSelectionProvider>
        <FloatingPanelLayoutFull>
          <FloatingPanel className="flex-1 rounded-none border-0 shadow-lg lg:rounded-xl lg:border-2">
            <FloatingPanelHeader>
              <FloatingPanelTitle className="flex items-center gap-3">
                <span>{lesson.title}</span>
                <Badge variant={lesson.isPublished ? "default" : "secondary"}>
                  {lesson.isPublished ? "Published" : "Draft"}
                </Badge>
              </FloatingPanelTitle>
              <FloatingPanelDescription>
                {lesson.description ??
                  `Lesson ${lesson.position} · ${lesson.slug}`}
              </FloatingPanelDescription>
              <FloatingPanelHeaderAction>
                <AudioVersionsHeaderActions
                  lessonId={lesson.id}
                  versions={lesson.audioVersions}
                />
              </FloatingPanelHeaderAction>
            </FloatingPanelHeader>
            <FloatingPanelBody>
              <AudioVersionsTable versions={lesson.audioVersions} />
            </FloatingPanelBody>
            <AudioPlayerBar />
          </FloatingPanel>
        </FloatingPanelLayoutFull>
      </AudioSelectionProvider>
    </AudioPlayerProvider>
  );
}

function Fallback() {
  return (
    <FloatingPanelLayoutFull>
      <FloatingPanel className="flex-1 rounded-none border-0 shadow-lg lg:rounded-xl lg:border-2">
        <FloatingPanelHeader>
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-72" />
          <FloatingPanelHeaderAction>
            <Skeleton className="h-9 w-44" />
          </FloatingPanelHeaderAction>
        </FloatingPanelHeader>
        <FloatingPanelBody>
          <Skeleton className="h-24 w-full rounded-none" />
          <Skeleton className="h-24 w-full rounded-none" />
          <Skeleton className="h-24 w-full rounded-none" />
        </FloatingPanelBody>
      </FloatingPanel>
    </FloatingPanelLayoutFull>
  );
}
