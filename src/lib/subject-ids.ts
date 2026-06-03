/** Single source of truth for subject IDs (API + UI) */
export const SUBJECT_IDS = [
  "math",
  "science",
  "english",
  "history",
  "cs",
  "languages",
  "economics",
  "psychology",
  "geography",
  "philosophy",
  "art",
  "music",
  "business",
  "engineering",
  "health",
  "statistics",
  "social_studies",
  "other",
] as const;

export type SubjectId = (typeof SUBJECT_IDS)[number];

export function isSubjectId(id: string): id is SubjectId {
  return (SUBJECT_IDS as readonly string[]).includes(id);
}
