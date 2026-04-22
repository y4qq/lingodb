"use client";

import { formatDistanceToNow } from "date-fns";
import { MessageSquare } from "lucide-react";
import type { CommentWithMeta } from "@/lib/domains/comments/queries/public";
import { CommentDeleteButton } from "@/components/app/comment-delete-button";
import { CommentReactions } from "@/components/app/comment-reactions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type CommentItemProps = {
  comment: CommentWithMeta;
  currentUserId: string;
  canReply?: boolean;
  onReplyClick?: () => void;
};

export function CommentItem({
  comment,
  currentUserId,
  canReply = false,
  onReplyClick,
}: CommentItemProps) {
  const name =
    comment.author.displayName?.trim() || comment.author.email.split("@")[0];
  const when = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
  });
  const isOwn = comment.author.id === currentUserId;
  const isDeleted = comment.deletedAt !== null;
  const isApproved = comment.moderationStatus === "approved";
  const isOwnPending = isOwn && comment.moderationStatus === "pending";

  if (isDeleted) {
    return (
      <div className="flex gap-3">
        <Avatar size="sm">
          <AvatarFallback>{name[0]?.toUpperCase() ?? "?"}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 items-center">
          <p className="text-muted-foreground text-sm italic">
            Comment deleted by author
          </p>
        </div>
      </div>
    );
  }

  const showReactions = isApproved;
  const showReply = canReply && isApproved && onReplyClick;
  const showDelete = isOwn;
  const showActionRow = showReactions || showReply || showDelete;

  return (
    <div className="flex gap-3">
      <Avatar size="sm">
        <AvatarFallback>{name[0]?.toUpperCase() ?? "?"}</AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="truncate text-sm font-medium">{name}</span>
          <span className="text-muted-foreground text-xs">{when}</span>
          {isOwnPending && (
            <Badge variant="secondary" className="ml-auto">
              Pending
            </Badge>
          )}
        </div>
        <p className="text-sm whitespace-pre-wrap break-words">{comment.body}</p>
        {showActionRow && (
          <div className="-ml-2 flex items-center gap-1">
            {showReactions && (
              <CommentReactions
                commentId={comment.id}
                likeCount={comment.likeCount}
                dislikeCount={comment.dislikeCount}
                myReaction={comment.myReaction}
                disabled={isOwn}
              />
            )}
            {showReply && (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={onReplyClick}
                className="text-muted-foreground gap-1"
              >
                <MessageSquare />
                Reply
              </Button>
            )}
            {showDelete && <CommentDeleteButton commentId={comment.id} />}
          </div>
        )}
      </div>
    </div>
  );
}
