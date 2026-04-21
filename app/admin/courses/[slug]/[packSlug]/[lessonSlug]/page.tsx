import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getAdminLessonBySlugs } from "@/lib/domains/courses/queries/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPageHeaderSkeleton } from "@/components/admin/admin-page-header-skeleton";
import { AudioVersionUploader } from "@/components/admin/audio-version-uploader";
import { AudioVersionsTable } from "@/components/admin/audio-versions-table";
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
    <>
      <AdminPageHeader
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
      />

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-medium">Audio versions</h2>
          <AudioVersionUploader lessonId={lesson.id} />
        </div>
        <AudioVersionsTable versions={lesson.audioVersions} />
      </section>
    </>
  );
}

function Fallback() {
  return (
    <>
      <AdminPageHeaderSkeleton />
      <Skeleton className="h-48 w-full" />
    </>
  );
}
