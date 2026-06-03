import { logAudit } from "@/lib/audit";
import { createClient } from "@/lib/supabase/server";
import { isTeacherEmail } from "@/lib/teacher";
import { NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";

export const runtime = "nodejs";

const MIGRATION = "010_epics_b_through_h.sql";

const linkSchema = z.object({
  studentUserId: z.string().uuid(),
  classroomId: z.string().uuid().optional(),
});

function generateParentToken(): string {
  return randomBytes(24).toString("base64url");
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

  const parsed = linkSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { studentUserId, classroomId } = parsed.data;

  if (classroomId) {
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

    const { data: member } = await supabase
      .from("classroom_members")
      .select("user_id")
      .eq("classroom_id", classroomId)
      .eq("user_id", studentUserId)
      .maybeSingle();

    if (!member) {
      return NextResponse.json(
        { error: "Student is not in this classroom" },
        { status: 400 }
      );
    }
  } else if (!isTeacherEmail(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const token = generateParentToken();

  const { data: row, error } = await supabase
    .from("parent_access")
    .insert({
      student_user_id: studentUserId,
      token,
    })
    .select("id, token, created_at")
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
    action: "parent_link.create",
    resourceType: "parent_access",
    resourceId: row.id,
    meta: { studentUserId },
  });

  const origin =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  return NextResponse.json({
    ok: true,
    token: row.token,
    url: `${origin}/parent/${row.token}`,
    createdAt: row.created_at,
  });
}
