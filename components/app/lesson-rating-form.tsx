"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { Textarea } from "@/components/ui/textarea";
import { submitLessonFeedback } from "@/lib/domains/feedback/actions/user";

type Props = {
  lessonId: string;
  lessonTitle: string;
  isLastLesson: boolean;
  initial: { rating: number; comment: string | null } | null;
  onDone: () => void;
};

export function LessonRatingForm({
  lessonId,
  lessonTitle,
  isLastLesson,
  initial,
  onDone,
}: Props) {
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [comment, setComment] = useState(initial?.comment ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isUpdate = initial !== null;
  const canSubmit = rating >= 1 && rating <= 5 && !isPending;

  function handleSubmit() {
    if (!canSubmit) return;
    setError(null);
    startTransition(async () => {
      const result = await submitLessonFeedback({
        lessonId,
        rating,
        comment: comment.trim() || undefined,
      });
      if (!result.ok) {
        setError(
          result.error ??
            result.fieldErrors?.comment?.[0] ??
            result.fieldErrors?.rating?.[0] ??
            "Couldn't save your feedback.",
        );
        return;
      }
      onDone();
    });
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="flex max-w-md flex-col gap-2">
        <p className="text-muted-foreground text-xs uppercase tracking-widest">
          {isLastLesson ? "Last lesson" : "How was that?"}
        </p>
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          Rate {lessonTitle}
        </h2>
      </div>

      <StarRating
        value={rating}
        onChange={setRating}
        size="lg"
        ariaLabel="Lesson rating"
      />

      <Textarea
        placeholder="Anything you'd like to share? (optional)"
        rows={3}
        maxLength={4000}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="max-w-md"
      />

      {error && <p className="text-destructive text-sm">{error}</p>}

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="lg"
          onClick={onDone}
          disabled={isPending}
          className="text-muted-foreground"
        >
          Skip
        </Button>
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="px-8"
        >
          {isPending
            ? "Saving…"
            : isUpdate
              ? "Update rating"
              : "Submit rating"}
        </Button>
      </div>
    </div>
  );
}
