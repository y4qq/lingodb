"use server";

// Server actions for the users feature.
//
// Each action:
//   1. Guards the caller with requireUser() (or requireAdmin()) from
//      @/lib/auth/guards.
//   2. Validates input with a Zod schema from ./validators.
//   3. Delegates the actual work to ./service.
//   4. Calls revalidatePath / revalidateTag as needed and returns a
//      serializable result.
//
// No exports yet — add them as features land (e.g. updateProfileAction,
// changeDisplayNameAction).
