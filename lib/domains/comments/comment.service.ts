import "server-only";
import { and, asc, eq, inArray, isNull, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { NotFoundError, ValidationError } from "@/lib/errors";
import {
  commentReactions,
  comments,
  courses,
  packs,
} from "@/supabase/schema";
import type {
  ReactionValue,
  SubmitCourseCommentInput,
  SubmitPackCommentInput,
  SubmitReplyInput,
} from "./comment.validation";

// Visibility rule for non-admin readers: approved comments are public; a
// user always sees their own still-pending comments so they know the
// submission landed. Rejected comments are hidden from all non-admin
// surfaces (treated like deletion).
function visibilityFilter(currentUserId: string) {
  return or(
    eq(comments.moderationStatus, "approved"),
    and(
      eq(comments.moderationStatus, "pending"),
      eq(comments.authorId, currentUserId),
    ),
  );
}

export type CommentWithAuthor = Awaited<
  ReturnType<typeof listVisibleCourseComments>
>[number];

export async function listVisibleCourseComments(
  courseId: string,
  currentUserId: string,
) {
  return db.query.comments.findMany({
    where: and(
      eq(comments.courseId, courseId),
      isNull(comments.parentCommentId),
      visibilityFilter(currentUserId),
    ),
    orderBy: asc(comments.createdAt),
    with: {
      author: {
        columns: { id: true, displayName: true, email: true },
      },
    },
  });
}

export async function listVisiblePackComments(
  packId: string,
  currentUserId: string,
) {
  return db.query.comments.findMany({
    where: and(
      eq(comments.packId, packId),
      isNull(comments.parentCommentId),
      visibilityFilter(currentUserId),
    ),
    orderBy: asc(comments.createdAt),
    with: {
      author: {
        columns: { id: true, displayName: true, email: true },
      },
    },
  });
}

export async function listVisibleRepliesForParents(
  parentIds: string[],
  currentUserId: string,
) {
  if (parentIds.length === 0) return [];
  return db.query.comments.findMany({
    where: and(
      inArray(comments.parentCommentId, parentIds),
      visibilityFilter(currentUserId),
    ),
    orderBy: asc(comments.createdAt),
    with: {
      author: {
        columns: { id: true, displayName: true, email: true },
      },
    },
  });
}

export async function insertCourseComment(
  input: SubmitCourseCommentInput & { authorId: string },
) {
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, input.courseId),
    columns: { id: true },
  });
  if (!course) {
    throw new NotFoundError("Course not found");
  }

  const [row] = await db
    .insert(comments)
    .values({
      authorId: input.authorId,
      courseId: input.courseId,
      body: input.body,
    })
    .returning({ id: comments.id });
  return row;
}

export async function insertPackComment(
  input: SubmitPackCommentInput & { authorId: string },
) {
  const pack = await db.query.packs.findFirst({
    where: eq(packs.id, input.packId),
    columns: { id: true },
  });
  if (!pack) {
    throw new NotFoundError("Pack not found");
  }

  const [row] = await db
    .insert(comments)
    .values({
      authorId: input.authorId,
      packId: input.packId,
      body: input.body,
    })
    .returning({ id: comments.id });
  return row;
}

export async function insertReply(
  input: SubmitReplyInput & { authorId: string },
) {
  const parent = await db.query.comments.findFirst({
    where: eq(comments.id, input.parentCommentId),
    columns: {
      id: true,
      parentCommentId: true,
      moderationStatus: true,
      deletedAt: true,
    },
  });
  if (!parent) {
    throw new NotFoundError("Parent comment not found");
  }
  // 1-level threading only.
  if (parent.parentCommentId !== null) {
    throw new ValidationError("Replies cannot be nested");
  }
  // Can't reply to something that's not publicly visible yet.
  if (parent.moderationStatus !== "approved") {
    throw new ValidationError("Parent comment is not available");
  }
  if (parent.deletedAt !== null) {
    throw new ValidationError("Parent comment has been deleted");
  }

  const [row] = await db
    .insert(comments)
    .values({
      authorId: input.authorId,
      parentCommentId: input.parentCommentId,
      body: input.body,
    })
    .returning({ id: comments.id });
  return row;
}

export type ReactionCounts = { likeCount: number; dislikeCount: number };

