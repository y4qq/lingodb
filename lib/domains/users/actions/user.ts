"use server";

import * as Sentry from "@sentry/nextjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/guards";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import * as usersService from "../service";

const GENERIC_ERROR_MESSAGE = "Something went wrong. Please try again.";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error?: string; fieldErrors?: Record<string, string[]> };

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
    return { ok: false, fieldErrors: toFieldErrors(parsed.error) };
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
    return { ok: false, fieldErrors: toFieldErrors(parsed.error) };
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

type DomainError = ConflictError | NotFoundError | ValidationError;

async function runUserAction<T>({
  actionName,
  execute,
  onSuccess,
  genericMessage = GENERIC_ERROR_MESSAGE,
  extra = {},
}: {
  actionName: string;
  execute: (userId: string) => Promise<T>;
  onSuccess?: (data: T) => void | Promise<void>;
  genericMessage?: string;
  extra?: Record<string, unknown>;
}): Promise<ActionResult<T>> {
  const user = await requireUser();
  Sentry.setUser({ id: user.id, email: user.email ?? undefined });

  try {
    const data = await execute(user.id);
    await onSuccess?.(data);
    return { ok: true, data };
  } catch (err) {
    if (isNextControlFlowError(err)) throw err;
    if (isDomainError(err)) {
      return { ok: false, error: err.message };
    }
    Sentry.captureException(err, {
      extra: { action: actionName, ...extra },
    });
    return { ok: false, error: genericMessage };
  }
}

async function runUserTask(opts: {
  actionName: string;
  execute: (userId: string) => Promise<void>;
  extra?: Record<string, unknown>;
}): Promise<void> {
  const user = await requireUser();
  Sentry.setUser({ id: user.id, email: user.email ?? undefined });
  try {
    await opts.execute(user.id);
  } catch (err) {
    if (isNextControlFlowError(err)) throw err;
    if (!isDomainError(err)) {
      Sentry.captureException(err, {
        extra: { action: opts.actionName, ...opts.extra },
      });
    }
    throw err;
  }
}

function isDomainError(err: unknown): err is DomainError {
  return (
    err instanceof ConflictError ||
    err instanceof NotFoundError ||
    err instanceof ValidationError
  );
}

function isNextControlFlowError(err: unknown): boolean {
  if (err === null || typeof err !== "object") return false;
  const digest = (err as { digest?: unknown }).digest;
  return (
    typeof digest === "string" &&
    (digest.startsWith("NEXT_REDIRECT") || digest === "NEXT_NOT_FOUND")
  );
}

function toFieldErrors(error: z.ZodError): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(error.flatten().fieldErrors).filter(
      (entry): entry is [string, string[]] => entry[1] !== undefined,
    ),
  );
}
