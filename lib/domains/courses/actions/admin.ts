"use server";

import * as Sentry from "@sentry/nextjs";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guards";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { createCourse } from "../service";
import { createCourseSchema } from "../validators";

// Discriminated union matching the shape `useActionState` expects on the
// client. `fieldErrors` carries per-field Zod errors; `error` carries a
// single summary message for non-validation failures (ConflictError,
// unexpected bugs, etc).
export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error?: string; fieldErrors?: Record<string, string[]> };

// Server action for creating a course. Admin-only.
//
// Flow:
//   1. requireAdmin() — redirects / 404s on non-admin callers. Also sets
//      the Sentry user context for any error reported during this request.
//   2. Zod-validate the FormData payload. Field errors return early; the
//      client renders them inline.
//   3. Delegate to `createCourse` service. Domain errors
//      (ConflictError / NotFoundError) become user-visible form errors —
//      we deliberately DON'T report these to Sentry because they're user
//      errors, not bugs. Unexpected errors are reported with context and
//      surfaced as a generic message to avoid leaking details.
//   4. Revalidate the admin course list so the new draft appears on
//      redirect.
export async function createCourseAction(
  _prev: ActionResult<{ slug: string }> | undefined,
  formData: FormData,
): Promise<ActionResult<{ slug: string }>> {
  const { user } = await requireAdmin();
  Sentry.setUser({ id: user.id, email: user.email ?? undefined });

  const parsed = createCourseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const course = await createCourse(parsed.data);
    revalidatePath("/admin/courses");
    return { ok: true, data: { slug: course.slug } };
  } catch (err) {
    if (err instanceof ConflictError || err instanceof NotFoundError) {
      // Expected domain error; show inline, don't page on-call.
      return { ok: false, error: err.message };
    }
    Sentry.captureException(err, {
      extra: { action: "createCourseAction", input: parsed.data },
    });
    return {
      ok: false,
      error: "Something went wrong. Please try again.",
    };
  }
}
