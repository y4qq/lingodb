"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteOwnComment } from "@/lib/domains/comments/actions/user";
import { Button } from "@/components/ui/button";

export function CommentDeleteButton({ commentId }: { commentId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("commentId", commentId);
      const result = await deleteOwnComment(undefined, fd);
      if (!result.ok) {
        setError(result.error ?? "Could not delete comment");
        setConfirming(false);
      }
    });
  };

  if (error) {
    return <span className="text-destructive text-xs">{error}</span>;
  }

  if (!confirming) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="xs"
        onClick={() => setConfirming(true)}
        className="text-muted-foreground gap-1"
        aria-label="Delete comment"
      >
        <Trash2 />
        Delete
      </Button>
    );
  }

  return (
    <span className="flex items-center gap-1">
      <Button
        type="button"
        variant="destructive"
        size="xs"
        onClick={handleDelete}
        disabled={isPending}
      >
        {isPending ? "Deleting…" : "Confirm delete"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="xs"
        onClick={() => setConfirming(false)}
        disabled={isPending}
      >
        Cancel
      </Button>
    </span>
  );
}
