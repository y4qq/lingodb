"use client";

import { useOptimistic, useState, useTransition } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { toggleReaction } from "@/lib/domains/comments/actions/user";
import type { ReactionValue } from "@/lib/domains/comments/comment.validation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ReactionState = {
  likeCount: number;
  dislikeCount: number;
  myReaction: ReactionValue | null;
};

export type CommentReactionsProps = {
  commentId: string;
  likeCount: number;
  dislikeCount: number;
  myReaction: ReactionValue | null;
  disabled?: boolean;
};

function applyToggle(state: ReactionState, next: ReactionValue): ReactionState {
  // Clicking the current reaction again removes it.
  if (state.myReaction === next) {
    return {
      ...state,
      myReaction: null,
      likeCount: next === "like" ? state.likeCount - 1 : state.likeCount,
      dislikeCount:
        next === "dislike" ? state.dislikeCount - 1 : state.dislikeCount,
    };
  }
  const wasLike = state.myReaction === "like";
  const wasDislike = state.myReaction === "dislike";
  return {
    myReaction: next,
    likeCount:
      (wasLike ? state.likeCount - 1 : state.likeCount) +
      (next === "like" ? 1 : 0),
    dislikeCount:
      (wasDislike ? state.dislikeCount - 1 : state.dislikeCount) +
      (next === "dislike" ? 1 : 0),
  };
}

export function CommentReactions({
  commentId,
  likeCount,
  dislikeCount,
  myReaction,
  disabled = false,
}: CommentReactionsProps) {
  const [server, setServer] = useState<ReactionState>({
    likeCount,
    dislikeCount,
    myReaction,
  });
  const [optimistic, addOptimistic] = useOptimistic(server, applyToggle);
  const [isPending, startTransition] = useTransition();

  const toggle = (reaction: ReactionValue) => {
    if (disabled) return;
    startTransition(async () => {
      addOptimistic(reaction);
      const fd = new FormData();
      fd.set("commentId", commentId);
      fd.set("reaction", reaction);
      const result = await toggleReaction(undefined, fd);
      if (result.ok) {
        setServer(result.data);
      }
      // If the action errored, useOptimistic automatically reverts when
      // the transition finishes without a committed base-state change.
    });
  };

  return (
    <div className="flex items-center gap-1">
      <ReactionButton
        label="Like"
        icon={<ThumbsUp />}
        count={optimistic.likeCount}
        active={optimistic.myReaction === "like"}
        disabled={disabled || isPending}
        onClick={() => toggle("like")}
      />
      <ReactionButton
        label="Dislike"
        icon={<ThumbsDown />}
        count={optimistic.dislikeCount}
        active={optimistic.myReaction === "dislike"}
        disabled={disabled || isPending}
        onClick={() => toggle("dislike")}
      />
    </div>
  );
}

function ReactionButton({
  label,
  icon,
  count,
  active,
  disabled,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  count: number;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="xs"
      aria-label={`${label} (${count})`}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "gap-1 text-muted-foreground",
        active && "text-primary",
      )}
    >
      {icon}
      <span className="tabular-nums">{count}</span>
    </Button>
  );
}
