import type { QuizQuestion, SubjectId } from "./types";
import { subjectDemoQuiz } from "./demo-quiz-banks";

export function demoFlashcardsFromChat(
  subject: SubjectId,
  userMessages: string[]
): { front: string; back: string }[] {
  const topics = userMessages
    .map((m) => m.trim())
    .filter((m) => m.length > 10)
    .slice(-3);

  if (topics.length === 0) {
    return [
      {
        front: `What is the core skill in ${subject}?`,
        back: "Active recall — testing yourself without notes beats rereading.",
      },
      {
        front: "What should you do when stuck?",
        back: "State what you tried, identify the exact step that failed, ask for a hint on that step only.",
      },
      {
        front: "Why does sch00l refuse to do homework?",
        back: "Learning requires struggle; outsourcing answers kills retention and academic integrity.",
      },
    ];
  }

  return topics.map((t, i) => ({
    front: `Recall: What was your question about "${t.slice(0, 60)}${t.length > 60 ? "…" : ""}"?`,
    back: `Review your notes on this topic. Key idea #${i + 1}: explain it aloud in 30 seconds without looking.`,
  }));
}

export function demoQuiz(
  subject: SubjectId,
  topic?: string
): QuizQuestion[] {
  return subjectDemoQuiz(subject, topic);
}
