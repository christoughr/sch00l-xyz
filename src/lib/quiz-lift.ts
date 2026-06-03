/** Server-side learning lift from quiz rows (pair by session_id when present) */

export type QuizLiftRow = {
  session_id?: string | null;
  user_id?: string | null;
  phase: string;
  score: number;
  total: number;
  skipped?: boolean | null;
};

function pct(score: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((score / total) * 100);
}

/** Latest lift per session_id (newest sessions first in input order) */
export function liftsBySessionId(rows: QuizLiftRow[]): number[] {
  const bySession = new Map<
    string,
    { pre?: number; post?: number; skipped?: boolean }
  >();

  for (const q of rows) {
    const sid = q.session_id;
    if (!sid) continue;
    const entry = bySession.get(sid) ?? {};
    const p = pct(q.score, q.total);
    if (q.phase === "pre" && entry.pre === undefined) {
      entry.pre = p;
      entry.skipped = !!q.skipped;
    }
    if (q.phase === "post" && entry.post === undefined) entry.post = p;
    bySession.set(sid, entry);
  }

  const lifts: number[] = [];
  for (const { pre, post, skipped } of bySession.values()) {
    if (skipped || pre === undefined || post === undefined) continue;
    lifts.push(post - pre);
  }
  return lifts;
}

/** Fallback when session_id missing: first pre + first post per user (newest-first rows) */
export function liftsByUserFallback(rows: QuizLiftRow[]): number[] {
  const byUser = new Map<
    string,
    { pre?: number; post?: number; skipped?: boolean }
  >();
  for (const q of rows) {
    const key = q.user_id ?? "anon";
    const entry = byUser.get(key) ?? {};
    const p = pct(q.score, q.total);
    if (q.phase === "pre" && entry.pre === undefined) {
      entry.pre = p;
      entry.skipped = !!q.skipped;
    }
    if (q.phase === "post" && entry.post === undefined) entry.post = p;
    byUser.set(key, entry);
  }
  const lifts: number[] = [];
  for (const { pre, post, skipped } of byUser.values()) {
    if (skipped || pre === undefined || post === undefined) continue;
    lifts.push(post - pre);
  }
  return lifts;
}

export function aggregateLift(rows: QuizLiftRow[]): {
  lifts: number[];
  averageLiftPercent: number | null;
} {
  const sessionLifts = liftsBySessionId(rows);
  const lifts =
    sessionLifts.length > 0 ? sessionLifts : liftsByUserFallback(rows);
  const averageLiftPercent =
    lifts.length > 0
      ? Math.round(lifts.reduce((a, b) => a + b, 0) / lifts.length)
      : null;
  return { lifts, averageLiftPercent };
}
