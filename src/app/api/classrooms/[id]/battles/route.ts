import { logAudit } from "@/lib/audit";
import {
  generateBattleCode,
  generateBattleQuestions,
} from "@/lib/battle";
import { createClient } from "@/lib/supabase/server";
import { getStudyTrack } from "@/lib/study-tracks";
import { buildSectionTopic } from "@/lib/track-sections";
import { isTeacherEmail } from "@/lib/teacher";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const MIGRATION = "010_epics_b_through_h.sql";

const createSchema = z.object({
  studyTrackId: z.string().min(1).max(80),
  sectionId: z.string().max(40).optional(),
  topic: z.string().max(300).optional(),
  homeworkMode: z.boolean().optional(),
  dueAt: z.string().datetime().optional(),
  questionCount: z.number().int().min(4).max(20).optional(),
});

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
    .select("id, teacher_id")
    .eq("id", classroomId)
    .single();

  if (!classroom) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isTeacher =
    classroom.teacher_id === user.id || isTeacherEmail(user.email);
  if (!isTeacher) {
    const { data: member } = await supabase
      .from("classroom_members")
      .select("user_id")
      .eq("classroom_id", classroomId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("live_battles")
    .select(
      "id, room_code, study_track_id, section_id, status, homework_mode, due_at, created_at"
    )
    .eq("classroom_id", classroomId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json({ battles: [], migrationRequired: MIGRATION });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    battles: (data ?? []).map((b) => ({
      id: b.id,
      roomCode: b.room_code,
      studyTrackId: b.study_track_id,
      sectionId: b.section_id,
      status: b.status,
      homeworkMode: b.homework_mode,
      dueAt: b.due_at,
      createdAt: b.created_at,
    })),
  });
}

export async function POST(
  req: Request,
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

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid battle" }, { status: 400 });
  }

  const { data: classroom } = await supabase
    .from("classrooms")
    .select("teacher_id")
    .eq("id", classroomId)
    .single();

  if (!classroom || classroom.teacher_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = parsed.data;
  const track = getStudyTrack(body.studyTrackId);
  const topic =
    body.topic ??
    (body.sectionId
      ? buildSectionTopic(body.studyTrackId, body.sectionId)
      : track.topic);

  let roomCode = generateBattleCode();
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: existing } = await supabase
      .from("live_battles")
      .select("id")
      .eq("room_code", roomCode)
      .maybeSingle();
    if (!existing) break;
    roomCode = generateBattleCode();
  }

  const questions = await generateBattleQuestions(
    track.label,
    topic,
    body.questionCount ?? 8
  );

  const { data: battle, error: battleErr } = await supabase
    .from("live_battles")
    .insert({
      classroom_id: classroomId,
      teacher_id: user.id,
      room_code: roomCode,
      study_track_id: body.studyTrackId,
      section_id: body.sectionId ?? null,
      status: "lobby",
      homework_mode: body.homeworkMode ?? false,
      due_at: body.dueAt ?? null,
    })
    .select("id, room_code")
    .single();

  if (battleErr) {
    if (battleErr.code === "42P01") {
      return NextResponse.json(
        { error: `Run migration ${MIGRATION} in Supabase SQL editor` },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: battleErr.message }, { status: 500 });
  }

  const qRows = questions.map((q, ord) => ({
    battle_id: battle.id,
    ord,
    prompt: q.prompt,
    choices: q.choices,
    correct_index: q.correctIndex,
  }));

  const { error: qErr } = await supabase.from("battle_questions").insert(qRows);
  if (qErr) {
    return NextResponse.json({ error: qErr.message }, { status: 500 });
  }

  await logAudit({
    actorId: user.id,
    action: "battle.create",
    resourceType: "battle",
    resourceId: battle.id,
    meta: { roomCode, questionCount: questions.length },
  });

  return NextResponse.json({
    id: battle.id,
    roomCode: battle.room_code,
    questionCount: questions.length,
    ok: true,
  });
}
