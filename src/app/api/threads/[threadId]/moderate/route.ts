import { logAudit } from "@/lib/audit";
import { createClient } from "@/lib/supabase/server";
import { isTeacherEmail } from "@/lib/teacher";
import { NextResponse } from "next/server";
import { z } from "zod";

const MIGRATION = "010_epics_b_through_h.sql";

const patchSchema = z.object({
  action: z.enum(["pin", "unpin", "lock", "unlock", "delete", "unflag"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const { threadId } = await params;
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

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const { data: thread, error: fetchErr } = await supabase
    .from("classroom_threads")
    .select("id, classroom_id, teacher_lounge")
    .eq("id", threadId)
    .single();

  if (fetchErr) {
    if (fetchErr.code === "42P01") {
      return NextResponse.json(
        { error: `Run migration ${MIGRATION}` },
        { status: 503 }
      );
    }
    if (fetchErr.code === "PGRST116") {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }

  if (thread.classroom_id) {
    const { data: classroom } = await supabase
      .from("classrooms")
      .select("teacher_id")
      .eq("id", thread.classroom_id)
      .single();

    if (!classroom || classroom.teacher_id !== user.id) {
      if (!isTeacherEmail(user.email)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
  }

  const { action } = parsed.data;

  if (action === "delete") {
    const { error } = await supabase
      .from("classroom_threads")
      .delete()
      .eq("id", threadId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await logAudit({
      actorId: user.id,
      action: "thread.delete",
      resourceType: "thread",
      resourceId: threadId,
    });

    return NextResponse.json({ ok: true, deleted: true });
  }

  const updates: Record<string, boolean> = {};
  if (action === "pin") updates.pinned = true;
  if (action === "unpin") updates.pinned = false;
  if (action === "lock") updates.locked = true;
  if (action === "unlock") updates.locked = false;
  if (action === "unflag") updates.flagged = false;

  const { error: updateErr } = await supabase
    .from("classroom_threads")
    .update(updates)
    .eq("id", threadId);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  await logAudit({
    actorId: user.id,
    action: `thread.${action}`,
    resourceType: "thread",
    resourceId: threadId,
  });

  return NextResponse.json({ ok: true, ...updates });
}
