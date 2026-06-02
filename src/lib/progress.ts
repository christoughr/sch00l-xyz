import type { MasteryTopic, StudentProgress, StudySession, SubjectId } from "./types";

const STORAGE_KEY = "sch00l_progress_v1";

export const EMPTY_PROGRESS: StudentProgress = {
  streakDays: 0,
  lastStudyDate: null,
  totalMinutes: 0,
  totalSessions: 0,
  sessions: [],
  mastery: [],
};

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function loadProgress(): StudentProgress {
  if (typeof window === "undefined") return EMPTY_PROGRESS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_PROGRESS };
    return { ...EMPTY_PROGRESS, ...JSON.parse(raw) } as StudentProgress;
  } catch {
    return { ...EMPTY_PROGRESS };
  }
}

export function saveProgress(progress: StudentProgress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function recordStudyActivity(
  progress: StudentProgress,
  opts: { subject: SubjectId; minutes: number; messageCount: number }
): StudentProgress {
  const today = todayKey();
  let streak = progress.streakDays;

  if (progress.lastStudyDate === today) {
    // same day
  } else if (progress.lastStudyDate === yesterdayKey()) {
    streak += 1;
  } else {
    streak = 1;
  }

  const session: StudySession = {
    id: crypto.randomUUID(),
    subject: opts.subject,
    startedAt: new Date().toISOString(),
    endedAt: new Date().toISOString(),
    messageCount: opts.messageCount,
    minutesStudied: opts.minutes,
  };

  return {
    ...progress,
    streakDays: streak,
    lastStudyDate: today,
    totalMinutes: progress.totalMinutes + opts.minutes,
    totalSessions: progress.totalSessions + 1,
    sessions: [session, ...progress.sessions].slice(0, 50),
  };
}

export function bumpMastery(
  progress: StudentProgress,
  subject: SubjectId,
  topic: string,
  delta = 8
): StudentProgress {
  const normalized = topic.trim().slice(0, 80);
  if (!normalized) return progress;

  const existing = progress.mastery.find(
    (m) => m.subject === subject && m.topic.toLowerCase() === normalized.toLowerCase()
  );

  let mastery: MasteryTopic[];
  if (existing) {
    mastery = progress.mastery.map((m) =>
      m === existing
        ? {
            ...m,
            confidence: Math.min(100, m.confidence + delta),
            lastPracticed: new Date().toISOString(),
          }
        : m
    );
  } else {
    mastery = [
      {
        subject,
        topic: normalized,
        confidence: Math.min(100, 20 + delta),
        lastPracticed: new Date().toISOString(),
      },
      ...progress.mastery,
    ].slice(0, 30);
  }

  return { ...progress, mastery };
}
