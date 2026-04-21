// Zod schemas for validating inputs to users server actions.
// Imported by both ./actions.ts and by any client-side form that wants to
// share the same validation rules as the server.
//
// Add schemas here when the first `users` server action lands — e.g.
//
//   import { z } from "zod";
//   export const updateProfileSchema = z.object({
//     displayName: z.string().min(1).max(80),
//   });
//
// `zod` is not yet a project dependency; install it alongside the first
// real schema.
