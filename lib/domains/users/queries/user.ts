import "server-only";
import { requireUser } from "@/lib/auth/guards";
import {
  assertCanAccessCourse as assertCanAccessCourseRow,
  getUserWithActiveCourse as getUserWithActiveCourseRow,
  listUserEnrollments as listUserEnrollmentsRows,
  resolveLandingForUser as resolveLandingForUserRow,
} from "../service";

export async function listMyEnrollments() {
  const user = await requireUser();
  return listUserEnrollmentsRows(user.id);
}

export async function getMyProfileWithActiveCourse() {
  const user = await requireUser();
  return getUserWithActiveCourseRow(user.id);
}

export async function getMyLandingDecision() {
  const user = await requireUser();
  return resolveLandingForUserRow(user.id);
}

export async function assertCanAccessMyCourse(slug: string) {
  const user = await requireUser();
  return assertCanAccessCourseRow(user.id, slug);
}
