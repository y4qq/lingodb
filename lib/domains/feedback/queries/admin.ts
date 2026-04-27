import "server-only";
import { count, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  courses,
  lessons,
  units,
  userLessonFeedback,
  users,
} from "@/supabase/schema";

export type AdminFeedbackRow = {
  userId: string;
  lessonId: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: { id: string; email: string; displayName: string | null };
  lesson: {
    id: string;
    slug: string;
    title: string;
    unit: {
      id: string;
      slug: string;
      title: string;
      course: { id: string; slug: string; title: string };
    };
  };
};

export type FeedbackCounts = {
  all: number;
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
};

const FEEDBACK_LIMIT = 200;

export async function getAdminFeedbackCounts(): Promise<FeedbackCounts> {
  const rows = await db
    .select({
      rating: userLessonFeedback.rating,
      n: count(),
    })
    .from(userLessonFeedback)
    .groupBy(userLessonFeedback.rating);

  const result: FeedbackCounts = { all: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of rows) {
    const star = r.rating as 1 | 2 | 3 | 4 | 5;
    result[star] = r.n;
    result.all += r.n;
  }
  return result;
}

export async function listAdminFeedback(filter: {
  rating?: 1 | 2 | 3 | 4 | 5;
  lessonId?: string;
} = {}): Promise<AdminFeedbackRow[]> {
  const where = sql`TRUE`;
  const conditions = [where];
  if (filter.rating !== undefined) {
    conditions.push(sql`${userLessonFeedback.rating} = ${filter.rating}`);
  }
  if (filter.lessonId !== undefined) {
    conditions.push(sql`${userLessonFeedback.lessonId} = ${filter.lessonId}`);
  }
  const whereSql = sql.join(conditions, sql` AND `);

  const rows = await db
    .select({
      userId: userLessonFeedback.userId,
      lessonId: userLessonFeedback.lessonId,
      rating: userLessonFeedback.rating,
      comment: userLessonFeedback.comment,
      createdAt: userLessonFeedback.createdAt,
      updatedAt: userLessonFeedback.updatedAt,
      userEmail: users.email,
      userDisplayName: users.displayName,
      lessonSlug: lessons.slug,
      lessonTitle: lessons.title,
      unitId: units.id,
      unitSlug: units.slug,
      unitTitle: units.title,
      courseId: courses.id,
      courseSlug: courses.slug,
      courseTitle: courses.title,
    })
    .from(userLessonFeedback)
    .innerJoin(users, eq(users.id, userLessonFeedback.userId))
    .innerJoin(lessons, eq(lessons.id, userLessonFeedback.lessonId))
    .innerJoin(units, eq(units.id, lessons.unitId))
    .innerJoin(courses, eq(courses.id, units.courseId))
    .where(whereSql)
    .orderBy(desc(userLessonFeedback.createdAt))
    .limit(FEEDBACK_LIMIT);

  return rows.map((r) => ({
    userId: r.userId,
    lessonId: r.lessonId,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    user: {
      id: r.userId,
      email: r.userEmail,
      displayName: r.userDisplayName,
    },
    lesson: {
      id: r.lessonId,
      slug: r.lessonSlug,
      title: r.lessonTitle,
      unit: {
        id: r.unitId,
        slug: r.unitSlug,
        title: r.unitTitle,
        course: {
          id: r.courseId,
          slug: r.courseSlug,
          title: r.courseTitle,
        },
      },
    },
  }));
}
