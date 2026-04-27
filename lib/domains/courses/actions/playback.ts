"use server";

import { and, asc, desc, eq, inArray, isNull } from "drizzle-orm";
import * as Sentry from "@sentry/nextjs";
import { requireUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  courses,
  lessonAudioVersions,
  lessons,
  units,
  userCourses,
} from "@/supabase/schema";
import { AUDIO_BUCKET } from "../audio.shared";
import { getProgressForUserCourse } from "../progress.service";

const SIGNED_URL_TTL_SECONDS = 60 * 60 * 2;

export type PlaybackAudioVersion = {
  id: string;
  label: string;
  audioDurationSeconds: number | null;
  isCurrent: boolean;
  signedUrl: string | null;
};

export type PlaybackLesson = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  audioVersions: PlaybackAudioVersion[];
  lastPositionSeconds: number;
  lastAudioVersionId: string | null;
  completedAt: string | null;
};

export type PlaybackUnit = {
  id: string;
  slug: string;
  title: string;
  lessons: PlaybackLesson[];
};

export type PlaybackPayload = {
  course: { id: string; slug: string };
  unit: PlaybackUnit;
};

export type PlaybackResult =
  | { ok: true; data: PlaybackPayload }
  | { ok: false; error: string };

export async function getUnitForPlayback(
  courseSlug: string,
  unitSlug: string,
): Promise<PlaybackResult> {
  const user = await requireUser();

  const course = await db.query.courses.findFirst({
    where: eq(courses.slug, courseSlug),
    with: {
      units: {
        where: and(eq(units.slug, unitSlug), eq(units.isPublished, true)),
        with: {
          lessons: {
            where: eq(lessons.isPublished, true),
            orderBy: asc(lessons.position),
          },
        },
      },
    },
  });
  const unit = course?.units[0];
  if (!course || !unit) {
    return { ok: false, error: "Unit not found" };
  }

  const enrollment = await db.query.userCourses.findFirst({
    where: and(
      eq(userCourses.userId, user.id),
      eq(userCourses.courseId, course.id),
    ),
    columns: { courseId: true },
  });
  if (!enrollment) {
    return { ok: false, error: "Not enrolled" };
  }

  const lessonIds = unit.lessons.map((l) => l.id);
  const versions = lessonIds.length
    ? await db.query.lessonAudioVersions.findMany({
        where: and(
          inArray(lessonAudioVersions.lessonId, lessonIds),
          isNull(lessonAudioVersions.disabledAt),
        ),
        orderBy: desc(lessonAudioVersions.createdAt),
      })
    : [];

  const admin = createAdminClient();
  const failures: { audioPath: string; message: string }[] = [];
  const signedByVersionId = new Map<string, string | null>();
  await Promise.all(
    versions.map(async (v) => {
      const { data, error } = await admin.storage
        .from(AUDIO_BUCKET)
        .createSignedUrl(v.audioPath, SIGNED_URL_TTL_SECONDS);
      if (error) {
        failures.push({ audioPath: v.audioPath, message: error.message });
        signedByVersionId.set(v.id, null);
      } else {
        signedByVersionId.set(v.id, data?.signedUrl ?? null);
      }
    }),
  );
  if (failures.length > 0) {
    Sentry.captureMessage("Failed to sign audio playback URLs", {
      level: "error",
      extra: {
        query: "getUnitForPlayback",
        userId: user.id,
        unitId: unit.id,
        failures,
      },
    });
  }

  const versionsByLesson = new Map<string, typeof versions>();
  for (const v of versions) {
    const list = versionsByLesson.get(v.lessonId);
    if (list) list.push(v);
    else versionsByLesson.set(v.lessonId, [v]);
  }

  const progressByLesson = await getProgressForUserCourse(user.id, course.id);

  const playbackLessons: PlaybackLesson[] = unit.lessons.map((l) => {
    const p = progressByLesson.get(l.id);
    return {
      id: l.id,
      slug: l.slug,
      title: l.title,
      description: l.description,
      audioVersions: (versionsByLesson.get(l.id) ?? []).map((v) => ({
        id: v.id,
        label: v.label,
        audioDurationSeconds: v.audioDurationSeconds,
        isCurrent: v.isCurrent,
        signedUrl: signedByVersionId.get(v.id) ?? null,
      })),
      lastPositionSeconds: p?.lastPositionSeconds ?? 0,
      lastAudioVersionId: p?.lastAudioVersionId ?? null,
      completedAt: p?.completedAt ? p.completedAt.toISOString() : null,
    };
  });

  return {
    ok: true,
    data: {
      course: { id: course.id, slug: course.slug },
      unit: {
        id: unit.id,
        slug: unit.slug,
        title: unit.title,
        lessons: playbackLessons,
      },
    },
  };
}
