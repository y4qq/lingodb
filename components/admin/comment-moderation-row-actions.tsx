"use client";

import { useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { Check, RotateCcw, X } from "lucide-react";
import {
  approveComment,
  rejectComment,
  resetCommentModeration,
} from "@/lib/domains/comments/actions/admin";
import { Button } from "@/components/ui/button";

type ModerationStatus = "pending" | "approved" | "rejected";

export type CommentModerationRowActionsProps = {
  commentId: string;
  status: ModerationStatus;
  deletedAt: Date | string | null;
};

export function CommentModerationRowActions({
  commentId,
  status,
  deletedAt,
}: CommentModerationRowActionsProps) {
  if (deletedAt !== null) {
    return (
      <span className="text-muted-foreground text-xs">
        Deleted {formatDistanceToNow(new Date(deletedAt), { addSuffix: true })}
      </span>
    );
  }
  return <ActiveRowActions commentId={commentId} status={status} />;
}

function ActiveRowActions({
  commentId,
  status,
}: {
  commentId: string;
  status: ModerationStatus;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const runAction = (
    action:
      | typeof approveComment
      | typeof rejectComment
      | typeof resetCommentModeration,
  ) => {
    startTransition(async () => {
      setError(null);
      const fd = new FormData();
      fd.set("commentId", commentId);
      const result = await action(undefined, fd);
      if (!result.ok) {
        setError(result.error ?? "Something went wrong");
      }
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1">
        {status !== "approved" && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => runAction(approveComment)}
          >
            <Check />
            Approve
          </Button>
        )}
        {status !== "rejected" && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={isPending}
            onClick={() => runAction(rejectComment)}
          >
            <X />
            Reject
          </Button>
        )}
        {status !== "pending" && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={() => runAction(resetCommentModeration)}
            title="Move back to the pending queue"
          >
            <RotateCcw />
            Reset
          </Button>
        )}
      </div>
      {error && <span className="text-destructive text-xs">{error}</span>}
    </div>
  );
}
