import { logAudit } from "@/lib/audit";
import { createClient } from "@/lib/supabase/server";
import { isTeacherEmail } from "@/lib/teacher";
import { NextResponse } from "next/server";
import { z } from "zod";

const MIGRATION = "010_epics_b_through_h.sql";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(20_000),
});

const patchSchema = z.object({
  noteId: z.string().uuid(),
  approved: z.boolean(),
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
    .select("teacher_id")
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

  let query = supabase
    .from("peer_notes")
    .select("id, title, body, approved, author_id, created_at")
    .eq("classroom_id", classroomId)
    .order("created_at", { ascending: false });

  if (!isTeacher) {
    query = query.eq("approved", true);
  }

  const { data, error } = await query;

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json({ notes: [], migrationRequired: MIGRATION });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    notes: (data ?? []).map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      approved: n.approved,
      authorId: n.author_id,
      createdAt: n.created_at,
      isOwn: n.author_id === user.id,
    })),
    isTeacher,
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

  const { data: member } = await supabase
    .from("classroom_members")
    .select("user_id")
    .eq("classroom_id", classroomId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid note" }, { status: 400 });
  }

  const body = parsed.data;
  const { data: row, error } = await supabase
    .from("peer_notes")
    .insert({
      classroom_id: classroomId,
      author_id: user.id,
      title: body.title,
      body: body.body,
      approved: false,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json(
        { error: `Run migration ${MIGRATION}` },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: row.id, ok: true, approved: false });
}

export async function PATCH(
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

  const { data: classroom } = await supabase
    .from("classrooms")
    .select("teacher_id")
    .eq("id", classroomId)
    .single();

  if (
    !classroom ||
    (classroom.teacher_id !== user.id && !isTeacherEmail(user.email))
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid approval" }, { status: 400 });
  }

  const { noteId, approved } = parsed.data;
  const { error } = await supabase
    .from("peer_notes")
    .update({ approved })
    .eq("id", noteId)
    .eq("classroom_id", classroomId);

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json(
        { error: `Run migration ${MIGRATION}` },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAudit({
    actorId: user.id,
    action: approved ? "peer_note.approve" : "peer_note.reject",
    resourceType: "peer_note",
    resourceId: noteId,
    meta: { classroomId },
  });

  return NextResponse.json({ ok: true, approved });
}
