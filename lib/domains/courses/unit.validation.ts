import { z } from "zod";

export const createUnitSchema = z.object({
  courseId: z.uuid(),
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
});

export type CreateUnitInput = z.infer<typeof createUnitSchema>;

export const updateUnitSchema = z.object({
  id: z.uuid(),
  title: z.string().min(1, "Title is required").max(200),
  description: z
    .string()
    .max(2000, "Description must be 2000 characters or fewer")
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  position: z.coerce.number().int().min(0, "Position must be 0 or greater"),
  isPublished: z.coerce.boolean().default(false),
  isFree: z.coerce.boolean().default(false),
});

export type UpdateUnitInput = z.infer<typeof updateUnitSchema>;
