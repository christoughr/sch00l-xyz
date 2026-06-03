import { chatCompletion } from "./llm";

export function generateBattleCode(): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export type BattleQuestion = {
  prompt: string;
  choices: string[];
  correctIndex: number;
};

export async function generateBattleQuestions(
  trackLabel: string,
  topic: string,
  count = 8
): Promise<BattleQuestion[]> {
  const raw = await chatCompletion(
    `Generate ${count} multiple-choice quiz questions for a live classroom battle. JSON array only:
[{"prompt":"...","choices":["A","B","C","D"],"correctIndex":0}]
Socratic difficulty, exam-appropriate, no trick questions.`,
    `Course: ${trackLabel}\nTopic: ${topic}`,
    { maxTokens: 2500, temperature: 0.5 }
  );

  if (!raw) return fallbackQuestions(trackLabel, count);

  try {
    const m = raw.match(/\[[\s\S]*\]/);
    if (!m) return fallbackQuestions(trackLabel, count);
    const arr = JSON.parse(m[0]) as BattleQuestion[];
    return arr
      .filter(
        (q) =>
          q.prompt &&
          Array.isArray(q.choices) &&
          q.choices.length >= 2 &&
          q.correctIndex >= 0 &&
          q.correctIndex < q.choices.length
      )
      .slice(0, count);
  } catch {
    return fallbackQuestions(trackLabel, count);
  }
}

function fallbackQuestions(trackLabel: string, count: number): BattleQuestion[] {
  return Array.from({ length: count }, (_, i) => ({
    prompt: `${trackLabel}: Concept check ${i + 1} — which statement is most accurate?`,
    choices: [
      "Definition A (review this)",
      "The standard textbook explanation",
      "A common misconception",
      "Unrelated fact",
    ],
    correctIndex: 1,
  }));
}

export function scoreAnswer(
  correct: boolean,
  elapsedMs: number,
  maxPoints = 1000
): number {
  if (!correct) return 0;
  const speedBonus = Math.max(0, Math.floor((30_000 - elapsedMs) / 30));
  return Math.min(maxPoints, 500 + speedBonus);
}
