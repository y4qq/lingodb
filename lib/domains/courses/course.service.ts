import "server-only";
import { and, asc, count, desc, eq, isNull, max, notInArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { ConflictError, NotFoundError } from "@/lib/errors";
import {
  courses,
  languages,
  lessonAudioVersions,
  lessons,
  units,
  userCourses,
} from "@/supabase/schema";
import type { CreateCourseInput, UpdateCourseInput } from "./course.validation";
import type { CreateLessonInput } from "./lesson.validation";
import type { CreateUnitInput, UpdateUnitInput } from "./unit.validation";

export async function listPublishedCourses() {
  return db.query.courses.findMany({
    where: eq(courses.isPublished, true),
    orderBy: asc(courses.title),
  });
}

export async function getPublishedCourseBySlug(slug: string) {
  const course = await db.query.courses.findFirst({
    where: and(eq(courses.slug, slug), eq(courses.isPublished, true)),
    with: {
      units: {
        where: eq(units.isPublished, true),
        orderBy: asc(units.position),
      },
    },
  });
  return course ?? null;
}

export async function getPublishedUnitBySlugs(
  courseSlug: string,
  unitSlug: string,
) {
  const course = await db.query.courses.findFirst({
    where: and(eq(courses.slug, courseSlug), eq(courses.isPublished, true)),
    with: {
      units: {
        where: and(eq(units.slug, unitSlug), eq(units.isPublished, true)),
        with: {
          lessons: {
            where: eq(lessons.isPublished, true),
            orderBy: asc(lessons.position),
          },
        },
      },
    },
  });
  const unit = course?.units[0];
  if (!course || !unit) return null;
  return { course, unit };
}

export async function listAdminCourses() {
  return db.query.courses.findMany({
    orderBy: asc(courses.title),
    with: {
      baseLanguage: true,
      targetLanguage: true,
    },
  });
}

export async function listAdminCoursesWithEnrollments() {
  const [rows, counts] = await Promise.all([
    listAdminCourses(),
    db
      .select({ courseId: userCourses.courseId, n: count() })
      .from(userCourses)
      .groupBy(userCourses.courseId),
  ]);
  const countMap = new Map(counts.map((r) => [r.courseId, r.n]));
  return rows.map((r) => ({ ...r, enrollmentCount: countMap.get(r.id) ?? 0 }));
}

export async function listAvailableCoursesForUser(userId: string) {
  const enrolledCourseIds = db
    .select({ id: userCourses.courseId })
    .from(userCourses)
    .where(eq(userCourses.userId, userId));

  return db.query.courses.findMany({
    where: and(
      eq(courses.isPublished, true),
      notInArray(courses.id, enrolledCourseIds),
    ),
    orderBy: asc(courses.title),
    with: {
      baseLanguage: true,
      targetLanguage: true,
    },
  });
}

export async function getCourseForUser(userId: string, slug: string) {
  const course = await db.query.courses.findFirst({
    where: eq(courses.slug, slug),
    with: {
      units: {
        where: eq(units.isPublished, true),
        orderBy: asc(units.position),
        with: {
          lessons: {
            where: eq(lessons.isPublished, true),
            orderBy: asc(lessons.position),
          },
        },
      },
    },
  });
  if (!course) return null;

  const enrollment = await db.query.userCourses.findFirst({
    where: and(
      eq(userCourses.userId, userId),
      eq(userCourses.courseId, course.id),
    ),
    columns: { courseId: true },
  });
  if (!enrollment) return null;

  return course;
}

export async function getUnitForUser(
  userId: string,
  courseSlug: string,
  unitSlug: string,
) {
  const course = await db.query.courses.findFirst({
    where: eq(courses.slug, courseSlug),
    with: {
      units: {
        where: eq(units.slug, unitSlug),
        with: {
          lessons: {
            where: eq(lessons.isPublished, true),
            orderBy: asc(lessons.position),
          },
        },
      },
    },
  });
  const unit = course?.units[0];
  if (!course || !unit) return null;

  const enrollment = await db.query.userCourses.findFirst({
    where: and(
      eq(userCourses.userId, userId),
      eq(userCourses.courseId, course.id),
    ),
    columns: { courseId: true },
  });
  if (!enrollment) return null;

  return { course, unit };
}

export async function getLessonForUser(
  userId: string,
  courseSlug: string,
  unitSlug: string,
  lessonSlug: string,
) {
  const course = await db.query.courses.findFirst({
    where: eq(courses.slug, courseSlug),
    with: {
      units: {
        where: and(eq(units.slug, unitSlug), eq(units.isPublished, true)),
        with: {
          lessons: {
            where: and(
              eq(lessons.slug, lessonSlug),
              eq(lessons.isPublished, true),
            ),
            with: {
              audioVersions: {
                where: isNull(lessonAudioVersions.disabledAt),
                orderBy: desc(lessonAudioVersions.createdAt),
              },
            },
          },
        },
      },
    },
  });
  const unit = course?.units[0];
  const lesson = unit?.lessons[0];
  if (!course || !unit || !lesson) return null;

  const enrollment = await db.query.userCourses.findFirst({
    where: and(
      eq(userCourses.userId, userId),
      eq(userCourses.courseId, course.id),
    ),
    columns: { courseId: true },
  });
  if (!enrollment) return null;

  return { course, unit, lesson };
}

export async function listRecentAdminCourses(limit = 5) {
  return db.query.courses.findMany({
    orderBy: desc(courses.updatedAt),
    limit,
    with: {
      baseLanguage: true,
      targetLanguage: true,
    },
  });
}

export type AdminCourseStats = {
  courseCount: number;
  publishedCourseCount: number;
  unitCount: number;
  publishedUnitCount: number;
  lessonCount: number;
  publishedLessonCount: number;
};

export async function getAdminCourseStats(): Promise<AdminCourseStats> {
  const [
    courseTotal,
    coursePublished,
    unitTotal,
    unitPublished,
    lessonTotal,
    lessonPublished,
  ] = await Promise.all([
    db.select({ n: count() }).from(courses),
    db
      .select({ n: count() })
      .from(courses)
      .where(eq(courses.isPublished, true)),
    db.select({ n: count() }).from(units),
    db.select({ n: count() }).from(units).where(eq(units.isPublished, true)),
    db.select({ n: count() }).from(lessons),
    db
      .select({ n: count() })
      .from(lessons)
      .where(eq(lessons.isPublished, true)),
  ]);

  return {
    courseCount: courseTotal[0].n,
    publishedCourseCount: coursePublished[0].n,
    unitCount: unitTotal[0].n,
    publishedUnitCount: unitPublished[0].n,
    lessonCount: lessonTotal[0].n,
    publishedLessonCount: lessonPublished[0].n,
  };
}

export async function getAdminCourseBySlug(slug: string) {
  const course = await db.query.courses.findFirst({
    where: eq(courses.slug, slug),
    with: {
      baseLanguage: true,
      targetLanguage: true,
      units: {
        orderBy: asc(units.position),
      },
    },
  });
  return course ?? null;
}

export async function getAdminUnitBySlugs(
  courseSlug: string,
  unitSlug: string,
) {
  const course = await db.query.courses.findFirst({
    where: eq(courses.slug, courseSlug),
    with: {
      units: {
        where: eq(units.slug, unitSlug),
        with: {
          lessons: {
            orderBy: asc(lessons.position),
          },
        },
      },
    },
  });
  const unit = course?.units[0];
  if (!course || !unit) return null;
  return { course, unit };
}

export async function getAdminLessonBySlugs(
  courseSlug: string,
  unitSlug: string,
  lessonSlug: string,
) {
  const course = await db.query.courses.findFirst({
    where: eq(courses.slug, courseSlug),
    with: {
      units: {
        where: eq(units.slug, unitSlug),
        with: {
          lessons: {
            where: eq(lessons.slug, lessonSlug),
            with: {
              audioVersions: {
                orderBy: desc(lessonAudioVersions.createdAt),
              },
            },
          },
        },
      },
    },
  });
  const unit = course?.units[0];
  const lesson = unit?.lessons[0];
  if (!course || !unit || !lesson) return null;
  return { course, unit, lesson };
}

export async function createCourse(input: CreateCourseInput) {
  const [base, target] = await Promise.all([
    db.query.languages.findFirst({
      where: eq(languages.id, input.baseLanguageId),
      columns: { id: true },
    }),
    db.query.languages.findFirst({
      where: eq(languages.id, input.targetLanguageId),
      columns: { id: true },
    }),
  ]);
  if (!base) {
    throw new NotFoundError("Base language not found");
  }
  if (!target) {
    throw new NotFoundError("Target language not found");
  }

  const existing = await db.query.courses.findFirst({
    where: eq(courses.slug, input.slug),
    columns: { id: true },
  });
  if (existing) {
    throw new ConflictError(`A course with slug "${input.slug}" already exists`);
  }

  const [course] = await db
    .insert(courses)
    .values({
      baseLanguageId: input.baseLanguageId,
      targetLanguageId: input.targetLanguageId,
      slug: input.slug,
      title: input.title,
      description: input.description,
      isFree: input.isFree,
    })
    .returning();

  return course;
}

export async function updateCourse(
  id: string,
  input: Omit<UpdateCourseInput, "id">,
) {
  const [updated] = await db
    .update(courses)
    .set({
      title: input.title,
      description: input.description ?? null,
      isPublished: input.isPublished,
      isFree: input.isFree,
    })
    .where(eq(courses.id, id))
    .returning();
  if (!updated) {
    throw new NotFoundError(`Course ${id} not found`);
  }
  return updated;
}

export async function createUnit(input: CreateUnitInput) {
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, input.courseId),
    columns: { id: true },
  });
  if (!course) {
    throw new NotFoundError("Course not found");
  }

  const existing = await db.query.units.findFirst({
    where: and(
      eq(units.courseId, input.courseId),
      eq(units.slug, input.slug),
    ),
    columns: { id: true },
  });
  if (existing) {
    throw new ConflictError(
      `A unit with slug "${input.slug}" already exists in this course`,
    );
  }

  const [{ maxPos }] = await db
    .select({ maxPos: max(units.position) })
    .from(units)
    .where(eq(units.courseId, input.courseId));
  const position = (maxPos ?? -1) + 1;

  const [unit] = await db
    .insert(units)
    .values({
      courseId: input.courseId,
      slug: input.slug,
      title: input.title,
      description: input.description,
      position,
      isFree: input.isFree,
    })
    .returning();
  return unit;
}

