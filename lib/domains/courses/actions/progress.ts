"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { runUserTask } from "@/lib/auth/actions";
import { ValidationError } from "@/lib/errors";
import * as progressService from "../progress.service";

const positionSchema = z.object({
  lessonId: z.uuid(),
  audioVersionId: z.uuid(),
  positionSeconds: z.number().finite().min(0),
});

const completeSchema = z.object({
  lessonId: z.uuid(),
  audioVersionId: z.uuid(),
});

export async function saveLessonPosition(input: {
  lessonId: string;
  audioVersionId: string;
  positionSeconds: number;
}): Promise<void> {
  const parsed = positionSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError("Invalid lesson position");
  }
  await runUserTask({
    actionName: "saveLessonPosition",
    extra: { input: { lessonId: parsed.data.lessonId } },
    execute: (userId) =>
      progressService.upsertLessonPosition(userId, parsed.data),
  });
}

export async function markLessonCompleted(input: {
  lessonId: string;
  audioVersionId: string;
}): Promise<void> {
  const parsed = completeSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError("Invalid lesson reference");
  }
  await runUserTask({
    actionName: "markLessonCompleted",
    extra: { input: parsed.data },
    execute: (userId) =>
      progressService.markLessonCompleted(userId, parsed.data),
  });
  revalidatePath("/courses/[slug]", "page");
}
