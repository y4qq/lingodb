import { z } from "zod";

export const createCourseSchema = z
  .object({
    baseLanguageId: z.uuid("Select a valid base language"),
    targetLanguageId: z.uuid("Select a valid target language"),
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
    isFree: z.coerce.boolean().default(false),
  })
  .refine((d) => d.baseLanguageId !== d.targetLanguageId, {
    error: "Base and target languages must differ",
    path: ["targetLanguageId"],
  });

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
