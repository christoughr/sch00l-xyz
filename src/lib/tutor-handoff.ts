import type { SubjectId } from "./types";

const REQUESTS_KEY = "sch00l_tutor_requests_v1";

export type TutorRequestLocal = {
  id: string;
  studentEmail?: string;
  subject: SubjectId;
  topic?: string;
  sessionSummary: string;
  preScore?: number;
  postScore?: number;
  urgency: "normal" | "before_test";
  createdAt: string;
};

export function saveTutorRequestLocal(
  req: Omit<TutorRequestLocal, "id" | "createdAt">
): TutorRequestLocal {
  const entry: TutorRequestLocal = {
    ...req,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const list = loadTutorRequestsLocal();
  list.unshift(entry);
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(list.slice(0, 20)));
  return entry;
}

export function loadTutorRequestsLocal(): TutorRequestLocal[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(REQUESTS_KEY) ?? "[]") as TutorRequestLocal[];
  } catch {
    return [];
  }
}

const APPLICATIONS_KEY = "sch00l_tutor_applications_v1";

export type TutorApplicationLocal = {
  id: string;
  email: string;
  displayName: string;
  subjects: string[];
  bio?: string;
  credentials?: string;
  createdAt: string;
};

export function saveTutorApplicationLocal(
  app: Omit<TutorApplicationLocal, "id" | "createdAt">
): TutorApplicationLocal {
  const entry: TutorApplicationLocal = {
    ...app,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const list = loadTutorApplicationsLocal();
  list.unshift(entry);
  localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(list.slice(0, 20)));
  return entry;
}

export function loadTutorApplicationsLocal(): TutorApplicationLocal[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(
      localStorage.getItem(APPLICATIONS_KEY) ?? "[]"
    ) as TutorApplicationLocal[];
  } catch {
    return [];
  }
}

export function buildSessionHandoffSummary(
  transcript: string,
  topic?: string
): string {
  const lines = transcript
    .split("\n")
    .filter(Boolean)
    .slice(-10);
  const header = topic?.trim() ? `Topic: ${topic.trim()}\n\n` : "";
  return `${header}Recent AI session:\n${lines.join("\n")}`.slice(0, 2500);
}
