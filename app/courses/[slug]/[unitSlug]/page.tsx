import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getUnitCommentsForMe } from "@/lib/domains/comments/queries/public";
import { getMyUnitBySlugs } from "@/lib/domains/courses/queries/public";
import {
  CommentsPanel,
  CommentsSidebar,
} from "@/components/app/comments-panel";
import { PageHeader } from "@/components/common/page-header";
import { PageHeaderSkeleton } from "@/components/common/page-header-skeleton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  params: Promise<{ slug: string; unitSlug: string }>;
};

export default function UnitPage({ params }: Props) {
  return (
    <Suspense fallback={<Fallback />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: Props) {
  const { slug, unitSlug } = await params;
  const result = await getMyUnitBySlugs(slug, unitSlug);
  if (!result) notFound();

  const { course, unit } = result;
  const { comments, currentUserId } = await getUnitCommentsForMe(unit.id);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <PageHeader
        breadcrumbs={[{ href: `/courses/${course.slug}`, label: "Units" }]}
        title={unit.title}
        description={unit.description ?? undefined}
      />

      <div className="grid gap-10 lg:grid-cols-8 lg:items-start">
        <section className="flex flex-col gap-6 lg:col-span-4">
          {unit.lessons.length === 0 ? (
            <p className="text-sm text-muted-foreground">No lessons yet.</p>
          ) : (
            unit.lessons.map((lesson) => (
              <Card key={lesson.id}>
                <CardHeader className="items-center text-center">
                  <CardTitle>{lesson.title}</CardTitle>
                  {lesson.description && (
                    <CardDescription>{lesson.description}</CardDescription>
                  )}
                </CardHeader>
                <CardFooter>
                  <Button asChild variant="outline" className="w-full">
                    <Link
                      href={`/courses/${course.slug}/${unit.slug}/${lesson.slug}`}
                    >
                      Open lesson
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </section>

        <CommentsSidebar
          className="sticky top-6 hidden max-h-[calc(100vh-10rem)] lg:col-span-4 lg:flex"
          target={{ kind: "unit", unitId: unit.id }}
          initialComments={comments}
          currentUserId={currentUserId}
        />
      </div>

      <div className="lg:hidden">
        <CommentsPanel
          target={{ kind: "unit", unitId: unit.id }}
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
