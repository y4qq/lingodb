import { z } from "zod";

export const updatePackSchema = z.object({
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

export type UpdatePackInput = z.infer<typeof updatePackSchema>;
