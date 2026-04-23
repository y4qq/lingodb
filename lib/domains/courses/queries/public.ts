import "server-only";
import { requireUser } from "@/lib/auth/guards";
import {
  getCourseForUser as getCourseForUserRow,
  listAvailableCoursesForUser as listAvailableCoursesForUserRows,
} from "../course.service";

export {
  getPublishedCourseBySlug,
  getPublishedUnitBySlugs,
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
