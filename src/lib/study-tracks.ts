import type { SubjectId } from "./types";

export type StudyTrackId = "ap-calc-ab" | "sat-math" | "ap-bio" | "custom";

export type StudyTrack = {
  id: StudyTrackId;
  label: string;
  description: string;
  subject: SubjectId;
  topic: string;
  gradeLevel: string;
  tutorContext: string;
};

export const STUDY_TRACKS: StudyTrack[] = [
  {
    id: "ap-calc-ab",
    label: "AP Calculus AB",
    description: "Limits, derivatives, integrals, FTC",
    subject: "math",
    topic: "AP Calculus AB — derivatives and integrals",
    gradeLevel: "AP Calculus AB",
    tutorContext:
      "Align with AP Calc AB: limits, continuity, derivative rules, applications, integrals, FTC. Use AP-style notation. Never give full FRQ solutions on first ask.",
  },
  {
    id: "sat-math",
    label: "SAT Math",
    description: "Algebra, problem-solving, data analysis",
    subject: "math",
    topic: "SAT Math — algebra and problem solving",
    gradeLevel: "SAT / high school",
    tutorContext:
      "SAT Math focus: linear equations, systems, quadratics, ratios, percentages, data tables. Teach test-taking strategy and efficient methods, not answer keys.",
  },
  {
    id: "ap-bio",
    label: "AP Biology",
    description: "Cells, genetics, evolution, ecology",
    subject: "science",
    topic: "AP Biology — cell division and genetics",
    gradeLevel: "AP Biology",
    tutorContext:
      "AP Bio framing: use claim-evidence-reasoning. Connect to College Board science practices. Diagrams in words when helpful.",
  },
  {
    id: "custom",
    label: "Custom topic",
    description: "Pick your own subject and topic",
    subject: "math",
    topic: "",
    gradeLevel: "",
    tutorContext: "",
  },
];

export function getStudyTrack(id: StudyTrackId): StudyTrack {
  return STUDY_TRACKS.find((t) => t.id === id) ?? STUDY_TRACKS[STUDY_TRACKS.length - 1];
}
