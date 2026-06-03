import type { QuizResult } from "./types";

const KEY = "sch00l_quiz_results_v1";

export function saveQuizResultLocal(
  result: Omit<QuizResult, "id" | "createdAt">
): void {
  if (typeof window === "undefined") return;
  const list = loadQuizResultsLocal();
  list.unshift({
    ...result,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  });
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 40)));
  window.dispatchEvent(new CustomEvent("sch00l-quiz-saved"));
}

export function loadQuizResultsLocal(): QuizResult[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as QuizResult[];
  } catch {
    return [];
  }
}

function liftLabel(prePct: number, postPct: number): string {
  const delta = postPct - prePct;
  const sign = delta >= 0 ? "+" : "";
  return `${prePct}% → ${postPct}% (${sign}${delta} lift)`;
}

function pairLift(pre: QuizResult, post: QuizResult): string | null {
  if (pre.skipped) return null;
  const prePct = Math.round((pre.score / pre.total) * 100);
  const postPct = Math.round((post.score / post.total) * 100);
  return liftLabel(prePct, postPct);
}

/** Latest valid lift: pre+post from the same sessionId, pre not skipped */
export function latestQuizLiftLocal(): string | null {
  const list = loadQuizResultsLocal();
  const sessionIds = [
    ...new Set(list.filter((q) => q.sessionId).map((q) => q.sessionId!)),
  ];

  for (const sid of sessionIds) {
    const lift = liftForSession(sid);
    if (lift) return lift;
  }

  // Fallback: pair newest pre with next post (same subject) when sessionId missing
  const pres = list.filter((q) => q.phase === "pre" && !q.skipped);
  for (const pre of pres) {
    const post = list.find(
      (q) =>
        q.phase === "post" &&
        q.subject === pre.subject &&
        (!pre.sessionId || q.sessionId === pre.sessionId) &&
        new Date(q.createdAt).getTime() >= new Date(pre.createdAt).getTime()
    );
    if (post) return pairLift(pre, post);
  }
  return null;
}

export function liftForSession(sessionId: string): string | null {
  const list = loadQuizResultsLocal();
  const pre = list.find((q) => q.sessionId === sessionId && q.phase === "pre");
  const post = list.find((q) => q.sessionId === sessionId && q.phase === "post");
  if (!pre || !post || pre.skipped) return null;
  const prePct = Math.round((pre.score / pre.total) * 100);
  const postPct = Math.round((post.score / post.total) * 100);
  return liftLabel(prePct, postPct);
}
