import { createAdminClient } from "@/lib/supabase/admin";
import { aggregateLift } from "@/lib/quiz-lift";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const apiKey = process.env.SCH00L_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API not enabled" }, { status: 503 });
  }

  if (req.headers.get("authorization") !== `Bearer ${apiKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: userId } = await params;
  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const [stats, mastery, quizzes] = await Promise.all([
    admin.from("student_stats").select("*").eq("user_id", userId).single(),
    admin
      .from("mastery_topics")
      .select("subject, topic, confidence, last_practiced")
      .eq("user_id", userId)
      .order("confidence", { ascending: false }),
    admin
      .from("quiz_results")
      .select("phase, score, total, session_id, skipped, subject, topic, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const userQuizzes = quizzes.data ?? [];
  const { lifts, averageLiftPercent } = aggregateLift(
    userQuizzes.map((q) => ({
      session_id: q.session_id,
      user_id: userId,
      phase: q.phase,
      score: q.score,
      total: q.total,
      skipped: q.skipped,
    }))
  );
  const learningLiftPercent =
    lifts.length > 0 ? (averageLiftPercent ?? lifts[0]) : null;

  return NextResponse.json({
    userId,
    stats: stats.data ?? null,
    mastery: mastery.data ?? [],
    learningLiftPercent,
    generatedAt: new Date().toISOString(),
  });
}
