import { loadQuizResultsLocal } from "./quiz-local";
import { loadProgress } from "./progress";
import { loadFlashcards } from "./flashcards-local";
import { loadTutorApplicationsLocal, loadTutorRequestsLocal } from "./tutor-handoff";

const WAITLIST_KEY = "sch00l_waitlist_pending";

export function loadWaitlistLocal(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(WAITLIST_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

export function exportLocalDataJson(): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      waitlist: loadWaitlistLocal(),
      tutorRequests: loadTutorRequestsLocal(),
      tutorApplications: loadTutorApplicationsLocal(),
      progress: loadProgress(),
      quizResults: loadQuizResultsLocal(),
      flashcards: loadFlashcards(),
    },
    null,
    2
  );
}

export function downloadLocalExport(): void {
  const blob = new Blob([exportLocalDataJson()], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sch00l-local-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
