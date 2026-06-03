const KEY = "sch00l_study_session_id";

export function getOrCreateStudySessionId(): string {
  if (typeof window === "undefined") return "server";
  let id = sessionStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(KEY, id);
  }
  return id;
}

export function clearStudySessionId(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
}

export function rotateStudySessionId(): string {
  if (typeof window === "undefined") return crypto.randomUUID();
  const id = crypto.randomUUID();
  sessionStorage.setItem(KEY, id);
  return id;
}
