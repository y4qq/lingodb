import { z } from "zod";

export const createLessonSchema = z.object({
  packId: z.uuid(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(80, "Slug must be 80 characters or fewer")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase kebab-case (a-z, 0-9, -)"),
  title: z.string().min(1, "Title is required").max(200),
  description: z
    .string()
    .max(2000, "Description must be 2000 characters or fewer")
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
});

export type CreateLessonInput = z.infer<typeof createLessonSchema>;
