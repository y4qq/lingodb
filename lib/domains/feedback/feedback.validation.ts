import { z } from "zod";

export const submitFeedbackSchema = z.object({
  lessonId: z.uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z
    .string()
    .trim()
    .max(4000, "Comment must be 4000 characters or fewer.")
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
});

export type SubmitFeedbackInput = z.infer<typeof submitFeedbackSchema>;
