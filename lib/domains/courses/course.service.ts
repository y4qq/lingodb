import "server-only";
import { and, asc, count, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { ConflictError, NotFoundError } from "@/lib/errors";
import {
  courses,
  languages,
  lessonAudioVersions,
  lessons,
  packs,
} from "@/supabase/schema";
import type { CreateCourseInput } from "./course.validation";

// This file is PRIVATE to the courses domain. Pages and components MUST NOT
// import from here — consume lib/domains/courses/queries/* (reads) or
// lib/domains/courses/actions/* (mutations). The ESLint rule enforces this;
// see eslint.config.mjs.
//
// Services do no auth and no Zod parsing. They take already-validated,
// already-authorized inputs and perform data access. The wrapper layer
// (queries/, actions/, or a route.ts controller) owns the auth+validation
// boundary.

// ---------------------------------------------------------------------------
// Reads (public-visible subset)
// ---------------------------------------------------------------------------
// Every public read filters `isPublished = true` at every ancestor level.
// Drizzle connects as `postgres` and bypasses RLS, so visibility is enforced
// here — these rules match what anon/authenticated callers would see if we
// ever expose tables via the public PostgREST API.

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
      packs: {
        where: eq(packs.isPublished, true),
        orderBy: asc(packs.position),
      },
    },
  });
  return course ?? null;
}

export async function getPublishedPackBySlugs(
  courseSlug: string,
  packSlug: string,
) {
  const course = await db.query.courses.findFirst({
    where: and(eq(courses.slug, courseSlug), eq(courses.isPublished, true)),
    with: {
      packs: {
        where: and(eq(packs.slug, packSlug), eq(packs.isPublished, true)),
        with: {
          lessons: {
            where: eq(lessons.isPublished, true),
            orderBy: asc(lessons.position),
          },
        },
      },
    },
  });
  const pack = course?.packs[0];
  if (!course || !pack) return null;
  return { course, pack };
}

// ---------------------------------------------------------------------------
// Reads (admin-visible, includes drafts)
// ---------------------------------------------------------------------------
// The admin guard lives in queries/admin.ts.

export async function listAdminCourses() {
  return db.query.courses.findMany({
    orderBy: asc(courses.title),
    with: {
      baseLanguage: true,
      targetLanguage: true,
    },
  });
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
  packCount: number;
  publishedPackCount: number;
  lessonCount: number;
  publishedLessonCount: number;
};

export async function getAdminCourseStats(): Promise<AdminCourseStats> {
  const [
    courseTotal,
    coursePublished,
    packTotal,
    packPublished,
    lessonTotal,
    lessonPublished,
  ] = await Promise.all([
    db.select({ n: count() }).from(courses),
    db
      .select({ n: count() })
      .from(courses)
      .where(eq(courses.isPublished, true)),
    db.select({ n: count() }).from(packs),
    db.select({ n: count() }).from(packs).where(eq(packs.isPublished, true)),
    db.select({ n: count() }).from(lessons),
    db
      .select({ n: count() })
      .from(lessons)
      .where(eq(lessons.isPublished, true)),
  ]);

  return {
    courseCount: courseTotal[0].n,
    publishedCourseCount: coursePublished[0].n,
    packCount: packTotal[0].n,
    publishedPackCount: packPublished[0].n,
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
      packs: {
        orderBy: asc(packs.position),
      },
    },
  });
  return course ?? null;
}

export async function getAdminPackBySlugs(
  courseSlug: string,
  packSlug: string,
) {
  const course = await db.query.courses.findFirst({
    where: eq(courses.slug, courseSlug),
    with: {
      packs: {
        where: eq(packs.slug, packSlug),
        with: {
          lessons: {
            orderBy: asc(lessons.position),
          },
        },
      },
    },
  });
  const pack = course?.packs[0];
  if (!course || !pack) return null;
  return { course, pack };
}

export async function getAdminLessonBySlugs(
  courseSlug: string,
  packSlug: string,
  lessonSlug: string,
) {
  const course = await db.query.courses.findFirst({
    where: eq(courses.slug, courseSlug),
    with: {
      packs: {
        where: eq(packs.slug, packSlug),
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
  const pack = course?.packs[0];
  const lesson = pack?.lessons[0];
  if (!course || !pack || !lesson) return null;
  return { course, pack, lesson };
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------
// Creates a new course. Starts in draft (is_published = false). The admin
// guard lives in actions/admin.ts.
//
// Throws:
//   - NotFoundError if either language id doesn't resolve.
//   - ConflictError if another course already uses the slug.
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
