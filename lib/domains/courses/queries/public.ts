import "server-only";
import { requireUser } from "@/lib/auth/guards";
import {
  getCourseForUser as getCourseForUserRow,
  getPackForUser as getPackForUserRow,
  listAvailableCoursesForUser as listAvailableCoursesForUserRows,
} from "../course.service";

// Anonymous-safe reads. Every function here filters `isPublished = true` at
// every ancestor level inside the service, so no auth guard is needed —
// drafts are never returned.
//
// Consumed by app/courses/**.

export {
  getPublishedCourseBySlug,
  getPublishedPackBySlugs,
  listPublishedCourses,
} from "../course.service";

// User-scoped reads: require an authenticated user. A course a user is
// enrolled in is accessible even if it later becomes unpublished.

export async function listAvailableCoursesForMe() {
  const user = await requireUser();
  return listAvailableCoursesForUserRows(user.id);
}

export async function getMyCourseBySlug(slug: string) {
  const user = await requireUser();
  return getCourseForUserRow(user.id, slug);
}

export async function getMyPackBySlugs(courseSlug: string, packSlug: string) {
  const user = await requireUser();
  return getPackForUserRow(user.id, courseSlug, packSlug);
}