export async function createLesson(input: CreateLessonInput) {
  const unit = await db.query.units.findFirst({
    where: eq(units.id, input.unitId),
    columns: { id: true },
  });
  if (!unit) {
    throw new NotFoundError("Unit not found");
  }

  const existing = await db.query.lessons.findFirst({
    where: and(
      eq(lessons.unitId, input.unitId),
      eq(lessons.slug, input.slug),
    ),
    columns: { id: true },
  });
  if (existing) {
    throw new ConflictError(
      `A lesson with slug "${input.slug}" already exists in this unit`,
    );
  }

  const [{ maxPos }] = await db
    .select({ maxPos: max(lessons.position) })
    .from(lessons)
    .where(eq(lessons.unitId, input.unitId));
  const position = (maxPos ?? -1) + 1;

  const [lesson] = await db
    .insert(lessons)
    .values({
      unitId: input.unitId,
      slug: input.slug,
      title: input.title,
      description: input.description,
      position,
    })
    .returning();
  return lesson;
}

export async function updateUnit(
  id: string,
  input: Omit<UpdateUnitInput, "id">,
) {
  const [updated] = await db
    .update(units)
    .set({
      title: input.title,
      description: input.description ?? null,
      position: input.position,
      isPublished: input.isPublished,
      isFree: input.isFree,
    })
    .where(eq(units.id, id))
    .returning();
  if (!updated) {
    throw new NotFoundError(`Unit ${id} not found`);
  }
  return updated;
}
