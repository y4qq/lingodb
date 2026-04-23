import "server-only";
import { requireAdmin } from "@/lib/auth/guards";
import { listEnrollmentCountsByCourse as listEnrollmentCountsByCourseRow } from "../service";

// Admin-scoped reads over the users domain. Matches the queries/admin.ts
// pattern used by the courses and comments domains — every export guards
// with `requireAdmin()` before touching the service, so callers under
// app/admin/** can't accidentally skip the check.

export async function listAdminEnrollmentCountsByCourse() {
  await requireAdmin();
  return listEnrollmentCountsByCourseRow();
}
