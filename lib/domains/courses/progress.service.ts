import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import {
  lessons,
  units,
  userCourses,
  userLessonProgress,
} from "@/supabase/schema";

export type ProgressRow = {
  lessonId: string;
  lastPositionSeconds: number;
  lastAudioVersionId: string | null;
  completedAt: Date | null;
};

export async function getProgressForUserCourse(
  userId: string,
  courseId: string,
): Promise<Map<string, ProgressRow>> {
  const rows = await db
    .select({
      lessonId: userLessonProgress.lessonId,
      lastPositionSeconds: userLessonProgress.lastPositionSeconds,
      lastAudioVersionId: userLessonProgress.lastAudioVersionId,
      completedAt: userLessonProgress.completedAt,
    })
    .from(userLessonProgress)
    .innerJoin(lessons, eq(lessons.id, userLessonProgress.lessonId))
    .innerJoin(units, eq(units.id, lessons.unitId))
    .where(
      and(
        eq(userLessonProgress.userId, userId),
        eq(units.courseId, courseId),
      ),
    );

  const map = new Map<string, ProgressRow>();
  for (const r of rows) map.set(r.lessonId, r);
  return map;
}

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

export async function upsertLessonPosition(
  userId: string,
  input: {
    lessonId: string;
    audioVersionId: string;
    positionSeconds: number;
  },
): Promise<void> {
  await assertEnrolledForLesson(userId, input.lessonId);
  const safePosition = Math.max(0, Math.floor(input.positionSeconds));

  await db
    .insert(userLessonProgress)
    .values({
      userId,
      lessonId: input.lessonId,
      lastAudioVersionId: input.audioVersionId,
      lastPositionSeconds: safePosition,
      lastPlayedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [userLessonProgress.userId, userLessonProgress.lessonId],
      set: {
        lastAudioVersionId: input.audioVersionId,
        lastPositionSeconds: safePosition,
        lastPlayedAt: new Date(),
      },
    });
}

export async function markLessonCompleted(
  userId: string,
  input: { lessonId: string; audioVersionId: string },
): Promise<void> {
  await assertEnrolledForLesson(userId, input.lessonId);

  await db
    .insert(userLessonProgress)
    .values({
      userId,
      lessonId: input.lessonId,
      lastAudioVersionId: input.audioVersionId,
      completedAt: new Date(),
      lastPlayedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [userLessonProgress.userId, userLessonProgress.lessonId],
      set: {
        lastAudioVersionId: input.audioVersionId,
        lastPlayedAt: new Date(),
        // Sticky: only set completedAt the first time.
        completedAt: sql`COALESCE(${userLessonProgress.completedAt}, NOW())`,
      },
    });
}
