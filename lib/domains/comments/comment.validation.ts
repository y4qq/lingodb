import { z } from "zod";

// DB CHECK constraint (supabase/schema.ts:169) enforces 1–4000; mirror in
// validation so users get field errors instead of a 500.
export const submitCommentBodySchema = z
  .string()
  .trim()
  .min(1, "Comment cannot be empty")
  .max(4000, "Comment must be 4000 characters or fewer");

export const submitCourseCommentSchema = z.object({
  courseId: z.uuid(),
  body: submitCommentBodySchema,
});

export const submitUnitCommentSchema = z.object({
  unitId: z.uuid(),
  body: submitCommentBodySchema,
});

export type SubmitCourseCommentInput = z.infer<typeof submitCourseCommentSchema>;
export type SubmitUnitCommentInput = z.infer<typeof submitUnitCommentSchema>;

export const submitReplySchema = z.object({
  parentCommentId: z.uuid(),
  body: submitCommentBodySchema,
});

export type SubmitReplyInput = z.infer<typeof submitReplySchema>;

export const reactionValueSchema = z.enum(["like", "dislike"]);
export type ReactionValue = z.infer<typeof reactionValueSchema>;

export const toggleReactionSchema = z.object({
  commentId: z.uuid(),
  reaction: reactionValueSchema,
});

export type ToggleReactionInput = z.infer<typeof toggleReactionSchema>;

export const deleteCommentSchema = z.object({
  commentId: z.uuid(),
});

export type DeleteCommentInput = z.infer<typeof deleteCommentSchema>;

export const moderateCommentSchema = z.object({
  commentId: z.uuid(),
});

export type ModerateCommentInput = z.infer<typeof moderateCommentSchema>;
