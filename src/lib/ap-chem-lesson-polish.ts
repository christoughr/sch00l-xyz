/** Sort, rename, and lightly polish AP Chemistry publisher lessons. */

export const UNIT_ORDS = [1, 2, 3, 4, 5] as const;

export const UNIT_SHORT = [
  "Atomic structure",
  "Bonding & IMF",
  "Reactions",
  "Thermodynamics",
  "Exam prep",
] as const;

const UNIT_KEYWORDS: Record<number, string[]> = {
  1: [
    "electron",
    "orbital",
    "periodic",
    "ionization",
    "atomic radius",
    "photoelectron",
    "pes",
    "aufbau",
    "mole",
    "stoichiometry",
    "molar mass",
  ],
  2: [
    "lewis",
    "vsepr",
    "bond",
    "polar",
    "intermolecular",
    "imf",
    "hydrogen bonding",
    "london",
    "dipole",
    "geometry",
    "hybrid",
  ],
  3: [
    "equilibrium",
    "kinetics",
    "rate law",
    "reaction",
    "oxidation",
    "redox",
    "titration",
    "buffer",
    "acid",
    "base",
    "ph",
    "solubility",
    "electrolysis",
  ],
  4: [
    "enthalpy",
    "entropy",
    "gibbs",
    "thermodynamics",
    "hess",
    "calorimetry",
    "electrochem",
    "galvanic",
    "cell potential",
    "free energy",
  ],
  5: [
    "practice test",
    "mcq",
    "frq",
    "exam",
    "strategy",
    "lab",
    "review",
    "test day",
    "grid",
    "500 questions",
  ],
};

const OPENSTAX_FOOTER =
  "\n\n---\n**Free textbook:** [OpenStax Chemistry 2e](https://openstax.org/books/chemistry-2e/pages/1-introduction) (CC BY).";

export function isPublisherLesson(sourcePdfName: string | null): boolean {
  if (!sourcePdfName) return true;
  return sourcePdfName !== "sch00l-original-oer-aligned";
}

function scoreUnitFallback(text: string): number {
  const t = text.toLowerCase();
  if (/practice|test|exam|mcq|frq|500 question/i.test(t)) return 5;
  if (/enthalpy|entropy|gibbs|electrochem/i.test(t)) return 4;
  if (/equilibrium|kinetics|acid|base|redox/i.test(t)) return 3;
  if (/lewis|vsepr|intermolecular|bonding/i.test(t)) return 2;
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

export function scoreUnit(text: string): number {
  return unitMatchScore(text).ord;
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

export function shortBookLabel(sourcePdfName: string, title: string): string {
  const s = `${sourcePdfName} ${title}`.toLowerCase();
  if (s.includes("5 steps") && s.includes("500")) return "5 Steps: 500 Questions";
  if (s.includes("5 steps")) return "5 Steps to a 5 · 2023";
  if (s.includes("princeton") && s.includes("2023")) return "Princeton Review 2023";
  if (s.includes("princeton")) return "Princeton Review";
  if (s.includes("2026")) return "Barron's 2026";
  if (s.includes("2025")) return "Barron's 2025";
  if (s.includes("2024") && s.includes("comprehensive")) return "Barron's 2024 Comprehensive";
  if (s.includes("2024")) return "Barron's 2024";
  if (s.includes("2022-2023") || s.includes("2022")) return "Barron's 2022–23";
  if (s.includes("barrons") || s.includes("barron")) return "Barron's AP Chem";
  return "AP Chem study guide";
}

export function extractPartNumber(title: string): number {
  const m = title.match(/part\s*(\d+)/i);
  return m ? parseInt(m[1], 10) : 1;
}

export function cleanLessonTitle(unitOrd: number, book: string, part: number): string {
  return `${UNIT_SHORT[unitOrd - 1]} — ${book} · Set ${part}`;
}

export function polishBodyMarkdown(
  body: string,
  cleanTitle: string,
  addOpenStax: boolean
): string {
  let b = body;

  b = b.replace(/^#\s*.+$/m, `# ${cleanTitle}`);
  b = b.replace(/\*\*Publisher source:\*\*[^\n]+\n*/gi, "");
  b = b.replace(
    /### Study notes \(extract[^\)]*\)[^\n]*\n*/gi,
    "### Key ideas\n\n"
  );
  b = b.replace(/\*Digital adaptation for sch00l[^\n]*\*/gi, "");
  b = b.replace(/…/g, "...");
  b = b.replace(/\n{3,}/g, "\n\n");

  if (!b.includes("### Key ideas") && b.length > 80) {
    const intro =
      "### Key ideas\n\nWork through this section with the AI tutor — ask for practice problems, not answer keys.\n\n";
    b = b.replace(/^#\s[^\n]+\n\n/, (m) => m + intro);
  }

  if (addOpenStax && !b.includes("openstax.org")) {
    b += OPENSTAX_FOOTER;
  }

  return b.trim();
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
    const book = shortBookLabel(lesson.source_pdf_name ?? "", lesson.title);
    const part = extractPartNumber(lesson.title);
    const title = cleanLessonTitle(unitOrd, book, part);
    const body = polishBodyMarkdown(lesson.body_markdown, title, true);
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
      body_markdown: polishBodyMarkdown(l.body_markdown, l.title, true),
    }));
}
