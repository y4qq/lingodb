import { Suspense } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  getAdminModerationCounts,
  listAdminCommentsForModeration,
  type AdminModerationRow,
} from "@/lib/domains/comments/queries/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CommentModerationRowActions } from "@/components/admin/comment-moderation-row-actions";
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

const TAB_STATUSES = ["pending", "approved", "rejected", "deleted"] as const;
type TabStatus = (typeof TAB_STATUSES)[number];

function parseStatusParam(raw: string | undefined): TabStatus {
  if (!raw) return "pending";
  return (TAB_STATUSES as readonly string[]).includes(raw)
    ? (raw as TabStatus)
    : "pending";
}

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminCommentsPage({ searchParams }: Props) {
  const { status: rawStatus } = await searchParams;
  const status = parseStatusParam(rawStatus);

  return (
    <FloatingPanelLayoutFull>
      <AdminPageHeader title="Comments" />
      <FloatingPanel className="flex-1">
        <FloatingPanelHeader>
          <FloatingPanelTitle>Moderation queue</FloatingPanelTitle>
        </FloatingPanelHeader>
        <div className="shrink-0 border-b-2 border-border px-6">
          <Suspense fallback={<TabsFallback />}>
            <ModerationTabs active={status} />
          </Suspense>
        </div>
        <FloatingPanelBody>
          <Suspense key={status} fallback={<ListFallback />}>
            <ModerationList status={status} />
          </Suspense>
        </FloatingPanelBody>
      </FloatingPanel>
    </FloatingPanelLayoutFull>
  );
}

async function ModerationTabs({ active }: { active: TabStatus }) {
  const counts = await getAdminModerationCounts();
  return (
    <nav className="flex items-center gap-1">
      {TAB_STATUSES.map((status) => (
        <TabLink
          key={status}
          status={status}
          active={status === active}
          count={counts[status]}
        />
      ))}
    </nav>
  );
}

function TabLink({
  status,
  active,
  count,
}: {
  status: TabStatus;
  active: boolean;
  count: number;
}) {
  const label = status[0].toUpperCase() + status.slice(1);
  return (
    <Link
      href={`/admin/comments?status=${status}`}
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

async function ModerationList({ status }: { status: TabStatus }) {
  const rows =
    status === "deleted"
      ? await listAdminCommentsForModeration({ deleted: true })
      : await listAdminCommentsForModeration({ status, deleted: false });

  if (rows.length === 0) {
    return (
      <p className="px-8 py-10 text-base text-muted-foreground">
        {emptyMessageFor(status)}
      </p>
    );
  }

  return (
    <FloatingPanelTable>
      <FloatingPanelTableHeader>
        <tr>
          <FloatingPanelTableHead>Comment</FloatingPanelTableHead>
          <FloatingPanelTableHead className="w-40">Author</FloatingPanelTableHead>
          <FloatingPanelTableHead className="w-64">Email</FloatingPanelTableHead>
          <FloatingPanelTableHead className="w-56">Target</FloatingPanelTableHead>
          <FloatingPanelTableHead className="w-36">
            Submitted
          </FloatingPanelTableHead>
          <FloatingPanelTableHead className="w-72 text-right">
            Actions
          </FloatingPanelTableHead>
        </tr>
      </FloatingPanelTableHeader>
      <FloatingPanelTableBody>
        {rows.map((r) => {
          const authorName =
            r.author.displayName?.trim() || r.author.email.split("@")[0];
          return (
            <FloatingPanelTableRow key={r.id}>
              <FloatingPanelTableCell className="py-5 align-top whitespace-normal">
                <CommentCell row={r} />
              </FloatingPanelTableCell>
              <FloatingPanelTableCell className="py-5 align-top">
                <span className="font-heading font-semibold">{authorName}</span>
              </FloatingPanelTableCell>
              <FloatingPanelTableCell className="py-5 align-top text-muted-foreground">
                <span className="block truncate">{r.author.email}</span>
              </FloatingPanelTableCell>
              <FloatingPanelTableCell className="py-5 align-top">
                <TargetCell row={r} />
              </FloatingPanelTableCell>
              <FloatingPanelTableCell className="py-5 align-top text-muted-foreground">
                {formatDistanceToNow(new Date(r.createdAt), {
                  addSuffix: true,
                })}
              </FloatingPanelTableCell>
              <FloatingPanelTableCell className="py-5 text-right align-top">
                <CommentModerationRowActions
                  commentId={r.id}
                  status={r.moderationStatus}
                  deletedAt={r.deletedAt}
                />
              </FloatingPanelTableCell>
            </FloatingPanelTableRow>
          );
        })}
      </FloatingPanelTableBody>
    </FloatingPanelTable>
  );
}

function emptyMessageFor(status: TabStatus): string {
  switch (status) {
    case "pending":
      return "Nothing pending. The queue is clear.";
    case "approved":
      return "No approved comments yet.";
    case "rejected":
      return "No rejected comments.";
    case "deleted":
      return "No deleted comments.";
  }
}

function CommentCell({ row }: { row: AdminModerationRow }) {
  const parentSnippet = row.parent ? snippet(row.parent.body, 80) : null;
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      {parentSnippet && (
        <span className="text-xs italic text-muted-foreground">
          ↳ reply to “{parentSnippet}”
        </span>
      )}
      <p className="line-clamp-4 whitespace-pre-wrap break-words">{row.body}</p>
    </div>
  );
}

function TargetCell({ row }: { row: AdminModerationRow }) {
  const target = resolveTarget(row);
  if (!target) {
    return <span className="text-muted-foreground">—</span>;
  }
  return (
    <Link href={target.href} className="hover:underline">
      {target.label}
    </Link>
  );
}

type Target = { href: string; label: string };

// Resolve target from direct course/unit FKs for top-level, or from the
// parent's FKs for replies.
function resolveTarget(row: AdminModerationRow): Target | null {
  if (row.course) {
    return {
      href: `/courses/${row.course.slug}`,
      label: row.course.title,
    };
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

function snippet(text: string, maxLen: number): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  return trimmed.length <= maxLen ? trimmed : trimmed.slice(0, maxLen) + "…";
}
