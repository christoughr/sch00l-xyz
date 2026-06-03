import type { Flashcard } from "./types";

export function mapCloudCard(row: Record<string, unknown>): Flashcard {
  return {
    id: row.id as string,
    subject: row.subject as Flashcard["subject"],
    front: row.front as string,
    back: row.back as string,
    easeFactor: (row.ease_factor as number) ?? 2.5,
    intervalDays: (row.interval_days as number) ?? 0,
    repetitions: (row.repetitions as number) ?? 0,
    nextReviewAt: row.next_review_at as string,
    createdAt: row.created_at as string,
  };
}
