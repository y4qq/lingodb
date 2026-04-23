import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle2, Library } from "lucide-react";
import {
  getAdminCourseStats,
  listRecentAdminCourses,
} from "@/lib/domains/courses/queries/admin";
import {
  getAdminModerationCounts,
  listAdminCommentsForModeration,
  type AdminModerationRow,
} from "@/lib/domains/comments/queries/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CourseCreateButton } from "@/components/admin/course-create-button";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import {
  FloatingPanel,
  FloatingPanelBody,
  FloatingPanelHeader,
  FloatingPanelHeaderAction,
  FloatingPanelLayoutFull,
  FloatingPanelTable,
  FloatingPanelTableBody,
  FloatingPanelTableCell,
  FloatingPanelTableHead,
  FloatingPanelTableHeader,
  FloatingPanelTableRow,
  FloatingPanelTitle,
} from "@/components/ui/floating-panel";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardPage() {
  return (
    <FloatingPanelLayoutFull>
      <AdminPageHeader title="Dashboard" />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<StatsFallback />}>
          <StatsTiles />
        </Suspense>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <FloatingPanel className="lg:col-span-2">
          <FloatingPanelHeader>
            <FloatingPanelTitle>Recent courses</FloatingPanelTitle>
            <FloatingPanelHeaderAction>
              <Suspense fallback={<Skeleton className="h-9 w-36" />}>
                <CourseCreateButton />
              </Suspense>
            </FloatingPanelHeaderAction>
          </FloatingPanelHeader>
          <FloatingPanelBody>
            <Suspense fallback={<RecentCoursesFallback />}>
              <RecentCourses />
            </Suspense>
          </FloatingPanelBody>
        </FloatingPanel>

        <FloatingPanel>
          <FloatingPanelHeader>
            <FloatingPanelTitle>Pending moderation</FloatingPanelTitle>
            <FloatingPanelHeaderAction>
              <Link
                href="/admin/comments?status=pending"
                className="text-sm font-semibold text-chart-3 hover:underline"
              >
                View all
              </Link>
            </FloatingPanelHeaderAction>
          </FloatingPanelHeader>
          <FloatingPanelBody>
            <Suspense fallback={<PendingFallback />}>
              <PendingList />
            </Suspense>
          </FloatingPanelBody>
        </FloatingPanel>
      </section>
    </FloatingPanelLayoutFull>
  );
}

async function StatsTiles() {
  const [stats, counts] = await Promise.all([
    getAdminCourseStats(),
    getAdminModerationCounts(),
  ]);
  return (
    <>
      <StatCard label="Courses" value={stats.courseCount} />
      <StatCard label="Units" value={stats.unitCount} />
      <StatCard label="Lessons" value={stats.lessonCount} />
      <StatCard label="Pending moderation" value={counts.pending} />
    </>
  );
}

function StatsFallback() {
  return (
    <>
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-24 w-full rounded-xl" />
      ))}
    </>
  );
}

async function RecentCourses() {
  const rows = await listRecentAdminCourses(5);
  if (rows.length === 0) {
    return (
      <p className="flex items-center gap-2 px-8 py-10 text-base text-muted-foreground">
        <Library className="size-4" /> No courses yet.
      </p>
    );
  }
  return (
    <FloatingPanelTable>
      <FloatingPanelTableHeader>
        <tr>
          <FloatingPanelTableHead>Title</FloatingPanelTableHead>
          <FloatingPanelTableHead>Languages</FloatingPanelTableHead>
          <FloatingPanelTableHead className="w-36">
            Updated
          </FloatingPanelTableHead>
          <FloatingPanelTableHead className="w-28">
            Status
          </FloatingPanelTableHead>
        </tr>
      </FloatingPanelTableHeader>
      <FloatingPanelTableBody>
        {rows.map((c) => (
          <FloatingPanelTableRow
            key={c.id}
            className="relative cursor-pointer"
          >
            <FloatingPanelTableCell>
              <Link
                href={`/admin/courses/${c.slug}`}
                tabIndex={-1}
                aria-hidden
                className="absolute inset-0"
              />
              <span className="font-heading font-semibold">{c.title}</span>
            </FloatingPanelTableCell>
            <FloatingPanelTableCell className="text-muted-foreground">
              {c.baseLanguage.name} → {c.targetLanguage.name}
            </FloatingPanelTableCell>
            <FloatingPanelTableCell className="text-muted-foreground">
              {formatDate(c.updatedAt)}
            </FloatingPanelTableCell>
            <FloatingPanelTableCell>
              <Badge variant={c.isPublished ? "default" : "secondary"}>
                {c.isPublished ? "Published" : "Draft"}
              </Badge>
            </FloatingPanelTableCell>
          </FloatingPanelTableRow>
        ))}
      </FloatingPanelTableBody>
    </FloatingPanelTable>
  );
}

function RecentCoursesFallback() {
  return (
    <>
      <Skeleton className="h-24 w-full rounded-none" />
      <Skeleton className="h-24 w-full rounded-none" />
      <Skeleton className="h-24 w-full rounded-none" />
    </>
  );
}

async function PendingList() {
  const rows = await listAdminCommentsForModeration({
    status: "pending",
    deleted: false,
    limit: 5,
  });

  if (rows.length === 0) {
    return (
      <p className="flex items-center gap-2 px-8 py-10 text-base text-muted-foreground">
        <CheckCircle2 className="size-4" /> Queue is clear.
      </p>
    );
  }

  return (
    <ul className="divide-y-2 divide-border">
      {rows.map((r) => (
        <li key={r.id} className="flex flex-col gap-2 px-6 py-5">
          <p className="line-clamp-2 whitespace-pre-wrap break-words text-base">
            {r.body}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="font-heading font-semibold text-foreground">
              {authorName(r)}
            </span>
            <TargetLink row={r} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function PendingFallback() {
  return (
    <>
      <Skeleton className="h-20 w-full rounded-none" />
      <Skeleton className="h-20 w-full rounded-none" />
      <Skeleton className="h-20 w-full rounded-none" />
    </>
  );
}

function authorName(row: AdminModerationRow): string {
  return row.author.displayName?.trim() || row.author.email.split("@")[0];
}

function TargetLink({ row }: { row: AdminModerationRow }) {
  const target = resolveTarget(row);
  if (!target) return null;
  return (
    <Link href={target.href} className="truncate hover:underline">
      {target.label}
    </Link>
  );
}

type Target = { href: string; label: string };

function resolveTarget(row: AdminModerationRow): Target | null {
  if (row.course) {
    return { href: `/courses/${row.course.slug}`, label: row.course.title };
  }
  if (row.unit) {
    return {
      href: `/courses/${row.unit.course.slug}`,
      label: `${row.unit.course.title} › ${row.unit.title}`,
    };
  }
  if (row.parent) {
    if (row.parent.course) {
      return {
        href: `/courses/${row.parent.course.slug}`,
        label: row.parent.course.title,
      };
    }
    if (row.parent.unit) {
      return {
        href: `/courses/${row.parent.unit.course.slug}`,
        label: `${row.parent.unit.course.title} › ${row.parent.unit.title}`,
      };
    }
  }
  return null;
}

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
