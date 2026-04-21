import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { courses, languages, lessons, packs } from "@/supabase/schema";
import { ConflictError, NotFoundError } from "@/lib/errors";
import type { CreateCourseInput } from "./validators";

// -----------------------------------------------------------------------------
// Reads (public-visible subset)
// -----------------------------------------------------------------------------
// Every "public" read filters `isPublished = true` at every ancestor level.
// Drizzle connects as `postgres` and bypasses RLS, so visibility is enforced
// at the query layer — these rules match what anon/authenticated callers
// would see if we ever expose tables via the public PostgREST API.

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

// -----------------------------------------------------------------------------
// Admin reads (includes drafts)
// -----------------------------------------------------------------------------
// The service function itself enforces nothing — the caller (action or page)
// is responsible for the admin guard.

export async function listAllCourses() {
  return db.query.courses.findMany({
    orderBy: asc(courses.title),
    with: {
      baseLanguage: true,
      targetLanguage: true,
    },
  });
}

// -----------------------------------------------------------------------------
// Writes
// -----------------------------------------------------------------------------

// Creates a new course. Starts in draft (is_published = false). Admin-only
// at the caller; this function takes a validated input and enforces nothing
// about the actor.
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
    throw new NotFoundError(`Base language not found`);
  }
  if (!target) {
    throw new NotFoundError(`Target language not found`);
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
