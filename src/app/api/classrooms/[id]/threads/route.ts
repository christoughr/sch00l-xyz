import { logAudit } from "@/lib/audit";
import { createClient } from "@/lib/supabase/server";
import { isTeacherEmail } from "@/lib/teacher";
import { NextResponse } from "next/server";
import { z } from "zod";

const MIGRATION = "010_epics_b_through_h.sql";

const createSchema = z.object({
  title: z.string().min(2).max(200),
  unitSection: z.string().max(120).optional(),
});

async function canAccessClass(
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
  classroomId: string,
  userId: string,
  email?: string | null
) {
  const { data: classroom } = await supabase
    .from("classrooms")
    .select("teacher_id")
    .eq("id", classroomId)
    .single();

  if (!classroom) return { ok: false as const, status: 404 };

  if (classroom.teacher_id === userId || isTeacherEmail(email)) {
    return { ok: true as const, isTeacher: true };
  }

  const { data: member } = await supabase
    .from("classroom_members")
    .select("user_id")
    .eq("classroom_id", classroomId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!member) return { ok: false as const, status: 403 };
  return { ok: true as const, isTeacher: false };
}

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

  const access = await canAccessClass(
    supabase,
    classroomId,
    user.id,
    user.email
  );
  if (!access.ok) {
    return NextResponse.json(
      { error: access.status === 404 ? "Not found" : "Forbidden" },
      { status: access.status }
    );
  }

  const { data, error } = await supabase
    .from("classroom_threads")
    .select(
      "id, title, unit_section, pinned, locked, flagged, author_id, created_at"
    )
    .eq("classroom_id", classroomId)
    .eq("teacher_lounge", false)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json({ threads: [], migrationRequired: MIGRATION });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    threads: (data ?? []).map((t) => ({
      id: t.id,
      title: t.title,
      unitSection: t.unit_section,
      pinned: t.pinned,
      locked: t.locked,
      flagged: t.flagged,
      authorId: t.author_id,
      createdAt: t.created_at,
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

  const access = await canAccessClass(
    supabase,
    classroomId,
    user.id,
    user.email
  );
  if (!access.ok) {
    return NextResponse.json(
      { error: access.status === 404 ? "Not found" : "Forbidden" },
      { status: access.status }
    );
  }

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid thread" }, { status: 400 });
  }

  const body = parsed.data;
  const { data: row, error } = await supabase
    .from("classroom_threads")
    .insert({
      classroom_id: classroomId,
      teacher_lounge: false,
      author_id: user.id,
      title: body.title,
      unit_section: body.unitSection ?? null,
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

  await logAudit({
    actorId: user.id,
    action: "thread.create",
    resourceType: "thread",
    resourceId: row.id,
    meta: { classroomId },
  });

  return NextResponse.json({ id: row.id, ok: true });
}
