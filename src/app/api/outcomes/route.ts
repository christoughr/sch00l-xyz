import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { OUTCOMES_DEMO } from "@/lib/outcomes-demo";
import { aggregateLift } from "@/lib/quiz-lift";
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
      .select("user_id, phase, score, total, session_id, skipped, created_at")
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

  const sessionsTracked = new Set(
    eventsRes.data
      ?.filter((e) => e.event_name === "session_complete" && e.session_id)
      .map((e) => e.session_id) ?? []
  ).size;

  const quizzes = quizRes.data ?? [];
  const { lifts, averageLiftPercent } = aggregateLift(
    quizzes.map((q) => ({
      session_id: (q as { session_id?: string }).session_id,
      user_id: q.user_id,
      phase: q.phase,
      score: q.score,
      total: q.total,
      skipped: (q as { skipped?: boolean }).skipped,
    }))
  );

  const totalStudyMinutes =
    sessionsRes.data?.reduce((acc, s) => acc + (s.minutes_studied ?? 0), 0) ?? 0;

  return NextResponse.json({
    mode: "cloud" as const,
    periodDays: 30,
    sessionsCompleted: completedSessions,
    sessionsTracked,
    averageLiftPercent,
    totalStudyMinutes,
    liftSampleSize: lifts.length,
  });
}
