"use server";

import { revalidatePath } from "next/cache";
import {
  runUserAction as sharedRunUserAction,
  type ActionResult,
  zodErrorToFieldErrors,
} from "@/lib/auth/actions";
import * as commentService from "../comment.service";
import {
  deleteCommentSchema,
  submitCourseCommentSchema,
  submitUnitCommentSchema,
  submitReplySchema,
  toggleReactionSchema,
  type ReactionValue,
} from "../comment.validation";

export const commentUserActionRuntime = {
  runUserAction: sharedRunUserAction,
};

export async function submitCourseComment(
  _prev: ActionResult<{ id: string }> | undefined,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const parsed = submitCourseCommentSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) {
    return { ok: false, fieldErrors: zodErrorToFieldErrors(parsed.error) };
  }

  return commentUserActionRuntime.runUserAction({
    actionName: "submitCourseComment",
    extra: { courseId: parsed.data.courseId },
    execute: async (userId) => {
      const row = await commentService.insertCourseComment({
        ...parsed.data,
        authorId: userId,
      });
      return { id: row.id };
    },
    // Dynamic path syntax revalidates every /courses/* page regardless of
    // slug — avoids an extra slug lookup and is bounded since only the
    // author's page gets re-rendered on their next visit anyway.
    onSuccess: () => revalidatePath("/courses/[slug]", "page"),
  });
}

export async function submitUnitComment(
  _prev: ActionResult<{ id: string }> | undefined,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const parsed = submitUnitCommentSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) {
    return { ok: false, fieldErrors: zodErrorToFieldErrors(parsed.error) };
  }

  return commentUserActionRuntime.runUserAction({
    actionName: "submitUnitComment",
    extra: { unitId: parsed.data.unitId },
    execute: async (userId) => {
      const row = await commentService.insertUnitComment({
        ...parsed.data,
        authorId: userId,
      });
      return { id: row.id };
    },
    onSuccess: () => revalidatePath("/courses/[slug]/[unitSlug]", "page"),
  });
}

export async function submitReply(
  _prev: ActionResult<{ id: string }> | undefined,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const parsed = submitReplySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, fieldErrors: zodErrorToFieldErrors(parsed.error) };
  }

  return commentUserActionRuntime.runUserAction({
    actionName: "submitReply",
    extra: { parentCommentId: parsed.data.parentCommentId },
    execute: async (userId) => {
      const row = await commentService.insertReply({
        ...parsed.data,
        authorId: userId,
      });
      return { id: row.id };
    },
    // Parent could be on either route; revalidate both dynamic paths.
    onSuccess: () => {
      revalidatePath("/courses/[slug]", "page");
      revalidatePath("/courses/[slug]/[unitSlug]", "page");
    },
  });
}

export type ToggleReactionResult = {
  likeCount: number;
  dislikeCount: number;
  myReaction: ReactionValue | null;
};

export async function toggleReaction(
  _prev: ActionResult<ToggleReactionResult> | undefined,
  formData: FormData,
): Promise<ActionResult<ToggleReactionResult>> {
  const parsed = toggleReactionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, fieldErrors: zodErrorToFieldErrors(parsed.error) };
  }

  return commentUserActionRuntime.runUserAction({
    actionName: "toggleReaction",
    extra: {
      commentId: parsed.data.commentId,
      reaction: parsed.data.reaction,
    },
    execute: async (userId) => {
      const existing = await commentService.listMyReactions(
        [parsed.data.commentId],
        userId,
      );
      if (existing.get(parsed.data.commentId) === parsed.data.reaction) {
        // Clicking the same button again toggles the reaction off.
        await commentService.removeReaction({
          userId,
          commentId: parsed.data.commentId,
        });
      } else {
        await commentService.setReaction({
          userId,
          commentId: parsed.data.commentId,
          reaction: parsed.data.reaction,
        });
      }
      return commentService.getReactionSnapshot(parsed.data.commentId, userId);
    },
    // No revalidatePath — the client uses useOptimistic + the returned
    // snapshot to reconcile. Counts refresh naturally on next navigation.
  });
}

export async function deleteOwnComment(
  _prev: ActionResult<{ commentId: string }> | undefined,
  formData: FormData,
): Promise<ActionResult<{ commentId: string }>> {
  const parsed = deleteCommentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, fieldErrors: zodErrorToFieldErrors(parsed.error) };
  }

  return commentUserActionRuntime.runUserAction({
    actionName: "deleteOwnComment",
    extra: { commentId: parsed.data.commentId },
    execute: async (userId) => {
      await commentService.softDeleteComment({
        commentId: parsed.data.commentId,
        userId,
      });
      return { commentId: parsed.data.commentId };
    },
    // The deleted comment could be on either route; revalidate both.
    onSuccess: () => {
      revalidatePath("/courses/[slug]", "page");
      revalidatePath("/courses/[slug]/[unitSlug]", "page");
    },
  });
}
