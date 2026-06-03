export const FLASHCARDS_UPDATED = "sch00l:flashcards-updated";

export function notifyFlashcardsUpdated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(FLASHCARDS_UPDATED));
}
