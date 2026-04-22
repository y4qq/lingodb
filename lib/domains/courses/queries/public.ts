import "server-only";
import * as Sentry from "@sentry/nextjs";
import { requireUser } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { AUDIO_BUCKET } from "../audio.shared";
import {
  getCourseForUser as getCourseForUserRow,
  getLessonForUser as getLessonForUserRow,
  getUnitForUser as getUnitForUserRow,
  listAvailableCoursesForUser as listAvailableCoursesForUserRows,
} from "../course.service";

export {
  getPublishedCourseBySlug,
  getPublishedUnitBySlugs,
  listPublishedCourses,
} from "../course.service";

const SIGNED_URL_TTL_SECONDS = 60 * 10; // 10 minutes

export async function listAvailableCoursesForMe() {
  const user = await requireUser();
  return listAvailableCoursesForUserRows(user.id);
}

export async function getMyCourseBySlug(slug: string) {
  const user = await requireUser();
  return getCourseForUserRow(user.id, slug);
}

export async function getMyUnitBySlugs(courseSlug: string, unitSlug: string) {
  const user = await requireUser();
  return getUnitForUserRow(user.id, courseSlug, unitSlug);
}

export async function getMyLessonBySlugs(
  courseSlug: string,
  unitSlug: string,
  lessonSlug: string,
) {
  const user = await requireUser();
  const row = await getLessonForUserRow(
    user.id,
    courseSlug,
    unitSlug,
    lessonSlug,
  );
  if (!row) return null;

  const admin = createAdminClient();
  const failures: { audioPath: string; message: string }[] = [];
  const versionsWithUrls = await Promise.all(
    row.lesson.audioVersions.map(async (v) => {
      const { data, error } = await admin.storage
        .from(AUDIO_BUCKET)
        .createSignedUrl(v.audioPath, SIGNED_URL_TTL_SECONDS);
      if (error) {
        failures.push({ audioPath: v.audioPath, message: error.message });
      }
      return {
        ...v,
        signedUrl: error ? null : (data?.signedUrl ?? null),
      };
    }),
  );
  if (failures.length > 0) {
    Sentry.captureMessage("Failed to sign audio playback URLs", {
      level: "error",
      extra: {
        query: "getMyLessonBySlugs",
        userId: user.id,
        lessonId: row.lesson.id,
        failures,
      },
    });
  }

  return {
    course: row.course,
    unit: row.unit,
    lesson: {
      ...row.lesson,
      audioVersions: versionsWithUrls,
    },
  };
}
