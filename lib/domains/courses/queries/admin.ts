import "server-only";
import { requireAdmin } from "@/lib/auth/guards";
import * as service from "../service";

// Admin-scoped course reads. Every export guards with `requireAdmin()` before
// touching the service, so callers (Server Components under app/admin/**)
// can't accidentally skip the check.

export async function listAllCourses() {
  await requireAdmin();
  return service.listAllCourses();
}
