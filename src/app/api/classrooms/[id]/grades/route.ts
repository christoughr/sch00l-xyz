import { createClient } from "@/lib/supabase/server";
import { isTeacherEmail } from "@/lib/teacher";
import { NextResponse } from "next/server";
import { z } from "zod";

const patchSchema = z.object({
  assignmentId: z.string().uuid(),
  userId: z.string().uuid(),
  score: z.number().min(0).max(100).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
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

  if (!classroom || (classroom.teacher_id !== user.id && !isTeacherEmail(user.email))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: assignments } = await supabase
    .from("classroom_assignments")
    .select("id, title")
    .eq("classroom_id", classroomId);

  const assignmentIds = (assignments ?? []).map((a) => a.id);
  if (assignmentIds.length === 0) {
    return NextResponse.json({ grades: [] });
  }

  const { data: grades, error } = await supabase
    .from("assignment_grades")
    .select("assignment_id, user_id, score, notes, updated_at")
    .in("assignment_id", assignmentIds);

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json({ grades: [], migrationRequired: "009_lms_extensions.sql" });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ grades: grades ?? [], assignments: assignments ?? [] });
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

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid grade" }, { status: 400 });
  }

  const { data: classroom } = await supabase
    .from("classrooms")
    .select("teacher_id")
    .eq("id", classroomId)
    .single();

  if (!classroom || classroom.teacher_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { assignmentId, userId, score, notes } = parsed.data;

  const { data: assignment } = await supabase
    .from("classroom_assignments")
    .select("id")
    .eq("id", assignmentId)
    .eq("classroom_id", classroomId)
    .single();

  if (!assignment) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  const { error } = await supabase.from("assignment_grades").upsert({
    assignment_id: assignmentId,
    user_id: userId,
    score: score ?? null,
    notes: notes ?? null,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json(
        { error: "Run migration 009_lms_extensions.sql" },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
