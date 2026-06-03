import { createClient } from "@/lib/supabase/server";
import { isTeacherEmail } from "@/lib/teacher";
import { NextResponse } from "next/server";

export async function GET() {
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isTeacher =
    profile?.role === "teacher" || isTeacherEmail(user.email);
  if (!isTeacher) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: classrooms } = await supabase
    .from("classrooms")
    .select("id")
    .eq("teacher_id", user.id);

  const classroomIds = (classrooms ?? []).map((c) => c.id);
  if (classroomIds.length === 0) {
    return NextResponse.json({
      classroomCount: 0,
      studentCount: 0,
      totalClassMinutes: 0,
      hasQuizLift: false,
    });
  }

  const { data: members } = await supabase
    .from("classroom_members")
    .select("user_id")
    .in("classroom_id", classroomIds);

  const userIds = [...new Set((members ?? []).map((m) => m.user_id))];
  const studentCount = userIds.length;

  let totalClassMinutes = 0;
  let hasQuizLift = false;

  if (userIds.length > 0) {
    const { data: stats } = await supabase
      .from("student_stats")
      .select("total_minutes, user_id")
      .in("user_id", userIds);

    totalClassMinutes = (stats ?? []).reduce(
      (a, s) => a + (s.total_minutes ?? 0),
      0
    );

    const { data: quizzes } = await supabase
      .from("quiz_results")
      .select("user_id, phase, score, total, session_id, skipped")
      .in("user_id", userIds)
      .limit(200);

    const sessionPairs = new Set<string>();
    for (const q of quizzes ?? []) {
      if (q.phase === "pre" || q.phase === "post") {
        sessionPairs.add(`${q.user_id}:${q.session_id}`);
      }
    }
    hasQuizLift = sessionPairs.size > 0;
  }

  return NextResponse.json({
    classroomCount: classroomIds.length,
    studentCount,
    totalClassMinutes,
    hasQuizLift,
  });
}
