import "server-only";
import { and, eq, ne, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { ConflictError, NotFoundError, ValidationError } from "@/lib/errors";
import { lessonAudioVersions, lessons } from "@/supabase/schema";
import type { RegisterAudioVersionInput } from "./audio.validation";

// This file is PRIVATE to the courses domain. Pages and components MUST NOT
// import from here — consume lib/domains/courses/queries/* (reads) or
// lib/domains/courses/actions/* (mutations). The ESLint rule enforces this;
// see eslint.config.mjs.
//
// Services do no auth and no Zod parsing. They take already-validated,
// already-authorized inputs and perform data access. The wrapper layer
// (queries/, actions/, or a route.ts controller) owns the auth+validation
// boundary.

// All writes here assume the caller has already:
//   1. Verified admin access (via requireAdmin in actions/admin.ts).
//   2. Uploaded the file to the `lesson-audio` Storage bucket at audioPath.

// Inserts an audio version row for an already-uploaded file. Never pinned
// current on creation — the admin must explicitly promote it.
//
// Throws:
//   - NotFoundError if the lesson doesn't exist.
//   - ConflictError if the (lesson, label) pair already exists.
export async function insertAudioVersion(input: RegisterAudioVersionInput) {
  const lesson = await db.query.lessons.findFirst({
    where: eq(lessons.id, input.lessonId),
    columns: { id: true },
  });
  if (!lesson) {
    throw new NotFoundError("Lesson not found");
  }

  const duplicate = await db.query.lessonAudioVersions.findFirst({
    where: and(
      eq(lessonAudioVersions.lessonId, input.lessonId),
      eq(lessonAudioVersions.label, input.label),
    ),
    columns: { id: true },
  });
  if (duplicate) {
    throw new ConflictError(
      `An audio version with label "${input.label}" already exists for this lesson`,
    );
  }

  const [row] = await db
    .insert(lessonAudioVersions)
    .values({
      lessonId: input.lessonId,
      label: input.label,
      audioPath: input.audioPath,
      audioDurationSeconds: input.audioDurationSeconds,
    })
    .returning();

  return row;
}

// Pins a version as current for its lesson. Clears `is_current` on any other
// versions of the same lesson in the same transaction so the partial unique
// index never trips.
//
// Throws:
//   - NotFoundError if the version doesn't exist.
//   - ValidationError if the target version is disabled.
//   - ConflictError if a concurrent writer pinned a sibling first (the
//     partial unique index catches the race; we translate the SQLSTATE so
//     admins get a clean message instead of "Something went wrong").
export async function setCurrentAudioVersion(versionId: string) {
  try {
    return await db.transaction(async (tx) => {
      const target = await tx.query.lessonAudioVersions.findFirst({
        where: eq(lessonAudioVersions.id, versionId),
        columns: { id: true, lessonId: true, disabledAt: true },
      });
      if (!target) {
        throw new NotFoundError("Audio version not found");
      }
      if (target.disabledAt) {
        throw new ValidationError(
          "Cannot set a disabled version as current. Enable it first.",
        );
      }

      await tx
        .update(lessonAudioVersions)
        .set({ isCurrent: false })
        .where(
          and(
            eq(lessonAudioVersions.lessonId, target.lessonId),
            ne(lessonAudioVersions.id, target.id),
          ),
        );

      const [row] = await tx
        .update(lessonAudioVersions)
        .set({ isCurrent: true })
        .where(eq(lessonAudioVersions.id, target.id))
        .returning();

      return row;
    });
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new ConflictError(
        "Another admin just pinned a different version. Refresh and try again.",
      );
    }
    throw err;
  }
}

// Soft-disables a version. If it was current, also clears `is_current` so the
// lesson ends up with no pinned version (admin must re-pin another).
//
// Throws NotFoundError if the version doesn't exist.
export async function disableAudioVersion(versionId: string) {
  return db.transaction(async (tx) => {
    const target = await tx.query.lessonAudioVersions.findFirst({
      where: eq(lessonAudioVersions.id, versionId),
      columns: { id: true, isCurrent: true, disabledAt: true },
    });
    if (!target) {
      throw new NotFoundError("Audio version not found");
    }
    if (target.disabledAt) return target;

    const [row] = await tx
      .update(lessonAudioVersions)
      .set({
        disabledAt: sql`now()`,
        isCurrent: false,
      })
      .where(eq(lessonAudioVersions.id, versionId))
      .returning();

    return row;
  });
}

// Re-enables a previously disabled version. Does NOT auto-pin as current —
// admin must explicitly promote it.
//
// Throws NotFoundError if the version doesn't exist.
export async function enableAudioVersion(versionId: string) {
  const existing = await db.query.lessonAudioVersions.findFirst({
    where: eq(lessonAudioVersions.id, versionId),
    columns: { id: true },
  });
  if (!existing) {
    throw new NotFoundError("Audio version not found");
  }

  const [row] = await db
    .update(lessonAudioVersions)
    .set({ disabledAt: null })
    .where(eq(lessonAudioVersions.id, versionId))
    .returning();

  return row;
}

function isUniqueViolation(err: unknown): boolean {
  return (
    err !== null &&
    typeof err === "object" &&
    "code" in err &&
    (err as { code?: string }).code === "23505"
  );
}
