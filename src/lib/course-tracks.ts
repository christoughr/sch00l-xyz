/** Maps study picker tracks to course_lessons track_id in Supabase. */

const COURSE_TRACK_ALIASES: Record<string, string> = {
  "sat-reading": "sat-math",
};

const COURSE_TRACK_HINTS: Record<string, string> = {
  "sat-reading":
    "Reading & Writing lessons live under SAT Math → unit 3 (same Digital SAT course).",
};

export function resolveCourseTrackId(studyTrackId: string): string {
  return COURSE_TRACK_ALIASES[studyTrackId] ?? studyTrackId;
}

export function getCourseTrackHint(studyTrackId: string): string | null {
  return COURSE_TRACK_HINTS[studyTrackId] ?? null;
}

export function hasCourseTrackAlias(studyTrackId: string): boolean {
  return studyTrackId in COURSE_TRACK_ALIASES;
}
