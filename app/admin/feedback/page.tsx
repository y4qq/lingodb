import { Suspense } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  getAdminFeedbackCounts,
  listAdminFeedback,
  type AdminFeedbackRow,
  type FeedbackCounts,
} from "@/lib/domains/feedback/queries/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StarRating } from "@/components/ui/star-rating";
import {
  FloatingPanel,
  FloatingPanelBody,
  FloatingPanelHeader,
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
import { cn } from "@/lib/utils";

const TAB_VALUES = ["all", "5", "4", "3", "2", "1"] as const;
type TabValue = (typeof TAB_VALUES)[number];

function parseRatingParam(raw: string | undefined): TabValue {
  if (!raw) return "all";
  return (TAB_VALUES as readonly string[]).includes(raw)
    ? (raw as TabValue)
    : "all";
}

function tabToRatingFilter(tab: TabValue): 1 | 2 | 3 | 4 | 5 | undefined {
  if (tab === "all") return undefined;
  return Number(tab) as 1 | 2 | 3 | 4 | 5;
}

type Props = {
  searchParams: Promise<{ rating?: string; lessonId?: string }>;
};

export default async function AdminFeedbackPage({ searchParams }: Props) {
  const { rating: rawRating, lessonId } = await searchParams;
  const tab = parseRatingParam(rawRating);

  return (
    <FloatingPanelLayoutFull>
      <AdminPageHeader title="Feedback" />
      <FloatingPanel className="flex-1">
        <FloatingPanelHeader>
          <FloatingPanelTitle>User feedback</FloatingPanelTitle>
        </FloatingPanelHeader>
        <div className="shrink-0 border-b-2 border-border px-6">
          <Suspense fallback={<TabsFallback />}>
            <RatingTabs active={tab} lessonId={lessonId} />
          </Suspense>
        </div>
        <FloatingPanelBody>
          <Suspense
            key={`${tab}:${lessonId ?? ""}`}
            fallback={<ListFallback />}
          >
            <FeedbackList tab={tab} lessonId={lessonId} />
          </Suspense>
        </FloatingPanelBody>
      </FloatingPanel>
    </FloatingPanelLayoutFull>
  );
}

async function RatingTabs({
  active,
  lessonId,
}: {
  active: TabValue;
  lessonId: string | undefined;
}) {
  const counts = await getAdminFeedbackCounts();
  return (
    <nav className="flex items-center gap-1">
      {TAB_VALUES.map((tab) => (
        <TabLink
          key={tab}
          tab={tab}
          active={tab === active}
          count={countForTab(counts, tab)}
          lessonId={lessonId}
        />
      ))}
    </nav>
  );
}

function countForTab(counts: FeedbackCounts, tab: TabValue): number {
  if (tab === "all") return counts.all;
  return counts[Number(tab) as 1 | 2 | 3 | 4 | 5];
}

function TabLink({
  tab,
  active,
  count,
  lessonId,
}: {
  tab: TabValue;
  active: boolean;
  count: number;
  lessonId: string | undefined;
}) {
  const label = tab === "all" ? "All" : `${tab}★`;
  const params = new URLSearchParams();
  if (tab !== "all") params.set("rating", tab);
  if (lessonId) params.set("lessonId", lessonId);
  const qs = params.toString();
  const href = qs ? `/admin/feedback?${qs}` : "/admin/feedback";
  return (
    <Link
      href={href}
      className={cn(
        "-mb-0.5 flex h-14 items-center gap-2 border-b-2 px-4 font-heading text-xs font-bold uppercase tracking-wider transition-colors",
        active
          ? "border-chart-3 text-chart-3"
          : "border-transparent text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
      <span
        className={cn(
          "rounded-full px-1.5 py-0.5 text-xs tabular-nums",
          active
            ? "bg-chart-3/10 text-chart-3"
            : "bg-muted text-muted-foreground",
        )}
      >
        {count}
      </span>
    </Link>
  );
}

function TabsFallback() {
  return <Skeleton className="my-4 h-6 w-96" />;
}

function ListFallback() {
  return (
    <>
      <Skeleton className="h-24 w-full rounded-none" />
      <Skeleton className="h-24 w-full rounded-none" />
      <Skeleton className="h-24 w-full rounded-none" />
    </>
  );
}

async function FeedbackList({
  tab,
  lessonId,
}: {
  tab: TabValue;
  lessonId: string | undefined;
}) {
  const rows = await listAdminFeedback({
    rating: tabToRatingFilter(tab),
    lessonId,
  });

  if (rows.length === 0) {
    return (
      <p className="px-8 py-10 text-base text-muted-foreground">
        {emptyMessageFor(tab)}
      </p>
    );
  }

  return (
    <FloatingPanelTable>
      <FloatingPanelTableHeader>
        <tr>
          <FloatingPanelTableHead className="w-40">Rating</FloatingPanelTableHead>
          <FloatingPanelTableHead>Comment</FloatingPanelTableHead>
          <FloatingPanelTableHead className="w-64">Lesson</FloatingPanelTableHead>
          <FloatingPanelTableHead className="w-56">User</FloatingPanelTableHead>
          <FloatingPanelTableHead className="w-36">Submitted</FloatingPanelTableHead>
        </tr>
      </FloatingPanelTableHeader>
      <FloatingPanelTableBody>
        {rows.map((r) => (
          <FloatingPanelTableRow key={`${r.userId}:${r.lessonId}`}>
            <FloatingPanelTableCell className="py-5 align-top">
              <StarRating value={r.rating} readOnly size="sm" />
            </FloatingPanelTableCell>
            <FloatingPanelTableCell className="py-5 align-top whitespace-normal">
              <CommentCell row={r} />
            </FloatingPanelTableCell>
            <FloatingPanelTableCell className="py-5 align-top">
              <LessonCell row={r} />
            </FloatingPanelTableCell>
            <FloatingPanelTableCell className="py-5 align-top">
              <UserCell row={r} />
            </FloatingPanelTableCell>
            <FloatingPanelTableCell className="py-5 align-top text-muted-foreground">
              {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
            </FloatingPanelTableCell>
          </FloatingPanelTableRow>
        ))}
      </FloatingPanelTableBody>
    </FloatingPanelTable>
  );
}

function emptyMessageFor(tab: TabValue): string {
  if (tab === "all") return "No feedback yet.";
  return `No ${tab}-star feedback yet.`;
}

function CommentCell({ row }: { row: AdminFeedbackRow }) {
  if (!row.comment) {
    return <span className="text-muted-foreground">—</span>;
  }
  return (
    <p className="line-clamp-4 whitespace-pre-wrap break-words">
      {row.comment}
    </p>
  );
}

function LessonCell({ row }: { row: AdminFeedbackRow }) {
  const { lesson } = row;
  return (
    <Link
      href={`/courses/${lesson.unit.course.slug}`}
      className="block hover:underline"
    >
      <span className="block truncate font-heading font-semibold">
        {lesson.title}
      </span>
      <span className="block truncate text-xs text-muted-foreground">
        {lesson.unit.course.title} › {lesson.unit.title}
      </span>
    </Link>
  );
}

function UserCell({ row }: { row: AdminFeedbackRow }) {
  const name = row.user.displayName?.trim() || row.user.email.split("@")[0];
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-heading font-semibold">{name}</span>
      <span className="truncate text-xs text-muted-foreground">
        {row.user.email}
      </span>
    </div>
  );
}
