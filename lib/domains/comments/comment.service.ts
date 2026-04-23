import "server-only";
import {
  and,
  asc,
  count,
  desc,
  eq,
  inArray,
  isNotNull,
  isNull,
  or,
  sql,
} from "drizzle-orm";
import { db } from "@/lib/db";
import { NotFoundError, ValidationError } from "@/lib/errors";
import {
  commentReactions,
  comments,
  courses,
  units,
} from "@/supabase/schema";
import type {
  ReactionValue,
  SubmitCourseCommentInput,
  SubmitUnitCommentInput,
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
        columns: { id: true, displayName: true },
      },
    },
  });
}

export async function listVisibleUnitComments(
  unitId: string,
  currentUserId: string,
) {
  return db.query.comments.findMany({
    where: and(
      eq(comments.unitId, unitId),
      isNull(comments.parentCommentId),
      visibilityFilter(currentUserId),
    ),
    orderBy: asc(comments.createdAt),
    with: {
      author: {
        columns: { id: true, displayName: true },
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
        columns: { id: true, displayName: true },
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

export async function insertUnitComment(
  input: SubmitUnitCommentInput & { authorId: string },
) {
  const unit = await db.query.units.findFirst({
    where: eq(units.id, input.unitId),
    columns: { id: true },
  });
  if (!unit) {
    throw new NotFoundError("Unit not found");
  }

  const [row] = await db
    .insert(comments)
    .values({
      authorId: input.authorId,
      unitId: input.unitId,
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

  await db
    .update(comments)
    .set({ deletedAt: new Date() })
    .where(eq(comments.id, input.commentId));
}

export type ModerationFilter = {
  // Absent = any moderation bucket. The Deleted tab passes `deleted: true`
  // and ignores status; the other tabs pass a specific status + deleted=false.
  status?: "pending" | "approved" | "rejected";
  deleted?: boolean;
  limit?: number;
};

const MODERATION_DEFAULT_LIMIT = 200;

// Single flat list of comments for the admin moderation surface. Top-level
// and replies are interleaved; the row carries enough joined context (author,
// direct course/unit, plus parent → course/unit for replies) that the UI can
// render each row's target without a second query.
export async function listCommentsForModeration(filter: ModerationFilter) {
  return db.query.comments.findMany({
    where: and(
      filter.status ? eq(comments.moderationStatus, filter.status) : undefined,
      filter.deleted === true
        ? isNotNull(comments.deletedAt)
        : filter.deleted === false
          ? isNull(comments.deletedAt)
          : undefined,
    ),
    limit: filter.limit ?? MODERATION_DEFAULT_LIMIT,
    orderBy: desc(comments.createdAt),
    with: {
      author: { columns: { id: true, displayName: true, email: true } },
      course: { columns: { slug: true, title: true } },
      unit: {
        columns: { slug: true, title: true },
        with: {
          course: { columns: { slug: true, title: true } },
        },
      },
      parent: {
        columns: { id: true, body: true, courseId: true, unitId: true },
        with: {
          course: { columns: { slug: true, title: true } },
          unit: {
            columns: { slug: true, title: true },
            with: {
              course: { columns: { slug: true, title: true } },
            },
          },
        },
      },
    },
  });
}

export type ModerationCounts = {
  pending: number;
  approved: number;
  rejected: number;
  deleted: number;
};

export async function getModerationCounts(): Promise<ModerationCounts> {
  const [pending, approved, rejected, deleted] = await Promise.all([
    db
      .select({ n: count() })
      .from(comments)
      .where(
        and(
          eq(comments.moderationStatus, "pending"),
          isNull(comments.deletedAt),
        ),
      ),
    db
      .select({ n: count() })
      .from(comments)
      .where(
        and(
          eq(comments.moderationStatus, "approved"),
          isNull(comments.deletedAt),
        ),
      ),
    db
      .select({ n: count() })
      .from(comments)
      .where(
        and(
          eq(comments.moderationStatus, "rejected"),
          isNull(comments.deletedAt),
        ),
      ),
    db
      .select({ n: count() })
      .from(comments)
      .where(isNotNull(comments.deletedAt)),
  ]);

  return {
    pending: pending[0]?.n ?? 0,
    approved: approved[0]?.n ?? 0,
    rejected: rejected[0]?.n ?? 0,
    deleted: deleted[0]?.n ?? 0,
  };
}

export async function setCommentModerationStatus(input: {
  commentId: string;
  status: "pending" | "approved" | "rejected";
  moderatorId: string;
}) {
  const patch =
    input.status === "pending"
      ? {
          moderationStatus: "pending" as const,
          moderatedAt: null,
          moderatedBy: null,
        }
      : {
          moderationStatus: input.status,
          moderatedAt: new Date(),
          moderatedBy: input.moderatorId,
        };

  const [updated] = await db
    .update(comments)
    .set(patch)
    .where(eq(comments.id, input.commentId))
    .returning({ id: comments.id });
  if (!updated) {
    throw new NotFoundError("Comment not found");
  }
  return updated;
}
