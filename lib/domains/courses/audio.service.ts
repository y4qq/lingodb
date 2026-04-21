import "server-only";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { ConflictError, NotFoundError, ValidationError } from "@/lib/errors";
import { lessonAudioVersions, lessons } from "@/supabase/schema";
import type { RegisterAudioVersionInput } from "./audio.validation";

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
        disabledAt: new Date(),
        isCurrent: false,
      })
      .where(eq(lessonAudioVersions.id, versionId))
      .returning();

    return row;
  });
}

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
