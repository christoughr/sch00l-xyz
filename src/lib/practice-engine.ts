import type { BattleQuestion } from "./battle";
import { chatCompletion } from "./llm";

export type PracticeTestMeta = {
  id: string;
  label: string;
  examFamily: string;
  region: string;
  durationMinutes: number;
  sectionCount: number;
};

export async function generatePracticeItems(
  test: PracticeTestMeta,
  count = 10
): Promise<BattleQuestion[]> {
  const raw = await chatCompletion(
    `Generate ${count} exam-style MCQs for ${test.label} (${test.examFamily}, ${test.region}).
JSON array: [{"prompt":"...","choices":["..."],"correctIndex":0}]`,
    `Timed test ${test.id}, ${test.durationMinutes} minutes total.`,
    { maxTokens: 3000, temperature: 0.4 }
  );

  if (!raw) return genericItems(test.label, count);

  try {
    const m = raw.match(/\[[\s\S]*\]/);
    if (!m) return genericItems(test.label, count);
    return (JSON.parse(m[0]) as BattleQuestion[]).slice(0, count);
  } catch {
    return genericItems(test.label, count);
  }
}

function genericItems(label: string, count: number): BattleQuestion[] {
  return Array.from({ length: count }, (_, i) => ({
    prompt: `${label} — Question ${i + 1}`,
    choices: ["Option A", "Option B", "Option C", "Option D"],
    correctIndex: 0,
  }));
}

export function weakTagsFromMisses(
  items: { skillTag?: string; correct: boolean }[]
): string[] {
  const weak = new Set<string>();
  for (const it of items) {
    if (!it.correct && it.skillTag) weak.add(it.skillTag);
  }
  return [...weak];
}
