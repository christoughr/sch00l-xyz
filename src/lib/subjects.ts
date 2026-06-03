import type { Subject } from "./types";

export { SUBJECT_IDS, type SubjectId } from "./subject-ids";

export const SUBJECTS: Subject[] = [
  { id: "math", label: "Math", emoji: "∑", description: "Algebra, calculus, proofs" },
  { id: "science", label: "Science", emoji: "⚗", description: "Bio, chem, physics" },
  { id: "english", label: "English", emoji: "✎", description: "Essays, lit, grammar" },
  { id: "history", label: "History", emoji: "⌛", description: "Events, sources, essays" },
  { id: "cs", label: "CS", emoji: "{ }", description: "Code, algorithms, systems" },
  { id: "languages", label: "Languages", emoji: "Aa", description: "Vocab, grammar, speaking" },
  { id: "economics", label: "Economics", emoji: "📈", description: "Micro, macro, markets" },
  { id: "psychology", label: "Psychology", emoji: "🧠", description: "Behavior, cognition, research" },
  { id: "geography", label: "Geography", emoji: "🌍", description: "Human & physical geo" },
  { id: "philosophy", label: "Philosophy", emoji: "◇", description: "Logic, ethics, arguments" },
  { id: "art", label: "Art", emoji: "🎨", description: "Studio, history, critique" },
  { id: "music", label: "Music", emoji: "♫", description: "Theory, history, practice" },
  { id: "business", label: "Business", emoji: "💼", description: "Mgmt, marketing, finance" },
  { id: "engineering", label: "Engineering", emoji: "⚙", description: "Statics, circuits, design" },
  { id: "health", label: "Health", emoji: "➕", description: "Anatomy, nursing, wellness" },
  { id: "statistics", label: "Statistics", emoji: "σ", description: "Probability, data, inference" },
  { id: "social_studies", label: "Social studies", emoji: "🏛", description: "Civics, culture, policy" },
  { id: "other", label: "Other", emoji: "◎", description: "Any subject you're tackling" },
];

export function getSubject(id: string): Subject {
  return SUBJECTS.find((s) => s.id === id) ?? SUBJECTS[SUBJECTS.length - 1];
}
