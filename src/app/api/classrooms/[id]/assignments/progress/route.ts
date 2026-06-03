import { isRosterStudent } from "@/lib/classroom-roster";
import { createClient } from "@/lib/supabase/server";
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
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: classroom } = await supabase
    .from("classrooms")
    .select("id, teacher_id, name")
    .eq("id", classroomId)
    .single();

  if (!classroom) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (
    classroom.teacher_id !== user.id &&
    !isTeacherEmail(user.email)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: assignments, error: aErr } = await supabase
    .from("classroom_assignments")
    .select("id, title, study_track_id, due_at, assign_to_all")
    .eq("classroom_id", classroomId)
    .order("created_at", { ascending: false });

  if (aErr) {
    if (aErr.code === "42P01") {
      return NextResponse.json({
        progress: [],
        migrationRequired: "008_assignments_materials.sql",
      });
    }
    return NextResponse.json({ error: aErr.message }, { status: 500 });
  }

  const assignmentIds = (assignments ?? []).map((a) => a.id);

  const { data: members } = await supabase
    .from("classroom_members")
    .select("user_id")
    .eq("classroom_id", classroomId);

  type TargetRow = { assignment_id: string; user_id: string };
  type GradeRow = {
    assignment_id: string;
    user_id: string;
    score: number | null;
    updated_at: string;
  };

  let targetsList: TargetRow[] = [];
  let gradesList: GradeRow[] = [];

  if (assignmentIds.length > 0) {
    const [targetsRes, gradesRes] = await Promise.all([
      supabase
        .from("assignment_targets")
        .select("assignment_id, user_id")
        .in("assignment_id", assignmentIds),
      supabase
        .from("assignment_grades")
        .select("assignment_id, user_id, score, updated_at")
        .in("assignment_id", assignmentIds),
    ]);
    targetsList = targetsRes.data ?? [];
    gradesList = gradesRes.data ?? [];
  }

  const memberIds = (members ?? []).map((m) => m.user_id);
  const { data: profiles } =
    memberIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, email, display_name, role")
          .in("id", memberIds)
      : { data: [] as { id: string; email: string | null; display_name: string | null; role: string | null }[] };

  const studentIds = memberIds.filter((uid) => {
    const p = profiles?.find((x) => x.id === uid);
    return isRosterStudent({
      userId: uid,
      teacherId: classroom.teacher_id,
      email: p?.email,
      role: p?.role,
    });
  });

  const { data: stats } =
    studentIds.length > 0
      ? await supabase
          .from("student_stats")
          .select("user_id, total_minutes, total_sessions, streak_days")
          .in("user_id", studentIds)
      : { data: [] };

  const statsMap = new Map((stats ?? []).map((s) => [s.user_id, s]));

  const progress = studentIds.map((studentId) => {
    const profile = profiles?.find((p) => p.id === studentId);
    const st = statsMap.get(studentId);
    const assignmentProgress = (assignments ?? []).map((a) => {
      const assigned =
        a.assign_to_all ||
        targetsList.some(
          (t) => t.assignment_id === a.id && t.user_id === studentId
        );
      const grade = gradesList.find(
        (g) => g.assignment_id === a.id && g.user_id === studentId
      );
      return {
        assignmentId: a.id,
        title: a.title,
        studyTrackId: a.study_track_id,
        dueAt: a.due_at,
        assigned,
        score: grade?.score ?? null,
        gradedAt: grade?.updated_at ?? null,
        status: grade?.score != null ? "graded" : assigned ? "assigned" : "n/a",
      };
    });

    const completed = assignmentProgress.filter(
      (ap) => ap.status === "graded" || ap.score != null
    ).length;
    const assignedCount = assignmentProgress.filter((ap) => ap.assigned).length;

    return {
      studentId,
      email: profile?.email ?? "—",
      displayName: profile?.display_name,
      totalMinutes: st?.total_minutes ?? 0,
      totalSessions: st?.total_sessions ?? 0,
      streakDays: st?.streak_days ?? 0,
      assignments: assignmentProgress,
      summary: {
        assigned: assignedCount,
        completed,
        completionRate:
          assignedCount > 0
            ? Math.round((completed / assignedCount) * 100)
            : 0,
      },
    };
  });

  return NextResponse.json({
    classroom: { id: classroom.id, name: classroom.name },
    assignments: (assignments ?? []).map((a) => ({
      id: a.id,
      title: a.title,
      dueAt: a.due_at,
    })),
    progress,
  });
}
