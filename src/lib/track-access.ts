import { loadEntitlements, canAccessTrack, type EntitlementSnapshot } from "./entitlements";
import type { StudyTrackId } from "./study-tracks";

/** Paid content only — no free lesson previews when gating is on. */
export const FREE_PREVIEW_LESSONS = 0;

export function isContentGatingActive(): boolean {
  if (process.env.CONTENT_GATING === "false") return false;
  return true;
}

export async function getTrackAccess(
  userId: string | null,
  trackId: StudyTrackId
): Promise<{
  full: boolean;
  gated: boolean;
  previewLimit: number;
  snapshot: EntitlementSnapshot;
}> {
  const snapshot = userId
    ? await loadEntitlements(userId)
    : {
        hasMembership: false,
        hasBundle: false,
        curricula: [],
        tracks: [],
        isPro: false,
      };
  const gated = isContentGatingActive();
  const full = !gated || canAccessTrack(snapshot, trackId) || snapshot.isPro;
  return {
    full,
    gated,
    previewLimit: FREE_PREVIEW_LESSONS,
    snapshot,
  };
}

export type CourseLessonRow = {
  id: string;
  unit_id: string;
  ord: number;
  title: string;
  objectives?: unknown;
  body_markdown: string;
  locked?: boolean;
};

/** Apply preview lock to lesson list (flat order across units). */
export function applyLessonLocks(
  lessons: CourseLessonRow[],
  full: boolean,
  previewLimit = FREE_PREVIEW_LESSONS
): CourseLessonRow[] {
  if (full) return lessons.map((l) => ({ ...l, locked: false }));
  return lessons.map((l, i) => ({
    ...l,
    locked: i >= previewLimit,
    body_markdown: i >= previewLimit
      ? "_This lesson requires an active membership plus the matching curriculum subscription. [View pricing](/pricing)_"
      : l.body_markdown,
  }));
}
