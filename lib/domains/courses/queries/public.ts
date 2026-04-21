import "server-only";
import { requireUser } from "@/lib/auth/guards";
import {
  getCourseForUser as getCourseForUserRow,
  getPackForUser as getPackForUserRow,
  listAvailableCoursesForUser as listAvailableCoursesForUserRows,
} from "../course.service";

export {
  getPublishedCourseBySlug,
  getPublishedPackBySlugs,
  listPublishedCourses,
} from "../course.service";

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
