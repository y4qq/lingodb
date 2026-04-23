import "server-only";
import { requireUser } from "@/lib/auth/guards";
import {
  listMyReactions,
  listReactionCounts,
  listVisibleCourseComments,
  listVisibleRepliesForParents,
  type CommentWithAuthor,
} from "../comment.service";
import type { ReactionValue } from "../comment.validation";

export type CommentWithMeta = CommentWithAuthor & {
  likeCount: number;
  dislikeCount: number;
  myReaction: ReactionValue | null;
};

export type CommentWithThread = CommentWithMeta & {
  replies: CommentWithMeta[];
};

export async function getCourseCommentsForMe(courseId: string) {
  const user = await requireUser();
  const topLevel = await listVisibleCourseComments(courseId, user.id);
  const tree = await buildThreadedTree(topLevel, user.id);
  return { comments: tree, currentUserId: user.id };
}

async function buildThreadedTree(
  topLevel: CommentWithAuthor[],
  userId: string,
): Promise<CommentWithThread[]> {
  const topLevelIds = topLevel.map((c) => c.id);
  const replies = await listVisibleRepliesForParents(topLevelIds, userId);
  const allIds = [...topLevelIds, ...replies.map((r) => r.id)];

  const [counts, mine] = await Promise.all([
    listReactionCounts(allIds),
    listMyReactions(allIds, userId),
  ]);

  const enrich = (c: CommentWithAuthor): CommentWithMeta => ({
    ...c,
    likeCount: counts.get(c.id)?.likeCount ?? 0,
    dislikeCount: counts.get(c.id)?.dislikeCount ?? 0,
    myReaction: mine.get(c.id) ?? null,
  });

  const repliesByParent = new Map<string, CommentWithMeta[]>();
  for (const r of replies) {
    if (!r.parentCommentId) continue;
    const bucket = repliesByParent.get(r.parentCommentId) ?? [];
    bucket.push(enrich(r));
    repliesByParent.set(r.parentCommentId, bucket);
  }

  return topLevel.map((c) => ({
    ...enrich(c),
    replies: repliesByParent.get(c.id) ?? [],
  }));
}
