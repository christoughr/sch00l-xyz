import { loadLocalConsent } from "./compliance";
import { loadQuizResultsLocal } from "./quiz-local";
import { loadProgress } from "./progress";
import { loadFlashcards } from "./flashcards-local";
import { loadTutorApplicationsLocal, loadTutorRequestsLocal } from "./tutor-handoff";
import { STORAGE_KEYS } from "./storage-keys";

export function loadWaitlistLocal(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(
      localStorage.getItem(STORAGE_KEYS.waitlist) ?? "[]"
    ) as string[];
  } catch {
    return [];
  }
}

function readRaw(key: string): unknown {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
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
      ageConsent: loadLocalConsent(),
      freeTier: readRaw(STORAGE_KEYS.dailySessions),
      proLocal: readRaw(STORAGE_KEYS.proBeta),
      analyticsSession: readRaw(STORAGE_KEYS.analyticsSession),
      sessionMemory: readRaw(STORAGE_KEYS.sessionMemory),
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
