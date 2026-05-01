import "server-only";
import * as Sentry from "@sentry/nextjs";
import type { ZodError } from "zod";
import { requireUser } from "@/lib/auth/guards";
import {
  AppError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";

const GENERIC_ERROR_MESSAGE = "Something went wrong. Please try again.";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error?: string; fieldErrors?: Record<string, string[]> };

export function zodErrorToFieldErrors(
  error: ZodError,
): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(error.flatten().fieldErrors).filter(
      (entry): entry is [string, string[]] => entry[1] !== undefined,
    ),
  );
}

type DomainError = ConflictError | NotFoundError | ValidationError;

export const userActionRuntime = {
  requireUser,
  setSentryUser: Sentry.setUser,
  captureException: Sentry.captureException,
};

export async function runUserAction<T>({
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
  const user = await userActionRuntime.requireUser();
  userActionRuntime.setSentryUser({
    id: user.id,
    email: user.email ?? undefined,
  });

  try {
    const data = await execute(user.id);
    await onSuccess?.(data);
    return { ok: true, data };
  } catch (err) {
    if (isNextControlFlowError(err)) throw err;
    if (isDomainError(err)) {
      return { ok: false, error: err.message };
    }
    userActionRuntime.captureException(err, {
      extra: { action: actionName, ...extra },
    });
    return { ok: false, error: genericMessage };
  }
}

export async function runUserTask(opts: {
  actionName: string;
  execute: (userId: string) => Promise<void>;
  extra?: Record<string, unknown>;
}): Promise<void> {
  const user = await userActionRuntime.requireUser();
  userActionRuntime.setSentryUser({
    id: user.id,
    email: user.email ?? undefined,
  });
  try {
    await opts.execute(user.id);
  } catch (err) {
    if (isNextControlFlowError(err)) throw err;
    if (!isDomainError(err)) {
      userActionRuntime.captureException(err, {
        extra: { action: opts.actionName, ...opts.extra },
      });
    }
    throw err;
  }
}

export function isDomainError(err: unknown): err is DomainError {
  return err instanceof AppError;
}

export function isNextControlFlowError(err: unknown): boolean {
  if (err === null || typeof err !== "object") return false;
  const digest = (err as { digest?: unknown }).digest;
  return (
    typeof digest === "string" &&
    (digest.startsWith("NEXT_REDIRECT") || digest === "NEXT_NOT_FOUND")
  );
}
