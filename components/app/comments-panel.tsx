"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import {
  submitCourseComment,
  submitPackComment,
} from "@/lib/domains/comments/actions/user";
import type { CommentWithThread } from "@/lib/domains/comments/queries/public";
import { CommentItem } from "@/components/app/comment-item";
import { CommentReplyForm } from "@/components/app/comment-reply-form";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type CommentsPanelProps = {
  target:
    | { kind: "course"; courseId: string }
    | { kind: "pack"; packId: string };
  initialComments: CommentWithThread[];
  currentUserId: string;
};

export function CommentsPanel({
  target,
  initialComments,
  currentUserId,
}: CommentsPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open comments"
          className={cn(
            "fixed top-1/2 right-0 z-40 -translate-y-1/2",
            "flex h-14 w-9 items-center justify-center rounded-l-lg",
            "border border-r-0 border-border bg-background shadow-md",
            "text-muted-foreground transition-colors",
            "hover:bg-muted hover:text-foreground",
            "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          )}
        >
          <MessageCircle className="size-5" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-[480px]"
      >
        <SheetHeader className="border-b">
          <SheetTitle>Comments</SheetTitle>
        </SheetHeader>
        <CommentsList
          comments={initialComments}
          currentUserId={currentUserId}
        />
        <CommentForm target={target} />
      </SheetContent>
    </Sheet>
  );
}

function CommentsList({
  comments,
  currentUserId,
}: {
  comments: CommentWithThread[];
  currentUserId: string;
}) {
  const [replyingToId, setReplyingToId] = useState<string | null>(null);

  if (comments.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-10">
        <p className="text-muted-foreground text-sm">
          No comments yet. Be the first to leave one.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <ul className="flex flex-col gap-5 px-4 py-4">
        {comments.map((c) => (
          <li key={c.id} className="flex flex-col gap-3">
            <CommentItem
              comment={c}
              currentUserId={currentUserId}
              canReply
              onReplyClick={() => setReplyingToId(c.id)}
            />
            {replyingToId === c.id && (
              <div className="pl-11">
                <CommentReplyForm
                  parentCommentId={c.id}
                  onSubmitted={() => setReplyingToId(null)}
                  onCancel={() => setReplyingToId(null)}
                />
              </div>
            )}
            {c.replies.length > 0 && (
              <ul className="flex flex-col gap-4 pl-11">
                {c.replies.map((r) => (
                  <li key={r.id}>
                    <CommentItem
                      comment={r}
                      currentUserId={currentUserId}
                    />
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </ScrollArea>
  );
}

function CommentForm({ target }: { target: CommentsPanelProps["target"] }) {
  const action =
    target.kind === "course" ? submitCourseComment : submitPackComment;
  const [state, formAction, isPending] = useActionState(action, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
    }
  }, [state]);

  const bodyError = state && !state.ok ? state.fieldErrors?.body?.[0] : undefined;
  const summaryError = state && !state.ok ? state.error : undefined;

  return (
    <form
      ref={formRef}
      action={formAction}
      className="border-t bg-background p-4 flex flex-col gap-2"
    >
      {target.kind === "course" ? (
        <input type="hidden" name="courseId" value={target.courseId} />
      ) : (
        <input type="hidden" name="packId" value={target.packId} />
      )}
      <Textarea
        name="body"
        placeholder="Add a comment…"
        rows={3}
        required
        maxLength={4000}
        aria-invalid={bodyError ? true : undefined}
      />
      {bodyError && <p className="text-destructive text-xs">{bodyError}</p>}
      {summaryError && (
        <p className="text-destructive text-xs">{summaryError}</p>
      )}
      <div className="flex items-center justify-between gap-2">
        <p className="text-muted-foreground text-xs">
          Comments are reviewed before they appear publicly.
        </p>
        <Button type="submit" size="sm" disabled={isPending}>
          <Send className="size-3.5" />
          {isPending ? "Posting…" : "Post"}
        </Button>
      </div>
    </form>
  );
}
