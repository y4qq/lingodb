"use client";

import { useActionState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { submitReply } from "@/lib/domains/comments/actions/user";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export type CommentReplyFormProps = {
  parentCommentId: string;
  onSubmitted: () => void;
  onCancel: () => void;
};

export function CommentReplyForm({
  parentCommentId,
  onSubmitted,
  onCancel,
}: CommentReplyFormProps) {
  const [state, formAction, isPending] = useActionState(submitReply, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      onSubmitted();
    }
  }, [state, onSubmitted]);

  const bodyError = state && !state.ok ? state.fieldErrors?.body?.[0] : undefined;
  const summaryError = state && !state.ok ? state.error : undefined;

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-2 rounded-md border bg-muted/30 p-3"
    >
      <input
        type="hidden"
        name="parentCommentId"
        value={parentCommentId}
      />
      <Textarea
        ref={textareaRef}
        name="body"
        placeholder="Write a reply…"
        rows={2}
        required
        maxLength={4000}
        aria-invalid={bodyError ? true : undefined}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
          }
        }}
      />
      {bodyError && <p className="text-destructive text-xs">{bodyError}</p>}
      {summaryError && (
        <p className="text-destructive text-xs">{summaryError}</p>
      )}
      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={isPending}>
          <Send className="size-3.5" />
          {isPending ? "Posting…" : "Reply"}
        </Button>
      </div>
    </form>
  );
}
