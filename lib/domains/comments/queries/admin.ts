import "server-only";
import { requireAdmin } from "@/lib/auth/guards";
import {
  getModerationCounts as getModerationCountsRow,
  listCommentsForModeration as listCommentsForModerationRow,
  type ModerationCounts,
  type ModerationFilter,
} from "../comment.service";

export type { ModerationCounts, ModerationFilter };

export type AdminModerationRow = Awaited<
  ReturnType<typeof listCommentsForModerationRow>
>[number];

export async function listAdminCommentsForModeration(filter: ModerationFilter) {
  await requireAdmin();
  return listCommentsForModerationRow(filter);
}

export async function getAdminModerationCounts() {
  await requireAdmin();
  return getModerationCountsRow();
}
