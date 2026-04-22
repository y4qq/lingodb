import { Suspense } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  getAdminModerationCounts,
  listAdminCommentsForModeration,
  type AdminModerationRow,
} from "@/lib/domains/comments/queries/admin";
import { PageHeader } from "@/components/common/page-header";
import { DataTable, type Column } from "@/components/common/data-table";
import { CommentModerationRowActions } from "@/components/admin/comment-moderation-row-actions";
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
    <>
      <PageHeader
        breadcrumbs={[
          { href: "/admin", label: "Dashboard" },
          { label: "Comments" },
        ]}
        title="Comments"
        description="Moderate user-submitted comments on courses and packs."
      />

      <Suspense fallback={<Skeleton className="h-10 w-full max-w-xl" />}>
        <ModerationTabs active={status} />
      </Suspense>

      <Suspense
        key={status}
        fallback={<Skeleton className="h-64 w-full" />}
      >
        <ModerationList status={status} />
      </Suspense>
    </>
  );
}

async function ModerationTabs({ active }: { active: TabStatus }) {
  const counts = await getAdminModerationCounts();
  return (
    <nav className="flex items-center gap-1 border-b">
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
        "relative -mb-px flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "border-primary text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
      <span
        className={cn(
          "rounded-full px-1.5 py-0.5 text-xs tabular-nums",
          active
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground",
        )}
      >
        {count}
      </span>
    </Link>
  );
}

async function ModerationList({ status }: { status: TabStatus }) {
  const rows =
    status === "deleted"
      ? await listAdminCommentsForModeration({ deleted: true })
      : await listAdminCommentsForModeration({ status, deleted: false });

  return (
    <DataTable
      columns={columns}
      data={rows}
      rowKey={(r) => r.id}
      empty={emptyMessageFor(status)}
    />
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

const columns: Column<AdminModerationRow>[] = [
  {
    header: "Comment",
    cell: (r) => <CommentCell row={r} />,
  },
  {
    header: "Author",
    cell: (r) => <AuthorCell row={r} />,
    className: "w-48",
  },
  {
    header: "Target",
    cell: (r) => <TargetCell row={r} />,
    className: "w-56",
  },
  {
    header: "Submitted",
    cell: (r) => (
      <span className="text-muted-foreground text-xs whitespace-nowrap">
        {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
      </span>
    ),
    className: "w-32",
  },
  {
    header: "Actions",
    cell: (r) => (
      <CommentModerationRowActions
        commentId={r.id}
        status={r.moderationStatus}
        deletedAt={r.deletedAt}
      />
    ),
    className: "w-72 text-right",
  },
];

function CommentCell({ row }: { row: AdminModerationRow }) {
  const parentSnippet = row.parent ? snippet(row.parent.body, 80) : null;
  return (
    <div className="flex min-w-0 flex-col gap-1">
      {parentSnippet && (
        <span className="text-muted-foreground text-xs italic">
          ↳ reply to “{parentSnippet}”
        </span>
      )}
      <p className="line-clamp-4 text-sm whitespace-pre-wrap break-words">
        {row.body}
      </p>
    </div>
  );
}

function AuthorCell({ row }: { row: AdminModerationRow }) {
  const name =
    row.author.displayName?.trim() || row.author.email.split("@")[0];
  return (
    <div className="flex min-w-0 flex-col">
      <span className="truncate text-sm">{name}</span>
      <span className="text-muted-foreground truncate text-xs">
        {row.author.email}
      </span>
    </div>
  );
}

function TargetCell({ row }: { row: AdminModerationRow }) {
  const target = resolveTarget(row);
  if (!target) {
    return <span className="text-muted-foreground text-xs">—</span>;
  }
  return (
    <Link href={target.href} className="text-sm hover:underline">
      {target.label}
    </Link>
  );
}

type Target = { href: string; label: string };

// Resolve target from direct course/pack FKs for top-level, or from the
// parent's FKs for replies.
function resolveTarget(row: AdminModerationRow): Target | null {
  if (row.course) {
    return {
      href: `/courses/${row.course.slug}`,
      label: row.course.title,
    };
  }
  if (row.pack) {
    return {
      href: `/courses/${row.pack.course.slug}/${row.pack.slug}`,
      label: `${row.pack.course.title} › ${row.pack.title}`,
    };
  }
  if (row.parent) {
    if (row.parent.course) {
      return {
        href: `/courses/${row.parent.course.slug}`,
        label: row.parent.course.title,
      };
    }
    if (row.parent.pack) {
      return {
        href: `/courses/${row.parent.pack.course.slug}/${row.parent.pack.slug}`,
        label: `${row.parent.pack.course.title} › ${row.parent.pack.title}`,
      };
    }
  }
  return null;
}

function snippet(text: string, maxLen: number): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  return trimmed.length <= maxLen ? trimmed : trimmed.slice(0, maxLen) + "…";
}
