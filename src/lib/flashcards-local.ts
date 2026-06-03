import type { Flashcard, SubjectId } from "./types";
import { notifyFlashcardsUpdated } from "./flashcards-events";
import { mapCloudCard } from "./flashcards-map";
import { STORAGE_KEYS } from "./storage-keys";

const STORAGE_KEY = STORAGE_KEYS.flashcards;

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
  notifyFlashcardsUpdated();
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

/** Merge cloud API rows into localStorage (Nav badge + offline review stay in sync) */
export function mergeCloudFlashcards(
  rows: Record<string, unknown>[] | Flashcard[]
): number {
  if (typeof window === "undefined" || !rows.length) return 0;
  const mapped = rows.map((r) =>
    "front" in r && typeof r.front === "string"
      ? (r as Flashcard)
      : mapCloudCard(r as Record<string, unknown>)
  );
  const existing = loadFlashcards();
  const byId = new Map(existing.map((c) => [c.id, c]));
  for (const c of mapped) byId.set(c.id, c);
  const merged = Array.from(byId.values()).sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  saveFlashcards(merged);
  notifyFlashcardsUpdated();
  return mapped.length;
}
