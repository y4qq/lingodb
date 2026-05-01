"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  runUserAction,
  runUserTask,
  type ActionResult,
  zodErrorToFieldErrors,
} from "@/lib/auth/actions";
import { ValidationError } from "@/lib/errors";
import * as usersService from "../service";

const courseIdSchema = z.object({ courseId: z.uuid() });
const courseIdStringSchema = z.uuid();

const displayNameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Please enter a name.")
    .max(60, "60 characters max."),
});

export async function enrollInCourse(
  _prev: ActionResult<{ courseSlug: string }> | undefined,
  formData: FormData,
): Promise<ActionResult<{ courseSlug: string }>> {
  const parsed = courseIdSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, fieldErrors: zodErrorToFieldErrors(parsed.error) };
  }
  return runUserAction({
    actionName: "enrollInCourse",
    extra: { input: parsed.data },
    execute: async (userId) => {
      const { courseSlug } = await usersService.enrollUserInCourse(
        userId,
        parsed.data.courseId,
        { setActive: true },
      );
      return { courseSlug };
    },
    onSuccess: () => revalidatePath("/", "layout"),
  });
}

export async function setActiveCourseForMe(courseId: string): Promise<void> {
  const parsed = courseIdStringSchema.safeParse(courseId);
  if (!parsed.success) {
    throw new ValidationError("Invalid course id");
  }
  await runUserTask({
    actionName: "setActiveCourseForMe",
    extra: { input: { courseId: parsed.data } },
    execute: (userId) => usersService.setActiveCourse(userId, parsed.data),
  });
}

export async function completeOnboarding(
  _prev: ActionResult<{ displayName: string }> | undefined,
  formData: FormData,
): Promise<ActionResult<{ displayName: string }>> {
  const parsed = displayNameSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, fieldErrors: zodErrorToFieldErrors(parsed.error) };
  }
  return runUserAction({
    actionName: "completeOnboarding",
    extra: { input: parsed.data },
    execute: async (userId) => {
      await usersService.setDisplayName(userId, parsed.data.name);
      await usersService.markOnboardingComplete(userId);
      return { displayName: parsed.data.name };
    },
    onSuccess: () => revalidatePath("/", "layout"),
  });
}
