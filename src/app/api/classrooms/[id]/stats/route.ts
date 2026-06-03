import { createClient } from "@/lib/supabase/server";
import { isRosterStudent } from "@/lib/classroom-roster";
import { aggregateLift } from "@/lib/quiz-lift";
import { isTeacherEmail } from "@/lib/teacher";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: classroomId } = await params;
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: classroom } = await supabase
    .from("classrooms")
    .select("id, name, join_code, teacher_id")
    .eq("id", classroomId)
    .single();

  if (!classroom) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isOwner =
    classroom.teacher_id === user.id || isTeacherEmail(user.email);
  if (!isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: members } = await supabase
    .from("classroom_members")
    .select("user_id, joined_at")
    .eq("classroom_id", classroomId);

  const allMemberIds = (members ?? []).map((m) => m.user_id);
  const { data: memberProfiles } =
    allMemberIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, email, role")
          .in("id", allMemberIds)
      : { data: [] as { id: string; email: string | null; role: string }[] };

  const userIds = allMemberIds.filter((uid) => {
    const p = memberProfiles?.find((x) => x.id === uid);
    return isRosterStudent({
      userId: uid,
      teacherId: classroom.teacher_id,
      email: p?.email,
      role: p?.role,
    });
  });

  if (userIds.length === 0) {
    return NextResponse.json({
      classroom,
      summary: {
        studentCount: 0,
        totalMinutes: 0,
        avgStreak: 0,
        avgQuizLift: null,
      },
      students: [],
    });
  }

  const [profiles, stats, quizzes] = await Promise.all([
    supabase.from("profiles").select("id, email, display_name").in("id", userIds),
    supabase.from("student_stats").select("*").in("user_id", userIds),
    supabase
      .from("quiz_results")
      .select("user_id, phase, score, total, session_id, skipped, created_at")
      .in("user_id", userIds)
      .order("created_at", { ascending: false }),
  ]);

  const statsMap = new Map((stats.data ?? []).map((s) => [s.user_id, s]));

  const students = userIds.map((uid) => {
    const profile = profiles.data?.find((p) => p.id === uid);
    const st = statsMap.get(uid);
    const userQuizzes = (quizzes.data ?? []).filter((q) => q.user_id === uid);
    const { lifts } = aggregateLift(
      userQuizzes.map((q) => ({
        session_id: q.session_id,
        user_id: q.user_id,
        phase: q.phase,
        score: q.score,
        total: q.total,
        skipped: q.skipped,
      }))
    );
    const quizLift =
      lifts.length > 0
        ? Math.round(lifts.reduce((a, b) => a + b, 0) / lifts.length)
        : null;
    return {
      id: uid,
      email: profile?.email ?? "—",
      displayName: profile?.display_name,
      streakDays: st?.streak_days ?? 0,
      totalMinutes: st?.total_minutes ?? 0,
      totalSessions: st?.total_sessions ?? 0,
      quizLift,
    };
  });

  const totalMinutes = students.reduce((a, s) => a + s.totalMinutes, 0);
  const lifts = students.map((s) => s.quizLift).filter((l): l is number => l !== null);
  const avgLift =
    lifts.length > 0
      ? Math.round(lifts.reduce((a, b) => a + b, 0) / lifts.length)
      : null;

  return NextResponse.json({
    classroom: {
      id: classroom.id,
      name: classroom.name,
      join_code: classroom.join_code,
    },
    summary: {
      studentCount: students.length,
      totalMinutes,
      avgStreak:
        students.length > 0
          ? Math.round(
              students.reduce((a, s) => a + s.streakDays, 0) / students.length
            )
          : 0,
      avgQuizLift: avgLift,
    },
    students,
  });
}
