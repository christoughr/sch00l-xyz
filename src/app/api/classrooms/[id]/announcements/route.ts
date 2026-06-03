import { logAudit } from "@/lib/audit";
import { createClient } from "@/lib/supabase/server";
import { isTeacherEmail } from "@/lib/teacher";
import { NextResponse } from "next/server";
import { z } from "zod";

const MIGRATION = "010_epics_b_through_h.sql";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(10_000),
  pinned: z.boolean().optional(),
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
    .from("classroom_announcements")
    .select("id, title, body, pinned, created_at, teacher_id")
    .eq("classroom_id", classroomId)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json({
        announcements: [],
        migrationRequired: MIGRATION,
      });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    announcements: (data ?? []).map((a) => ({
      id: a.id,
      title: a.title,
      body: a.body,
      pinned: a.pinned,
      createdAt: a.created_at,
      teacherId: a.teacher_id,
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
    return NextResponse.json({ error: "Invalid announcement" }, { status: 400 });
  }

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

  const body = parsed.data;
  const { data: row, error } = await supabase
    .from("classroom_announcements")
    .insert({
      classroom_id: classroomId,
      teacher_id: user.id,
      title: body.title,
      body: body.body,
      pinned: body.pinned ?? false,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json(
        { error: `Run migration ${MIGRATION} in Supabase SQL editor` },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAudit({
    actorId: user.id,
    action: "announcement.create",
    resourceType: "classroom",
    resourceId: classroomId,
    meta: { announcementId: row.id },
  });

  return NextResponse.json({ id: row.id, ok: true });
}
