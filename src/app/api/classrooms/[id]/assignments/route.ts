import { createClient } from "@/lib/supabase/server";
import { isTeacherEmail } from "@/lib/teacher";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(2).max(120),
  studyTrackId: z.string().min(1).max(80).optional(),
  topic: z.string().max(200).optional(),
  dueAt: z.string().datetime().optional(),
  assignToAll: z.boolean().default(true),
  studentIds: z.array(z.string().uuid()).optional(),
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
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: classroom } = await supabase
    .from("classrooms")
    .select("id, teacher_id")
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

  const { data: assignments, error } = await supabase
    .from("classroom_assignments")
    .select(
      "id, title, study_track_id, topic, due_at, assign_to_all, created_at"
    )
    .eq("classroom_id", classroomId)
    .order("created_at", { ascending: false });

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json({
        assignments: [],
        migrationRequired: "008_assignments_materials.sql",
      });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const ids = (assignments ?? []).map((a) => a.id);
  let targets: { assignment_id: string; user_id: string }[] = [];
  if (ids.length > 0) {
    const { data: t } = await supabase
      .from("assignment_targets")
      .select("assignment_id, user_id")
      .in("assignment_id", ids);
    targets = t ?? [];
  }

  return NextResponse.json({
    assignments: (assignments ?? []).map((a) => ({
      id: a.id,
      title: a.title,
      studyTrackId: a.study_track_id,
      topic: a.topic,
      dueAt: a.due_at,
      assignToAll: a.assign_to_all,
      createdAt: a.created_at,
      studentIds: targets
        .filter((t) => t.assignment_id === a.id)
        .map((t) => t.user_id),
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
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid assignment" }, { status: 400 });
  }

  const { data: classroom } = await supabase
    .from("classrooms")
    .select("id, teacher_id")
    .eq("id", classroomId)
    .single();

  if (!classroom || classroom.teacher_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = parsed.data;
  const assignToAll = body.assignToAll !== false && !body.studentIds?.length;

  const { data: row, error } = await supabase
    .from("classroom_assignments")
    .insert({
      classroom_id: classroomId,
      teacher_id: user.id,
      title: body.title,
      study_track_id: body.studyTrackId ?? null,
      topic: body.topic ?? null,
      due_at: body.dueAt ?? null,
      assign_to_all: assignToAll,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json(
        {
          error: "Run migration 008_assignments_materials.sql in Supabase SQL editor",
        },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!assignToAll && body.studentIds?.length) {
    await supabase.from("assignment_targets").insert(
      body.studentIds.map((uid) => ({
        assignment_id: row.id,
        user_id: uid,
      }))
    );
  }

  return NextResponse.json({ id: row.id, ok: true });
}
