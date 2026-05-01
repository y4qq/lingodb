import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { userLessonFeedback } from "@/supabase/schema";
import { assertUserEnrolledForLesson } from "../courses/lesson-access";
import type { SubmitFeedbackInput } from "./feedback.validation";

export type MyFeedbackRow = {
  rating: number;
  comment: string | null;
};

export async function upsertLessonFeedback(
  userId: string,
  input: SubmitFeedbackInput,
): Promise<void> {
  await assertUserEnrolledForLesson(userId, input.lessonId);

  await db
    .insert(userLessonFeedback)
    .values({
      userId,
      lessonId: input.lessonId,
      rating: input.rating,
      comment: input.comment,
    })
    .onConflictDoUpdate({
      target: [userLessonFeedback.userId, userLessonFeedback.lessonId],
      set: {
        rating: input.rating,
        comment: input.comment,
      },
    });
}

export async function getMyFeedbackForLessons(
  userId: string,
  lessonIds: string[],
): Promise<Map<string, MyFeedbackRow>> {
  if (lessonIds.length === 0) return new Map();

  const rows = await db
    .select({
      lessonId: userLessonFeedback.lessonId,
      rating: userLessonFeedback.rating,
      comment: userLessonFeedback.comment,
    })
    .from(userLessonFeedback)
    .where(
      and(
        eq(userLessonFeedback.userId, userId),
        inArray(userLessonFeedback.lessonId, lessonIds),
      ),
    );

  const map = new Map<string, MyFeedbackRow>();
  for (const r of rows) {
    map.set(r.lessonId, { rating: r.rating, comment: r.comment });
  }
  return map;
}
