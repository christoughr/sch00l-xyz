import { createAdminClient } from "@/lib/supabase/admin";
import { aggregateLift } from "@/lib/quiz-lift";
import { NextResponse } from "next/server";

/** B2B read-only summary — pass Authorization: Bearer SCH00L_API_KEY */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const apiKey = process.env.SCH00L_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API not enabled" }, { status: 503 });
  }

  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${apiKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const { data: classroom } = await admin
    .from("classrooms")
    .select("id, name")
    .eq("id", id)
    .single();

  if (!classroom) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: members } = await admin
    .from("classroom_members")
    .select("user_id")
    .eq("classroom_id", id);

  const userIds = (members ?? []).map((m) => m.user_id);

  let avgLift: number | null = null;
  if (userIds.length > 0) {
    const { data: quizzes } = await admin
      .from("quiz_results")
      .select("user_id, phase, score, total, session_id, skipped")
      .in("user_id", userIds);

    const perStudentLifts: number[] = [];
    for (const uid of userIds) {
      const uq = (quizzes ?? []).filter((q) => q.user_id === uid);
      const { lifts } = aggregateLift(
        uq.map((q) => ({
          session_id: q.session_id,
          user_id: q.user_id,
          phase: q.phase,
          score: q.score,
          total: q.total,
          skipped: q.skipped,
        }))
      );
      if (lifts.length) {
        perStudentLifts.push(
          Math.round(lifts.reduce((a, b) => a + b, 0) / lifts.length)
        );
      }
    }
    if (perStudentLifts.length) {
      avgLift = Math.round(
        perStudentLifts.reduce((a, b) => a + b, 0) / perStudentLifts.length
      );
    }
  }

  const { data: stats } = await admin
    .from("student_stats")
    .select("total_minutes")
    .in("user_id", userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"]);

  const totalMinutes = (stats ?? []).reduce((a, s) => a + (s.total_minutes ?? 0), 0);

  return NextResponse.json({
    classroom,
    studentCount: userIds.length,
    totalStudyMinutes: totalMinutes,
    averageLearningLiftPercent: avgLift,
    generatedAt: new Date().toISOString(),
  });
}
