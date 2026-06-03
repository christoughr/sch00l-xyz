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
}

export function loadQuizResultsLocal(): QuizResult[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as QuizResult[];
  } catch {
    return [];
  }
}

export function latestQuizLiftLocal(): string | null {
  const list = loadQuizResultsLocal();
  const pre = list.find((q) => q.phase === "pre");
  const post = list.find((q) => q.phase === "post");
  if (!pre || !post) return null;
  const prePct = Math.round((pre.score / pre.total) * 100);
  const postPct = Math.round((post.score / post.total) * 100);
  return `${prePct}% → ${postPct}% (${postPct - prePct >= 0 ? "+" : ""}${postPct - prePct} lift)`;
}
