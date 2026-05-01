import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { lessons, userCourses } from "@/supabase/schema";

export const lessonAccessRuntime = {
  and,
  db,
  eq,
  lessons,
  userCourses,
};

export async function assertUserEnrolledForLesson(
  userId: string,
  lessonId: string,
): Promise<void> {
  const lesson = await lessonAccessRuntime.db.query.lessons.findFirst({
    where: lessonAccessRuntime.eq(lessonAccessRuntime.lessons.id, lessonId),
    columns: { id: true, unitId: true },
    with: {
      unit: { columns: { courseId: true } },
    },
  });
  if (!lesson) throw new NotFoundError("Lesson not found");

  const enrollment = await lessonAccessRuntime.db.query.userCourses.findFirst({
    where: lessonAccessRuntime.and(
      lessonAccessRuntime.eq(lessonAccessRuntime.userCourses.userId, userId),
      lessonAccessRuntime.eq(
        lessonAccessRuntime.userCourses.courseId,
        lesson.unit.courseId,
      ),
    ),
    columns: { courseId: true },
  });
  if (!enrollment) throw new NotFoundError("Lesson not found");
}
