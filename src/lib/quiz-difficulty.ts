import type { StudentLearningContext } from "./student-profile";

export type QuizDifficulty = "foundational" | "standard" | "challenging";

export function inferQuizDifficulty(opts: {
  phase: "pre" | "post";
  studentContext?: StudentLearningContext | null;
}): QuizDifficulty {
  const { phase, studentContext } = opts;
  const pre = studentContext?.preScoreToday;

  if (phase === "pre") {
    if (pre != null && pre >= 80) return "challenging";
    if (
      studentContext?.strongTopics?.length &&
      (studentContext.strongTopics[0]?.confidence ?? 0) >= 75
    ) {
      return "challenging";
    }
    if (pre != null && pre < 45) return "foundational";
    if ((studentContext?.weakTopics?.length ?? 0) >= 2) return "foundational";
    return "standard";
  }

  // post-session: slightly harder if they chatted and pre was solid
  if (pre != null && pre >= 70) return "challenging";
  if (pre != null && pre < 40) return "foundational";
  return "standard";
}

export function quizDifficultyPrompt(difficulty: QuizDifficulty): string {
  switch (difficulty) {
    case "foundational":
      return "Difficulty: foundational — core definitions and one-step reasoning; avoid trick questions.";
    case "challenging":
      return "Difficulty: challenging — multi-step reasoning and subtle distractors; still fair and on-topic.";
    default:
      return "Difficulty: standard — typical classroom level for this topic.";
  }
}
