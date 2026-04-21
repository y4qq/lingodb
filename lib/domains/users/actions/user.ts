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

export async function setActiveCourse(
  _prev: ActionResult<{ courseId: string }> | undefined,
  formData: FormData,
): Promise<ActionResult<{ courseId: string }>> {
  const parsed = courseIdSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, fieldErrors: toFieldErrors(parsed.error) };
  }
  return runUserAction({
    actionName: "setActiveCourse",
    extra: { input: parsed.data },
    execute: async (userId) => {
      await usersService.setActiveCourse(userId, parsed.data.courseId);
      return { courseId: parsed.data.courseId };
    },
    onSuccess: () => revalidatePath("/", "layout"),
  });
}

// Non-form action for server components. The requireUser guard + service-side
// enrollment check make this safe to expose as an RPC.
export async function setActiveCourseForMe(courseId: string): Promise<void> {
  const user = await requireUser();
  await usersService.setActiveCourse(user.id, courseId);
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
