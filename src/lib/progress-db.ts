import type { SupabaseClient } from "@supabase/supabase-js";
import { loadProgress, saveProgress } from "./progress";
import type { StudentProgress, SubjectId } from "./types";

export async function fetchProgressFromDb(
  supabase: SupabaseClient,
  userId: string
): Promise<StudentProgress | null> {
  const [statsRes, sessionsRes, masteryRes] = await Promise.all([
    supabase.from("student_stats").select("*").eq("user_id", userId).single(),
    supabase
      .from("study_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("mastery_topics")
      .select("*")
      .eq("user_id", userId)
      .order("last_practiced", { ascending: false })
      .limit(30),
  ]);

  if (statsRes.error && statsRes.error.code !== "PGRST116") return null;

  const stats = statsRes.data;
  const sessions = sessionsRes.data ?? [];
  const mastery = masteryRes.data ?? [];

  return {
    streakDays: stats?.streak_days ?? 0,
    lastStudyDate: stats?.last_study_date ?? null,
    totalMinutes: stats?.total_minutes ?? 0,
    totalSessions: stats?.total_sessions ?? 0,
    sessions: sessions.map((s) => ({
      id: s.id,
      subject: s.subject as SubjectId,
      startedAt: s.started_at,
      endedAt: s.ended_at ?? undefined,
      messageCount: s.message_count,
      minutesStudied: s.minutes_studied,
    })),
    mastery: mastery.map((m) => ({
      subject: m.subject as SubjectId,
      topic: m.topic,
      confidence: m.confidence,
      lastPracticed: m.last_practiced,
    })),
  };
}

export async function syncProgressToDb(
  supabase: SupabaseClient,
  userId: string,
  progress: StudentProgress
): Promise<void> {
  await supabase.from("student_stats").upsert({
    user_id: userId,
    streak_days: progress.streakDays,
    last_study_date: progress.lastStudyDate,
    total_minutes: progress.totalMinutes,
    total_sessions: progress.totalSessions,
    updated_at: new Date().toISOString(),
  });

  const latestSession = progress.sessions[0];
  if (latestSession) {
    await supabase.from("study_sessions").upsert({
      id: latestSession.id,
      user_id: userId,
      subject: latestSession.subject,
      message_count: latestSession.messageCount,
      minutes_studied: latestSession.minutesStudied,
      started_at: latestSession.startedAt,
      ended_at: latestSession.endedAt ?? latestSession.startedAt,
    });
  }

  for (const m of progress.mastery) {
    await supabase.from("mastery_topics").upsert(
      {
        user_id: userId,
        subject: m.subject,
        topic: m.topic,
        confidence: m.confidence,
        last_practiced: m.lastPracticed,
      },
      { onConflict: "user_id,subject,topic" }
    );
  }
}

/** Merge localStorage progress into cloud on first login */
export async function mergeLocalProgressToCloud(
  supabase: SupabaseClient,
  userId: string
): Promise<StudentProgress> {
  const local = loadProgress();
  const remote = await fetchProgressFromDb(supabase, userId);

  const sessions = remote
    ? dedupeSessions([...local.sessions, ...remote.sessions])
    : local.sessions;

  const merged: StudentProgress = remote
    ? {
        streakDays: Math.max(local.streakDays, remote.streakDays),
        lastStudyDate: pickLatestDate(
          local.lastStudyDate,
          remote.lastStudyDate
        ),
        totalMinutes: sessions.reduce((n, s) => n + s.minutesStudied, 0),
        totalSessions: sessions.length,
        sessions,
        mastery: mergeMastery(local.mastery, remote.mastery),
      }
    : local;

  saveProgress(merged);
  await syncProgressToDb(supabase, userId, merged);
  return merged;
}

function pickLatestDate(a: string | null, b: string | null): string | null {
  if (!a) return b;
  if (!b) return a;
  return a > b ? a : b;
}

function dedupeSessions(
  sessions: StudentProgress["sessions"]
): StudentProgress["sessions"] {
  const seen = new Set<string>();
  return sessions.filter((s) => {
    if (seen.has(s.id)) return false;
    seen.add(s.id);
    return true;
  }).slice(0, 50);
}

function mergeMastery(
  a: StudentProgress["mastery"],
  b: StudentProgress["mastery"]
): StudentProgress["mastery"] {
  const map = new Map<string, (typeof a)[0]>();
  for (const m of [...a, ...b]) {
    const key = `${m.subject}:${m.topic.toLowerCase()}`;
    const existing = map.get(key);
    if (!existing || m.confidence > existing.confidence) {
      map.set(key, m);
    }
  }
  return Array.from(map.values()).slice(0, 30);
}
