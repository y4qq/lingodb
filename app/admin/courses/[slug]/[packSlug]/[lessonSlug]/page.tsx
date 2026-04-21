import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminLessonBySlugs } from "@/lib/domains/courses/queries/admin";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { AudioVersionsTable } from "@/components/admin/audio-versions-table";
import { AudioVersionUploader } from "@/components/admin/audio-version-uploader";

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
    <div className="flex flex-col gap-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/admin">Admin</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/admin/courses">Courses</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/admin/courses/${course.slug}`}>{course.title}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                href={`/admin/courses/${course.slug}/${pack.slug}`}
              >
                {pack.title}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{lesson.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {lesson.title}
          </h1>
          <Badge variant={lesson.isPublished ? "default" : "secondary"}>
            {lesson.isPublished ? "Published" : "Draft"}
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          Lesson {lesson.position} · {lesson.slug}
        </p>
        {lesson.description && (
          <p className="text-muted-foreground">{lesson.description}</p>
        )}
      </header>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-medium">Audio versions</h2>
          <AudioVersionUploader lessonId={lesson.id} />
        </div>
        <AudioVersionsTable versions={lesson.audioVersions} />
      </section>
    </div>
  );
}

function Fallback() {
  return (
    <div className="flex flex-col gap-8">
      <div className="bg-muted/30 h-4 w-80 animate-pulse rounded" />
      <div className="bg-muted/30 h-8 w-64 animate-pulse rounded" />
      <div className="flex flex-col gap-2">
        <div className="bg-muted/30 h-20 animate-pulse rounded-md" />
        <div className="bg-muted/30 h-20 animate-pulse rounded-md" />
      </div>
    </div>
  );
}
