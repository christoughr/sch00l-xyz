import type { SubjectId } from "./subject-ids";
import { STORAGE_KEYS } from "./storage-keys";

export type SessionMemory = {
  id: string;
  subject: SubjectId;
  topic: string;
  summary: string;
  liftLabel?: string;
  createdAt: string;
};

const MAX = 12;

export function loadSessionMemories(): SessionMemory[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(
      localStorage.getItem(STORAGE_KEYS.sessionMemory) ?? "[]"
    ) as SessionMemory[];
  } catch {
    return [];
  }
}

export function saveSessionMemory(
  entry: Omit<SessionMemory, "id" | "createdAt"> & {
    createdAt?: string;
  }
): SessionMemory {
  const item: SessionMemory = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: entry.createdAt ?? new Date().toISOString(),
  };
  const list = [item, ...loadSessionMemories()].slice(0, MAX);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.sessionMemory, JSON.stringify(list));
  }
  return item;
}

/** Summaries for tutor prompt (newest first, same subject optional) */
export function recentMemorySummaries(opts?: {
  subject?: SubjectId;
  limit?: number;
}): string[] {
  let list = loadSessionMemories();
  if (opts?.subject) {
    list = list.filter((m) => m.subject === opts.subject);
  }
  return list
    .slice(0, opts?.limit ?? 4)
    .map((m) => {
      const lift = m.liftLabel ? ` (${m.liftLabel})` : "";
      return `${m.topic}${lift}: ${m.summary}`;
    });
}
