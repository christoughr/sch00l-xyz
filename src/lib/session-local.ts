import { notifyFlashcardsUpdated } from "./flashcards-events";
import { STORAGE_KEYS } from "./storage-keys";

/** Cleared on sign-out so the next user does not see prior session data. */
export const SESSION_LOCAL_KEYS = [
  STORAGE_KEYS.flashcards,
  STORAGE_KEYS.progress,
  STORAGE_KEYS.quizResults,
  STORAGE_KEYS.sessionMemory,
  STORAGE_KEYS.dailySessions,
  STORAGE_KEYS.studySessionId,
  STORAGE_KEYS.tutorRequests,
  STORAGE_KEYS.tutorApplications,
] as const;

export function clearSessionLocalData(): void {
  if (typeof window === "undefined") return;
  for (const key of SESSION_LOCAL_KEYS) {
    localStorage.removeItem(key);
  }
  sessionStorage.removeItem(STORAGE_KEYS.pendingCheckout);
  notifyFlashcardsUpdated();
}
