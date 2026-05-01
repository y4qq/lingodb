"use server";

import * as Sentry from "@sentry/nextjs";
import { revalidatePath } from "next/cache";
import {
  type ActionResult,
  zodErrorToFieldErrors,
} from "@/lib/auth/actions";
import { requireAdmin } from "@/lib/auth/guards";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import * as commentService from "../comment.service";
import { moderateCommentSchema } from "../comment.validation";

const GENERIC_ERROR_MESSAGE = "Something went wrong. Please try again.";

export async function approveComment(
  _prev: ActionResult<{ id: string }> | undefined,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  return moderate(formData, "approved", "approveComment");
}

export async function rejectComment(
  _prev: ActionResult<{ id: string }> | undefined,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  return moderate(formData, "rejected", "rejectComment");
}

export async function resetCommentModeration(
  _prev: ActionResult<{ id: string }> | undefined,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  return moderate(formData, "pending", "resetCommentModeration");
}

async function moderate(
  formData: FormData,
  status: "approved" | "rejected" | "pending",
  actionName: string,
): Promise<ActionResult<{ id: string }>> {
  const parsed = moderateCommentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, fieldErrors: zodErrorToFieldErrors(parsed.error) };
  }

  return runAdminAction({
    actionName,
    extra: { commentId: parsed.data.commentId, status },
    execute: async (moderatorId) => {
      const row = await commentService.setCommentModerationStatus({
        commentId: parsed.data.commentId,
        status,
        moderatorId,
      });
      return { id: row.id };
    },
    // Moderation changes public visibility, so also bump the course/unit
    // pages. Dynamic-path syntax avoids having to look up the target slug.
    onSuccess: () => {
      revalidatePath("/admin/comments", "page");
      revalidatePath("/courses/[slug]", "page");
      revalidatePath("/courses/[slug]/[unitSlug]", "page");
    },
  });
}

type DomainError = ConflictError | NotFoundError | ValidationError;

async function runAdminAction<T>({
  actionName,
  execute,
  onSuccess,
  genericMessage = GENERIC_ERROR_MESSAGE,
  extra = {},
}: {
  actionName: string;
  execute: (moderatorId: string) => Promise<T>;
  onSuccess?: (data: T) => void | Promise<void>;
  genericMessage?: string;
  extra?: Record<string, unknown>;
}): Promise<ActionResult<T>> {
  const { user } = await requireAdmin();
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
