import { Suspense } from "react";
import { BookOpen, GraduationCap, Layers, Library } from "lucide-react";
import {
  getAdminCourseStats,
  listRecentAdminCourses,
} from "@/lib/domains/courses/queries/admin";
import { PageHeader } from "@/components/common/page-header";
import { CourseCreateButton } from "@/components/admin/course-create-button";
import { DataTable, type Column } from "@/components/common/data-table";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type RecentCourseRow = Awaited<
  ReturnType<typeof listRecentAdminCourses>
>[number];

const recentCoursesColumns: Column<RecentCourseRow>[] = [
  {
    header: "Title",
    cell: (c) => <span className="font-medium">{c.title}</span>,
  },
  {
    header: "Languages",
    cell: (c) => (
      <span className="text-muted-foreground">
        {c.baseLanguage.name} → {c.targetLanguage.name}
      </span>
    ),
  },
  {
    header: "Updated",
    cell: (c) => (
      <span className="text-muted-foreground">{formatDate(c.updatedAt)}</span>
    ),
  },
  {
    header: "Status",
    cell: (c) => (
      <Badge variant={c.isPublished ? "default" : "secondary"}>
        {c.isPublished ? "Published" : "Draft"}
      </Badge>
    ),
    className: "w-28",
  },
];

export default function AdminDashboardPage() {
  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard" }]}
        title="Dashboard"
        description="Overview of your content library."
        action={
          <Suspense fallback={<Skeleton className="h-9 w-36" />}>
            <CourseCreateButton />
          </Suspense>
        }
      />

      <Suspense fallback={<StatsGridFallback />}>
        <StatsGrid />
      </Suspense>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Recent courses</h2>
        <Suspense fallback={<RecentCoursesFallback />}>
          <RecentCourses />
        </Suspense>
      </section>
    </>
  );
}

async function StatsGrid() {
  const stats = await getAdminCourseStats();
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      <StatCard
        label="Courses"
        value={stats.courseCount}
        hint={`${stats.publishedCourseCount} published`}
        icon={<Library />}
      />
      <StatCard
        label="Packs"
        value={stats.packCount}
        hint={`${stats.publishedPackCount} published`}
        icon={<Layers />}
      />
      <StatCard
        label="Lessons"
        value={stats.lessonCount}
        hint={`${stats.publishedLessonCount} published`}
        icon={<GraduationCap />}
      />
    </div>
  );
}

function StatsGridFallback() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
  );
}

async function RecentCourses() {
  const rows = await listRecentAdminCourses(5);
  return (
    <DataTable
      columns={recentCoursesColumns}
      data={rows}
      rowKey={(c) => c.id}
      rowHref={(c) => `/admin/courses/${c.slug}`}
      empty={
        <span className="flex items-center gap-2">
          <BookOpen className="size-4" /> No courses yet.
        </span>
      }
    />
  );
}

function RecentCoursesFallback() {
  return <Skeleton className="h-64 w-full" />;
}

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
