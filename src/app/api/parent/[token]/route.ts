import { createAdminClient } from "@/lib/supabase/admin";
import { aggregateLift } from "@/lib/quiz-lift";
import { NextResponse } from "next/server";

const MIGRATION = "010_epics_b_through_h.sql";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { data: access, error } = await admin
    .from("parent_access")
    .select("id, student_user_id, created_at")
    .eq("token", token)
    .single();

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json(
        { error: "Not available", migrationRequired: MIGRATION },
        { status: 503 }
      );
    }
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Invalid or expired link" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const studentId = access.student_user_id;

  const [profileRes, statsRes, quizzesRes, assignmentsRes] = await Promise.all([
    admin
      .from("profiles")
      .select("display_name, email")
      .eq("id", studentId)
      .single(),
    admin.from("student_stats").select("*").eq("user_id", studentId).maybeSingle(),
    admin
      .from("quiz_results")
      .select("phase, score, total, session_id, skipped, created_at")
      .eq("user_id", studentId)
      .order("created_at", { ascending: false })
      .limit(50),
    admin
      .from("classroom_members")
      .select("classroom_id, classrooms(name)")
      .eq("user_id", studentId),
  ]);

  const quizzes = quizzesRes.data ?? [];
  const { averageLiftPercent, lifts } = aggregateLift(
    quizzes.map((q) => ({
      session_id: q.session_id,
      user_id: studentId,
      phase: q.phase,
      score: q.score,
      total: q.total,
      skipped: q.skipped,
    }))
  );

  const classrooms = (assignmentsRes.data ?? []).map((m) => {
    const c = m.classrooms as { name?: string } | { name?: string }[] | null;
    const name = Array.isArray(c) ? c[0]?.name : c?.name;
    return { classroomId: m.classroom_id, name: name ?? "Class" };
  });

  return NextResponse.json({
    readOnly: true,
    student: {
      displayName: profileRes.data?.display_name ?? "Student",
      emailMasked: maskEmail(profileRes.data?.email),
    },
    stats: {
      streakDays: statsRes.data?.streak_days ?? 0,
      totalMinutes: statsRes.data?.total_minutes ?? 0,
      totalSessions: statsRes.data?.total_sessions ?? 0,
      averageLiftPercent,
      liftSampleSize: lifts.length,
    },
    classrooms,
    linkCreatedAt: access.created_at,
  });
}

function maskEmail(email?: string | null): string {
  if (!email) return "—";
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const visible = local.slice(0, 2);
  return `${visible}***@${domain}`;
}
