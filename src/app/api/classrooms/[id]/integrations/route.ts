import { logAudit } from "@/lib/audit";
import { parseRosterCsv } from "@/lib/classroom-import";
import { isPlatformId, PLATFORMS } from "@/lib/integrations";
import { createClient } from "@/lib/supabase/server";
import { isTeacherEmail } from "@/lib/teacher";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const MIGRATION = "010_epics_b_through_h.sql";

const connectSchema = z.object({
  action: z.literal("connect"),
  platform: z.string(),
  externalCourseId: z.string().max(200).optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
});

const syncSchema = z.object({
  action: z.literal("sync"),
  platform: z.string().optional(),
  connectionId: z.string().uuid().optional(),
  csvText: z.string().max(500_000).optional(),
});

const postSchema = z.discriminatedUnion("action", [connectSchema, syncSchema]);

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
    .select("teacher_id, join_code, name")
    .eq("id", classroomId)
    .single();

  if (
    !classroom ||
    (classroom.teacher_id !== user.id && !isTeacherEmail(user.email))
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("platform_connections")
    .select(
      "id, platform, external_course_id, sync_enabled, last_sync_at, meta, created_at"
    )
    .eq("classroom_id", classroomId)
    .order("created_at", { ascending: false });

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json({
        connections: [],
        platforms: PLATFORMS,
        migrationRequired: MIGRATION,
      });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    connections: (data ?? []).map((c) => ({
      id: c.id,
      platform: c.platform,
      externalCourseId: c.external_course_id,
      syncEnabled: c.sync_enabled,
      lastSyncAt: c.last_sync_at,
      meta: c.meta,
      createdAt: c.created_at,
    })),
    platforms: PLATFORMS,
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

  const { data: classroom } = await supabase
    .from("classrooms")
    .select("teacher_id, join_code, name")
    .eq("id", classroomId)
    .single();

  if (!classroom || classroom.teacher_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = postSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (parsed.data.action === "connect") {
    if (!isPlatformId(parsed.data.platform)) {
      return NextResponse.json({ error: "Unknown platform" }, { status: 400 });
    }

    const { data: row, error } = await supabase
      .from("platform_connections")
      .upsert(
        {
          classroom_id: classroomId,
          teacher_id: user.id,
          platform: parsed.data.platform,
          external_course_id: parsed.data.externalCourseId ?? null,
          sync_enabled: true,
          meta: parsed.data.meta ?? {},
        },
        { onConflict: "classroom_id,platform" }
      )
      .select("id, platform")
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
      action: "integration.connect",
      resourceType: "platform_connection",
      resourceId: row.id,
      meta: { platform: row.platform },
    });

    return NextResponse.json({ ok: true, connectionId: row.id, platform: row.platform });
  }

  const body = parsed.data;
  type ConnectionRow = {
    id: string;
    platform: string;
    meta: Record<string, unknown> | null;
  };
  let connection: ConnectionRow | null = null;

  if (body.connectionId) {
    const { data } = await supabase
      .from("platform_connections")
      .select("id, platform, meta")
      .eq("id", body.connectionId)
      .eq("classroom_id", classroomId)
      .single();
    if (data) {
      connection = {
        id: data.id,
        platform: data.platform,
        meta: (data.meta as Record<string, unknown>) ?? null,
      };
    }
  } else if (body.platform && isPlatformId(body.platform)) {
    const { data } = await supabase
      .from("platform_connections")
      .select("id, platform, meta")
      .eq("classroom_id", classroomId)
      .eq("platform", body.platform)
      .single();
    if (data) {
      connection = {
        id: data.id,
        platform: data.platform,
        meta: (data.meta as Record<string, unknown>) ?? null,
      };
    }
  }

  if (!connection) {
    return NextResponse.json({ error: "Connection not found" }, { status: 404 });
  }

  const csvText =
    body.csvText ??
    (typeof connection.meta?.rosterCsv === "string"
      ? connection.meta.rosterCsv
      : "");

  const roster = parseRosterCsv(csvText);
  if (roster.emails.length === 0 && !csvText) {
    return NextResponse.json(
      {
        error:
          "Provide csvText in sync body or store roster CSV in connection meta.rosterCsv",
      },
      { status: 400 }
    );
  }

  const { error: importErr } = await supabase.from("classroom_imports").insert({
    classroom_id: classroomId,
    teacher_id: user.id,
    source:
      connection.platform === "canvas"
        ? "canvas_csv"
        : "google_classroom",
    row_count: roster.emails.length,
    emails: roster.emails,
  });

  if (importErr && importErr.code !== "42P01") {
    return NextResponse.json({ error: importErr.message }, { status: 500 });
  }

  await supabase
    .from("platform_connections")
    .update({
      last_sync_at: new Date().toISOString(),
      meta: {
        ...((connection.meta as Record<string, unknown>) ?? {}),
        lastRosterCount: roster.emails.length,
        lastInvalidRows: roster.invalidRows,
      },
    })
    .eq("id", connection.id);

  await logAudit({
    actorId: user.id,
    action: "integration.sync",
    resourceType: "platform_connection",
    resourceId: connection.id,
    meta: { emailCount: roster.emails.length },
  });

  const inviteMessage = `Join ${classroom.name} on sch00l.ai\nhttps://sch00l.ai/join\nCode: ${classroom.join_code}`;

  return NextResponse.json({
    ok: true,
    platform: connection.platform,
    emailCount: roster.emails.length,
    invalidRows: roster.invalidRows,
    emails: roster.emails,
    inviteMessage,
  });
}
