import { createClient } from "@/lib/supabase/server";
import { isRosterStudent } from "@/lib/classroom-roster";
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
    .select("id, teacher_id")
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

  const teacherByClass = new Map(
    (classrooms ?? []).map((c) => [c.id, c.teacher_id])
  );

  const { data: members } = await supabase
    .from("classroom_members")
    .select("user_id, classroom_id")
    .in("classroom_id", classroomIds);

  const memberRows = members ?? [];
  const allUserIds = [...new Set(memberRows.map((m) => m.user_id))];

  const { data: profiles } =
    allUserIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, email, role")
          .in("id", allUserIds)
      : { data: [] };

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  const studentIdSet = new Set<string>();
  for (const m of memberRows) {
    const p = profileMap.get(m.user_id);
    const teacherId = teacherByClass.get(m.classroom_id) ?? user.id;
    if (
      isRosterStudent({
        userId: m.user_id,
        teacherId,
        email: p?.email,
        role: p?.role,
      })
    ) {
      studentIdSet.add(m.user_id);
    }
  }

  const userIds = [...studentIdSet];
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
