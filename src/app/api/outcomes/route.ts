import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { OUTCOMES_DEMO } from "@/lib/outcomes-demo";
import { NextResponse } from "next/server";

export async function GET() {
  const admin = createAdminClient();
  const supabase = await createClient();

  if (!admin && !supabase) {
    return NextResponse.json(OUTCOMES_DEMO);
  }

  const client = admin ?? supabase!;
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [eventsRes, quizRes, sessionsRes] = await Promise.all([
    client
      .from("analytics_events")
      .select("event_name, session_id")
      .gte("created_at", since.toISOString())
      .in("event_name", ["session_complete", "session_setup"]),
    client
      .from("quiz_results")
      .select("user_id, phase, score, total, created_at")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false })
      .limit(500),
    client
      .from("study_sessions")
      .select("minutes_studied, user_id")
      .gte("started_at", since.toISOString()),
  ]);

  const completedSessions =
    eventsRes.data?.filter((e) => e.event_name === "session_complete").length ?? 0;

  const uniqueStudiers = new Set(
    eventsRes.data?.map((e) => e.session_id) ?? []
  ).size;

  let averageLiftPercent: number | null = null;
  const quizzes = quizRes.data ?? [];
  const byUser = new Map<string, { pre?: number; post?: number }>();
  for (const q of quizzes) {
    const key = q.user_id ?? "anon";
    const pct = Math.round((q.score / q.total) * 100);
    const entry = byUser.get(key) ?? {};
    if (q.phase === "pre" && entry.pre === undefined) entry.pre = pct;
    if (q.phase === "post" && entry.post === undefined) entry.post = pct;
    byUser.set(key, entry);
  }
  const lifts: number[] = [];
  for (const { pre, post } of byUser.values()) {
    if (pre !== undefined && post !== undefined) lifts.push(post - pre);
  }
  if (lifts.length) {
    averageLiftPercent = Math.round(
      lifts.reduce((a, b) => a + b, 0) / lifts.length
    );
  }

  const totalStudyMinutes =
    sessionsRes.data?.reduce((acc, s) => acc + (s.minutes_studied ?? 0), 0) ?? 0;

  return NextResponse.json({
    mode: "cloud" as const,
    periodDays: 30,
    sessionsCompleted: completedSessions,
    uniqueStudiers,
    averageLiftPercent,
    totalStudyMinutes,
    liftSampleSize: lifts.length,
  });
}
