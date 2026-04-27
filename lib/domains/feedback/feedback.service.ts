import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import {
  lessons,
  userCourses,
  userLessonFeedback,
} from "@/supabase/schema";
import type { SubmitFeedbackInput } from "./feedback.validation";

export type MyFeedbackRow = {
  rating: number;
  comment: string | null;
};

async function assertEnrolledForLesson(userId: string, lessonId: string) {
  const lesson = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
    columns: { id: true, unitId: true },
    with: {
      unit: { columns: { courseId: true } },
    },
  });
  if (!lesson) throw new NotFoundError("Lesson not found");

  const enrollment = await db.query.userCourses.findFirst({
    where: and(
      eq(userCourses.userId, userId),
      eq(userCourses.courseId, lesson.unit.courseId),
    ),
    columns: { courseId: true },
  });
  if (!enrollment) throw new NotFoundError("Lesson not found");
}

export async function upsertLessonFeedback(
  userId: string,
  input: SubmitFeedbackInput,
): Promise<void> {
  await assertEnrolledForLesson(userId, input.lessonId);

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
