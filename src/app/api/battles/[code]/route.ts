import { createClient } from "@/lib/supabase/server";
import { isTeacherEmail } from "@/lib/teacher";
import { NextResponse } from "next/server";

const MIGRATION = "010_epics_b_through_h.sql";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const roomCode = code.toUpperCase().trim();

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: battle, error } = await supabase
    .from("live_battles")
    .select(
      "id, classroom_id, teacher_id, room_code, study_track_id, section_id, status, homework_mode, due_at, created_at"
    )
    .eq("room_code", roomCode)
    .single();

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json({ error: "Not available", migrationRequired: MIGRATION }, { status: 503 });
    }
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Battle not found" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const isTeacher =
    !!user &&
    (battle.teacher_id === user.id || isTeacherEmail(user.email));

  const [{ data: questions }, { data: participants }, { data: answers }] =
    await Promise.all([
      supabase
        .from("battle_questions")
        .select("id, ord, prompt, choices, correct_index")
        .eq("battle_id", battle.id)
        .order("ord", { ascending: true }),
      supabase
        .from("battle_participants")
        .select("display_name, total_score, user_id, joined_at")
        .eq("battle_id", battle.id)
        .order("total_score", { ascending: false }),
      supabase
        .from("battle_answers")
        .select("display_name, question_id, choice_index, correct, points")
        .eq("battle_id", battle.id),
    ]);

  const safeQuestions = (questions ?? []).map((q) => {
    const base = {
      id: q.id,
      ord: q.ord,
      prompt: q.prompt,
      choices: q.choices as string[],
    };
    if (isTeacher) {
      return { ...base, correctIndex: q.correct_index };
    }
    return base;
  });

  return NextResponse.json({
    battle: {
      id: battle.id,
      roomCode: battle.room_code,
      classroomId: battle.classroom_id,
      studyTrackId: battle.study_track_id,
      sectionId: battle.section_id,
      status: battle.status,
      homeworkMode: battle.homework_mode,
      dueAt: battle.due_at,
      createdAt: battle.created_at,
    },
    questions: safeQuestions,
    participants: (participants ?? []).map((p) => ({
      displayName: p.display_name,
      totalScore: p.total_score,
      userId: p.user_id,
      joinedAt: p.joined_at,
    })),
    answers: isTeacher ? answers ?? [] : undefined,
    isTeacher,
  });
}
