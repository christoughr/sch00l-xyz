import type { Flashcard, SubjectId } from "./types";

const STORAGE_KEY = "sch00l_flashcards_v1";

export function loadFlashcards(): Flashcard[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Flashcard[]) : [];
  } catch {
    return [];
  }
}

export function saveFlashcards(cards: Flashcard[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

export function addFlashcards(cards: Omit<Flashcard, "id" | "createdAt">[]): Flashcard[] {
  const existing = loadFlashcards();
  const now = new Date().toISOString();
  const added: Flashcard[] = cards.map((c) => ({
    ...c,
    id: crypto.randomUUID(),
    createdAt: now,
  }));
  const merged = [...added, ...existing];
  saveFlashcards(merged);
  return merged;
}

/** Simplified SM-2: quality 0–5 */
export function reviewCard(
  card: Flashcard,
  quality: number
): Flashcard {
  let { easeFactor, intervalDays, repetitions } = card;

  if (quality < 3) {
    repetitions = 0;
    intervalDays = 1;
  } else {
    if (repetitions === 0) intervalDays = 1;
    else if (repetitions === 1) intervalDays = 3;
    else intervalDays = Math.round(intervalDays * easeFactor);
    repetitions += 1;
    easeFactor = Math.max(
      1.3,
      easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );
  }

  const next = new Date();
  next.setDate(next.getDate() + intervalDays);

  return {
    ...card,
    easeFactor,
    intervalDays,
    repetitions,
    nextReviewAt: next.toISOString(),
  };
}

export function dueFlashcards(cards: Flashcard[]): Flashcard[] {
  const now = Date.now();
  return cards.filter((c) => new Date(c.nextReviewAt).getTime() <= now);
}

export function defaultCardFields(subject: SubjectId) {
  return {
    subject,
    easeFactor: 2.5,
    intervalDays: 0,
    repetitions: 0,
    nextReviewAt: new Date().toISOString(),
  };
}
