import { logAudit } from "@/lib/audit";
import { createClient } from "@/lib/supabase/server";
import { isTeacherEmail } from "@/lib/teacher";
import { NextResponse } from "next/server";
import { z } from "zod";

const MIGRATION = "010_epics_b_through_h.sql";

const createSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  studyTrackId: z.string().max(80).optional(),
  priceCents: z.number().int().min(0).max(999_00).optional(),
  published: z.boolean().optional(),
});

export async function GET(req: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const url = new URL(req.url);
  const mine = url.searchParams.get("mine") === "1";

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("marketplace_templates")
    .select(
      "id, title, description, study_track_id, price_cents, published, teacher_id, created_at"
    )
    .order("created_at", { ascending: false });

  if (mine && user) {
    query = query.eq("teacher_id", user.id);
  } else {
    query = query.eq("published", true);
  }

  const { data, error } = await query;

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json({ templates: [], migrationRequired: MIGRATION });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    templates: (data ?? []).map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      studyTrackId: t.study_track_id,
      priceCents: t.price_cents,
      published: t.published,
      teacherId: t.teacher_id,
      createdAt: t.created_at,
      isOwn: user ? t.teacher_id === user.id : false,
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

  if (!isTeacherEmail(user.email)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "teacher") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid template" }, { status: 400 });
  }

  const body = parsed.data;
  const { data: row, error } = await supabase
    .from("marketplace_templates")
    .insert({
      teacher_id: user.id,
      title: body.title,
      description: body.description ?? null,
      study_track_id: body.studyTrackId ?? null,
      price_cents: body.priceCents ?? 0,
      published: body.published ?? false,
    })
    .select("id, published")
    .single();

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json(
        { error: `Run migration ${MIGRATION}`, migrationRequired: MIGRATION },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAudit({
    actorId: user.id,
    action: "marketplace.template.create",
    resourceType: "marketplace_template",
    resourceId: row.id,
  });

  return NextResponse.json({ id: row.id, published: row.published, ok: true });
}
