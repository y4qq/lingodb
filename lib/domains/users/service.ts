import "server-only";
import { and, count, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { courses, userCourses, users } from "@/supabase/schema";

// Upserts the public.users row for an authenticated identity. Covers signup,
// invite, recovery, and email_change verification paths with a single call:
// inserts if missing, updates email if present (so an auth-side email change
// doesn't leave a stale mirror).
//
// Takes a plain {id, email} rather than a Supabase User object so the service
// has no dependency on @supabase/supabase-js — callable from any auth-success
// path (confirm route, future OAuth callback, admin backfill, tests).
export async function ensureProfile(input: { id: string; email: string }) {
  await db
    .insert(users)
    .values(input)
    .onConflictDoUpdate({
      target: users.id,
      set: { email: input.email },
    });
}

export async function listUserEnrollments(userId: string) {
  return db.query.userCourses.findMany({
    where: eq(userCourses.userId, userId),
    with: { course: true },
    orderBy: desc(userCourses.enrolledAt),
  });
}

export async function getUserWithActiveCourse(userId: string) {
  return db.query.users.findFirst({
    where: eq(users.id, userId),
    with: { activeCourse: true },
  });
}

export async function enrollUserInCourse(
  userId: string,
  courseId: string,
  options: { setActive?: boolean } = {},
) {
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
    columns: { id: true, slug: true },
  });
  if (!course) {
    throw new NotFoundError("Course not found");
  }

  await db
    .insert(userCourses)
    .values({ userId, courseId })
    .onConflictDoNothing();

  // First-enroll auto-active: if the user has no activeCourseId yet, set it
  // regardless of the caller's `setActive` preference.
  const profile = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { activeCourseId: true },
  });
  const shouldSetActive =
    options.setActive || profile?.activeCourseId == null;
  if (shouldSetActive) {
    await db
      .update(users)
      .set({ activeCourseId: courseId })
      .where(eq(users.id, userId));
  }

  return { courseId, courseSlug: course.slug };
}

export async function setActiveCourse(userId: string, courseId: string) {
  const enrollment = await db.query.userCourses.findFirst({
    where: and(
      eq(userCourses.userId, userId),
      eq(userCourses.courseId, courseId),
    ),
    columns: { courseId: true },
  });
  if (!enrollment) {
    throw new ValidationError(
      "You must be enrolled in a course to activate it",
    );
  }

  await db
    .update(users)
    .set({ activeCourseId: courseId })
    .where(eq(users.id, userId));
}

export type LandingDecision =
  | { kind: "active"; slug: string }
  | { kind: "adoptFirst"; courseId: string; slug: string }
  | { kind: "welcome" };

export async function resolveLandingForUser(
  userId: string,
): Promise<LandingDecision> {
  const profile = await getUserWithActiveCourse(userId);
  if (profile?.activeCourse) {
    return { kind: "active", slug: profile.activeCourse.slug };
  }
  const enrollments = await listUserEnrollments(userId);
  if (enrollments.length > 0) {
    const first = enrollments[0];
    return {
      kind: "adoptFirst",
      courseId: first.courseId,
      slug: first.course.slug,
    };
  }
  return { kind: "welcome" };
}

export async function assertCanAccessCourse(
  userId: string,
  slug: string,
): Promise<{ courseId: string } | null> {
  const course = await db.query.courses.findFirst({
    where: eq(courses.slug, slug),
    columns: { id: true },
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
  return { courseId: course.id };
}

export async function listEnrollmentCountsByCourse(): Promise<
  Map<string, number>
> {
  const rows = await db
    .select({ courseId: userCourses.courseId, n: count() })
    .from(userCourses)
    .groupBy(userCourses.courseId);
  return new Map(rows.map((r) => [r.courseId, r.n]));
}
