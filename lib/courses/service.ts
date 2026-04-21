import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { courses, lessons, packs } from "@/supabase/schema";

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