// Returns a map keyed by commentId. Missing entries imply 0/0 for both.
export async function listReactionCounts(
  commentIds: string[],
): Promise<Map<string, ReactionCounts>> {
  const result = new Map<string, ReactionCounts>();
  if (commentIds.length === 0) return result;

  const rows = await db
    .select({
      commentId: commentReactions.commentId,
      reaction: commentReactions.reaction,
      count: sql<number>`count(*)::int`,
    })
    .from(commentReactions)
    .where(inArray(commentReactions.commentId, commentIds))
    .groupBy(commentReactions.commentId, commentReactions.reaction);

  for (const r of rows) {
    const current = result.get(r.commentId) ?? { likeCount: 0, dislikeCount: 0 };
    if (r.reaction === "like") current.likeCount = r.count;
    else current.dislikeCount = r.count;
    result.set(r.commentId, current);
  }
  return result;
}

export async function listMyReactions(
  commentIds: string[],
  userId: string,
): Promise<Map<string, ReactionValue>> {
  const result = new Map<string, ReactionValue>();
  if (commentIds.length === 0) return result;

  const rows = await db
    .select({
      commentId: commentReactions.commentId,
      reaction: commentReactions.reaction,
    })
    .from(commentReactions)
    .where(
      and(
        eq(commentReactions.userId, userId),
        inArray(commentReactions.commentId, commentIds),
      ),
    );

  for (const r of rows) {
    result.set(r.commentId, r.reaction);
  }
  return result;
}

async function assertReactable(commentId: string, userId: string) {
  const target = await db.query.comments.findFirst({
    where: eq(comments.id, commentId),
    columns: {
      id: true,
      authorId: true,
      moderationStatus: true,
      deletedAt: true,
    },
  });
  if (!target) {
    throw new NotFoundError("Comment not found");
  }
  if (target.deletedAt !== null) {
    throw new ValidationError("This comment has been deleted");
  }
  if (target.moderationStatus !== "approved") {
    throw new ValidationError("Only approved comments can be reacted to");
  }
  if (target.authorId === userId) {
    throw new ValidationError("You cannot react to your own comment");
  }
}

export async function setReaction(input: {
  userId: string;
  commentId: string;
  reaction: ReactionValue;
}) {
  await assertReactable(input.commentId, input.userId);
  await db
    .insert(commentReactions)
    .values({
      userId: input.userId,
      commentId: input.commentId,
      reaction: input.reaction,
    })
    .onConflictDoUpdate({
      target: [commentReactions.userId, commentReactions.commentId],
      set: { reaction: input.reaction },
    });
}

export async function removeReaction(input: {
  userId: string;
  commentId: string;
}) {
  // No assertReactable here — removing is always safe and idempotent, even
  // if the comment's moderation state has since changed.
  await db
    .delete(commentReactions)
    .where(
      and(
        eq(commentReactions.userId, input.userId),
        eq(commentReactions.commentId, input.commentId),
      ),
    );
}

export async function getReactionSnapshot(commentId: string, userId: string) {
  const [counts, mine] = await Promise.all([
    listReactionCounts([commentId]),
    listMyReactions([commentId], userId),
  ]);
  return {
    likeCount: counts.get(commentId)?.likeCount ?? 0,
    dislikeCount: counts.get(commentId)?.dislikeCount ?? 0,
    myReaction: mine.get(commentId) ?? null,
  };
}

// Soft-deletes a comment authored by the given user, plus every direct
// reply (1-level threading means that's the full subtree). Keeps the rows
// in the DB so admins can still inspect them.
export async function softDeleteComment(input: {
  commentId: string;
  userId: string;
}) {
  const target = await db.query.comments.findFirst({
    where: eq(comments.id, input.commentId),
    columns: { id: true, authorId: true, deletedAt: true },
  });
  if (!target) {
    throw new NotFoundError("Comment not found");
  }
  if (target.authorId !== input.userId) {
    throw new ValidationError("You can only delete your own comments");
  }
  if (target.deletedAt !== null) {
    // Idempotent: already deleted, nothing to do.
    return;
  }

  const now = new Date();
  await db
    .update(comments)
    .set({ deletedAt: now })
    .where(
      or(
        eq(comments.id, input.commentId),
        eq(comments.parentCommentId, input.commentId),
      ),
    );
}
