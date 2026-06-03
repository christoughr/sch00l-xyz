import { logAudit } from "@/lib/audit";
import { createClient } from "@/lib/supabase/server";
import { isTeacherEmail } from "@/lib/teacher";
import { NextResponse } from "next/server";

const MIGRATION = "010_epics_b_through_h.sql";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const roomCode = code.toUpperCase().trim();

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: battle, error: fetchErr } = await supabase
    .from("live_battles")
    .select("id, teacher_id, status, classroom_id")
    .eq("room_code", roomCode)
    .single();

  if (fetchErr) {
    if (fetchErr.code === "42P01") {
      return NextResponse.json(
        { error: `Run migration ${MIGRATION}` },
        { status: 503 }
      );
    }
    if (fetchErr.code === "PGRST116") {
      return NextResponse.json({ error: "Battle not found" }, { status: 404 });
    }
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }

  if (battle.teacher_id !== user.id && !isTeacherEmail(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (battle.status === "finished") {
    return NextResponse.json({ error: "Battle already finished" }, { status: 400 });
  }

  const { error: updateErr } = await supabase
    .from("live_battles")
    .update({ status: "active" })
    .eq("id", battle.id);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  await logAudit({
    actorId: user.id,
    action: "battle.start",
    resourceType: "battle",
    resourceId: battle.id,
    meta: { roomCode },
  });

  return NextResponse.json({ ok: true, status: "active" });
}
