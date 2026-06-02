import type { QuizQuestion, SubjectId } from "./types";

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
  const t = topic?.trim() || subject;
  return [
    {
      id: "1",
      question: `Best first step when stuck on ${t}?`,
      options: [
        "Ask AI for the full answer",
        "Identify the exact step that confused you",
        "Skip to the next problem",
        "Memorize the final answer",
      ],
      correctIndex: 1,
      explanation: "Pinpointing the stuck step enables targeted help (Socratic tutoring).",
    },
    {
      id: "2",
      question: "Which study method has the strongest evidence?",
      options: [
        "Rereading the textbook",
        "Highlighting everything",
        "Active recall / self-testing",
        "Copying solutions",
      ],
      correctIndex: 2,
      explanation: "Retrieval practice beats passive review for long-term retention.",
    },
    {
      id: "3",
      question: "After a study session, you should…",
      options: [
        "Immediately start a new topic",
        "Do a 2-minute brain dump of what you learned",
        "Close the book and forget it",
        "Only review if there's a test tomorrow",
      ],
      correctIndex: 1,
      explanation: "Brief recall consolidates memory and surfaces gaps.",
    },
  ];
}
