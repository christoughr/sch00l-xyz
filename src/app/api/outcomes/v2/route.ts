import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { aggregateLift } from "@/lib/quiz-lift";
import { NextResponse } from "next/server";

const MIGRATION = "010_epics_b_through_h.sql";

export async function GET() {
  const admin = createAdminClient();
  const supabase = await createClient();
  const client = admin ?? supabase;

  if (!client) {
    return NextResponse.json({
      mode: "demo" as const,
      periodDays: 30,
      aggregates: {},
    });
  }

  const since = new Date();
  since.setDate(since.getDate() - 30);
  const sinceIso = since.toISOString();

  const [
    sessionsRes,
    quizRes,
    practiceRes,
    battlesRes,
    plagiarismRes,
    practiceTestsRes,
  ] = await Promise.all([
    client
      .from("study_sessions")
      .select("minutes_studied")
      .gte("started_at", sinceIso),
    client
      .from("quiz_results")
      .select("user_id, phase, score, total, session_id, skipped, created_at")
      .gte("created_at", sinceIso)
      .limit(1000),
    client
      .from("practice_attempts")
      .select("score, total, ended_at")
      .gte("started_at", sinceIso)
      .not("ended_at", "is", null),
    client
      .from("live_battles")
      .select("id, status")
      .gte("created_at", sinceIso),
    client
      .from("plagiarism_checks")
      .select("flagged, similarity_score")
      .gte("created_at", sinceIso),
    client.from("practice_tests").select("id", { count: "exact", head: true }),
  ]);

  const missingTable = [
    sessionsRes.error,
    quizRes.error,
    practiceRes.error,
    battlesRes.error,
  ].find((e) => e?.code === "42P01");

  if (missingTable) {
    return NextResponse.json({
      mode: "partial" as const,
      migrationRequired: MIGRATION,
      periodDays: 30,
      aggregates: buildFromQuizzesOnly(quizRes.data ?? []),
    });
  }

  const quizzes = quizRes.data ?? [];
  const { averageLiftPercent, lifts } = aggregateLift(
    quizzes.map((q) => ({
      session_id: (q as { session_id?: string }).session_id,
      user_id: (q as { user_id: string }).user_id,
      phase: q.phase,
      score: q.score,
      total: q.total,
      skipped: (q as { skipped?: boolean }).skipped,
    }))
  );

  const totalStudyMinutes =
    sessionsRes.data?.reduce((acc, s) => acc + (s.minutes_studied ?? 0), 0) ?? 0;

  const practiceAttempts = practiceRes.data ?? [];
  const practiceScores = practiceAttempts
    .filter((a) => a.total && a.total > 0 && a.score != null)
    .map((a) => Math.round(((a.score ?? 0) / (a.total ?? 1)) * 100));
  const avgPracticePercent =
    practiceScores.length > 0
      ? Math.round(
          practiceScores.reduce((a, b) => a + b, 0) / practiceScores.length
        )
      : null;

  const battles = battlesRes.data ?? [];
  const plagiarism = plagiarismRes.data ?? [];

  const uniqueLearners = new Set(
    quizzes.map((q) => (q as { user_id: string }).user_id)
  ).size;

  return NextResponse.json({
    mode: "anonymized" as const,
    periodDays: 30,
    aggregates: {
      uniqueLearners,
      totalStudyMinutes,
      quizAttempts: quizzes.length,
      averageLiftPercent,
      liftSampleSize: lifts.length,
      practiceAttemptsFinished: practiceAttempts.length,
      averagePracticePercent: avgPracticePercent,
      liveBattlesCreated: battles.length,
      liveBattlesFinished: battles.filter((b) => b.status === "finished").length,
      plagiarismChecks: plagiarism.length,
      plagiarismFlagged: plagiarism.filter((p) => p.flagged).length,
      avgPlagiarismScore:
        plagiarism.length > 0
          ? Math.round(
              (plagiarism.reduce(
                (acc, p) => acc + Number(p.similarity_score ?? 0),
                0
              ) /
                plagiarism.length) *
                100
            ) / 100
          : null,
      practiceTestCatalogSize: practiceTestsRes.count ?? 0,
    },
  });
}

function buildFromQuizzesOnly(
  quizzes: {
    user_id: string;
    phase: string;
    score: number;
    total: number;
    session_id?: string;
    skipped?: boolean;
  }[]
) {
  const { averageLiftPercent, lifts } = aggregateLift(
    quizzes.map((q) => ({
      session_id: q.session_id,
      user_id: q.user_id,
      phase: q.phase,
      score: q.score,
      total: q.total,
      skipped: q.skipped,
    }))
  );
  return {
    uniqueLearners: new Set(quizzes.map((q) => q.user_id)).size,
    quizAttempts: quizzes.length,
    averageLiftPercent,
    liftSampleSize: lifts.length,
  };
}
