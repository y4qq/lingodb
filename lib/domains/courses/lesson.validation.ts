import { z } from "zod";

const iconField = z
  .string()
  .min(1, "Icon is required")
  .max(16, "Icon must be 16 characters or fewer");

export const createLessonSchema = z.object({
  unitId: z.uuid(),
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
  icon: iconField,
});

export type CreateLessonInput = z.infer<typeof createLessonSchema>;

export const updateLessonSchema = z.object({
  id: z.uuid(),
  title: z.string().min(1, "Title is required").max(200),
  description: z
    .string()
    .max(2000, "Description must be 2000 characters or fewer")
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  icon: iconField,
  position: z.coerce.number().int().min(0, "Position must be 0 or greater"),
  isPublished: z.coerce.boolean().default(false),
});

export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
