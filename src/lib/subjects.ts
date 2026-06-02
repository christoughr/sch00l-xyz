import type { Subject } from "./types";

export const SUBJECTS: Subject[] = [
  {
    id: "math",
    label: "Math",
    emoji: "∑",
    description: "Algebra, calculus, proofs",
  },
  {
    id: "science",
    label: "Science",
    emoji: "⚗",
    description: "Bio, chem, physics",
  },
  {
    id: "english",
    label: "English",
    emoji: "✎",
    description: "Essays, lit, grammar",
  },
  {
    id: "history",
    label: "History",
    emoji: "⌛",
    description: "Events, sources, essays",
  },
  {
    id: "cs",
    label: "CS",
    emoji: "{ }",
    description: "Code, algorithms, systems",
  },
  {
    id: "languages",
    label: "Languages",
    emoji: "Aa",
    description: "Vocab, grammar, conversation",
  },
  {
    id: "other",
    label: "Other",
    emoji: "◎",
    description: "Any subject you're tackling",
  },
];

export function getSubject(id: string): Subject {
  return SUBJECTS.find((s) => s.id === id) ?? SUBJECTS[SUBJECTS.length - 1];
}
