import "server-only";
import * as Sentry from "@sentry/nextjs";
import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { AUDIO_BUCKET } from "../audio.shared";
import {
  getAdminCourseBySlug as getAdminCourseBySlugRow,
  getAdminCourseStats as getAdminCourseStatsRow,
  getAdminLessonBySlugs as getAdminLessonBySlugsRow,
  getAdminPackBySlugs as getAdminPackBySlugsRow,
  listAdminCourses as listAdminCoursesRows,
  listAdminCoursesWithEnrollments as listAdminCoursesWithEnrollmentsRows,
  listRecentAdminCourses as listRecentAdminCoursesRows,
} from "../course.service";

// Admin-scoped course reads. Every export guards with `requireAdmin()` before
// touching the service, so callers (Server Components under app/admin/**)
// can't accidentally skip the check.

const SIGNED_URL_TTL_SECONDS = 60 * 10; // 10 minutes

export async function listAdminCourses() {
  await requireAdmin();
  return listAdminCoursesRows();
}

export async function listAdminCoursesWithEnrollments() {
  await requireAdmin();
  return listAdminCoursesWithEnrollmentsRows();
}

export async function listRecentAdminCourses(limit = 5) {
  await requireAdmin();
  return listRecentAdminCoursesRows(limit);
}

export async function getAdminCourseStats() {
  await requireAdmin();
  return getAdminCourseStatsRow();
}

export async function getAdminCourseBySlug(slug: string) {
  await requireAdmin();
  return getAdminCourseBySlugRow(slug);
}

export async function getAdminPackBySlugs(
  courseSlug: string,
  packSlug: string,
) {
  await requireAdmin();
  return getAdminPackBySlugsRow(courseSlug, packSlug);
}

// Returns the lesson plus each audio version enriched with a short-lived
// signed URL the browser can stream from. Signed URLs are minted by the
// service-role client, so we never expose the bucket or force RLS on the
// browser client.
export async function getAdminLessonBySlugs(
  courseSlug: string,
  packSlug: string,
  lessonSlug: string,
) {
  await requireAdmin();
  const row = await getAdminLessonBySlugsRow(
    courseSlug,
    packSlug,
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
    // One aggregated event so a Storage outage doesn't flood Sentry with
    // per-version captures. Rows still render with a "Playback unavailable"
    // notice in the table.
    Sentry.captureMessage("Failed to sign audio playback URLs", {
      level: "error",
      extra: {
        query: "getAdminLessonBySlugs",
        lessonId: row.lesson.id,
        failures,
      },
    });
  }

  return {
    course: row.course,
    pack: row.pack,
    lesson: {
      ...row.lesson,
      audioVersions: versionsWithUrls,
    },
  };
}
