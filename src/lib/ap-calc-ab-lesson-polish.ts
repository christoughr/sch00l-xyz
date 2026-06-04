/** Sort and polish AP Calculus AB publisher lessons. */

import {
  minimalLessonTitle,
  polishBodyMarkdown as polishBody,
} from "./lesson-polish-shared";

export const UNIT_ORDS = [1, 2, 3, 4, 5] as const;

const UNIT_KEYWORDS: Record<number, string[]> = {
  1: [
    "limit",
    "continuity",
    "asymptote",
    "squeeze",
    "one-sided",
    "infinite",
    "removable",
  ],
  2: [
    "derivative",
    "differentiation",
    "chain rule",
    "product rule",
    "quotient",
    "implicit",
    "related rate",
    "slope",
  ],
  3: [
    "optimization",
    "linearization",
    "l'hopital",
    "mean value",
    "increasing",
    "concavity",
    "critical point",
    "extrema",
    "motion",
  ],
  4: [
    "integral",
    "integration",
    "riemann",
    "antiderivative",
    "substitution",
    "area",
    "accumulation",
    "ftc",
    "fundamental theorem",
  ],
  5: [
    "practice",
    "exam",
    "frq",
    "mcq",
    "calculator",
    "review",
    "strategy",
    "grid",
  ],
};

export function isPublisherLesson(sourcePdfName: string | null): boolean {
  if (!sourcePdfName) return true;
  return sourcePdfName !== "sch00l-original-oer-aligned";
}

function scoreUnitFallback(text: string): number {
  const t = text.toLowerCase();
  if (/practice|exam|frq|mcq|review/i.test(t)) return 5;
  if (/integral|riemann|accumulation|area under/i.test(t)) return 4;
  if (/optimization|related rate|linearization/i.test(t)) return 3;
  if (/derivative|differentiat|chain rule/i.test(t)) return 2;
  return 1;
}

export function unitMatchScore(text: string): { ord: number; score: number } {
  const t = text.toLowerCase();
  let best = 1;
  let bestScore = 0;
  for (const ord of UNIT_ORDS) {
    const score = UNIT_KEYWORDS[ord].filter((k) => t.includes(k)).length;
    if (score > bestScore) {
      bestScore = score;
      best = ord;
    }
  }
  if (bestScore === 0) {
    return { ord: scoreUnitFallback(text), score: 0 };
  }
  return { ord: best, score: bestScore };
}

export function publisherTargets(count: number): Record<number, number> {
  const base = Math.floor(count / UNIT_ORDS.length);
  const rem = count % UNIT_ORDS.length;
  const targets: Record<number, number> = {};
  UNIT_ORDS.forEach((ord, i) => {
    targets[ord] = base + (i < rem ? 1 : 0);
  });
  return targets;
}

function assignBalancedUnit(
  preferred: number,
  counts: Record<number, number>,
  targets: Record<number, number>
): number {
  if (counts[preferred] < targets[preferred]) {
    counts[preferred]++;
    return preferred;
  }
  let pick = preferred;
  let mostRoom = -1;
  for (const ord of UNIT_ORDS) {
    const room = targets[ord] - counts[ord];
    if (room > mostRoom) {
      mostRoom = room;
      pick = ord;
    }
  }
  counts[pick]++;
  return pick;
}

export function polishBodyMarkdown(body: string): string {
  return polishBody(body, true);
}

export type LessonRow = {
  id: string;
  unit_id: string;
  unit_ord: number;
  ord: number;
  title: string;
  body_markdown: string;
  source_pdf_name: string | null;
};

export type LessonUpdate = {
  id: string;
  unit_id: string;
  unit_ord: number;
  ord: number;
  title: string;
  body_markdown: string;
};

export function planPublisherLessonUpdates(
  lessons: LessonRow[],
  unitIdByOrd: Record<number, string>
): LessonUpdate[] {
  const publisher = lessons.filter((l) =>
    isPublisherLesson(l.source_pdf_name)
  );
  const targets = publisherTargets(publisher.length);
  const assignedCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const lessonOrd: Record<number, number> = { 1: 3, 2: 3, 3: 3, 4: 3, 5: 3 };

  const ranked = publisher
    .map((lesson) => {
      const text = `${lesson.title} ${lesson.body_markdown}`;
      const { ord, score } = unitMatchScore(text);
      return { lesson, preferred: ord, score };
    })
    .sort((a, b) => b.score - a.score || a.lesson.ord - b.lesson.ord);

  const planned = ranked.map(({ lesson, preferred }) => {
    const unitOrd = assignBalancedUnit(preferred, assignedCounts, targets);
    lessonOrd[unitOrd] = (lessonOrd[unitOrd] ?? 3) + 1;
    const title = minimalLessonTitle(lessonOrd[unitOrd]);
    const body = polishBodyMarkdown(lesson.body_markdown);
    return {
      lesson,
      unitOrd,
      unit_id: unitIdByOrd[unitOrd],
      ord: lessonOrd[unitOrd],
      title,
      body_markdown: body,
    };
  });

  return planned.map((p) => ({
    id: p.lesson.id,
    unit_id: p.unit_id,
    unit_ord: p.unitOrd,
    ord: p.ord,
    title: p.title,
    body_markdown: p.body_markdown,
  }));
}

export function planOpenStaxPass(lessons: LessonRow[]): LessonUpdate[] {
  return lessons
    .filter((l) => l.source_pdf_name === "sch00l-original-oer-aligned")
    .map((l) => ({
      id: l.id,
      unit_id: l.unit_id,
      unit_ord: l.unit_ord,
      ord: l.ord,
      title: l.title,
      body_markdown: polishBodyMarkdown(l.body_markdown),
    }));
}
