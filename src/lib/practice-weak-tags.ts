const KEY = "sch00l_practice_weak_tags";

export type PracticeWeakEntry = {
  skillTag: string;
  testId: string;
  testLabel: string;
  studyTrackId?: string;
  at: string;
};

export function savePracticeWeakTags(
  testId: string,
  testLabel: string,
  weakTags: string[],
  studyTrackId?: string
): void {
  if (typeof window === "undefined" || weakTags.length === 0) return;
  const existing = loadPracticeWeakTags();
  const now = new Date().toISOString();
  for (const tag of weakTags) {
    existing.unshift({
      skillTag: tag,
      testId,
      testLabel,
      studyTrackId,
      at: now,
    });
  }
  const deduped = existing.slice(0, 30);
  localStorage.setItem(KEY, JSON.stringify(deduped));
}

export function loadPracticeWeakTags(): PracticeWeakEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PracticeWeakEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function latestPracticeWeakTopic(): {
  topic: string;
  studyTrackId?: string;
} | null {
  const tags = loadPracticeWeakTags();
  if (tags.length === 0) return null;
  const latest = tags[0];
  return {
    topic: `${latest.testLabel} — review ${latest.skillTag}`,
    studyTrackId: latest.studyTrackId,
  };
}

/** Maps practice test IDs to default study track for deep links. */
export const PRACTICE_TO_TRACK: Record<string, string> = {
  "sat-digital": "sat-math",
  act: "act-math",
  "ap-bio-mcq": "ap-bio",
  "ib-sl-math": "ib-math-aa-sl",
  "igcse-math": "cam-igcse-math",
  "a-level-math": "uk-alevel-math",
  "jee-main": "in-jee-main",
  neet: "in-neet",
  "gaokao-math": "cn-gaokao-math",
  "mcat-sample": "mcat-bb",
  "lsat-sample": "lsat",
  "gmat-quant": "gmat",
  "gre-verbal": "gre-verbal",
  "nclex-rn": "nclex-rn",
  "hsc-nsw": "au-hsc-math",
};
