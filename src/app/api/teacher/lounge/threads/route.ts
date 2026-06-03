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

async function requireTeacher(
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
  userId: string,
  email?: string | null
) {
  if (isTeacherEmail(email)) return true;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  return profile?.role === "teacher";
}

export async function GET() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!(await requireTeacher(supabase, user.id, user.email))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("classroom_threads")
    .select(
      "id, title, unit_section, pinned, locked, flagged, author_id, created_at"
    )
    .eq("teacher_lounge", true)
    .is("classroom_id", null)
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

export async function POST(req: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!(await requireTeacher(supabase, user.id, user.email))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid thread" }, { status: 400 });
  }

  const body = parsed.data;
  const { data: row, error } = await supabase
    .from("classroom_threads")
    .insert({
      classroom_id: null,
      teacher_lounge: true,
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
    action: "teacher_lounge.thread.create",
    resourceType: "thread",
    resourceId: row.id,
  });

  return NextResponse.json({ id: row.id, ok: true });
}
