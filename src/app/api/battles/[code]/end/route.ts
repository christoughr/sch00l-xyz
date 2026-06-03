import { createClient } from "@/lib/supabase/server";
import { isTeacherEmail } from "@/lib/teacher";
import { NextResponse } from "next/server";

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

  const { data: battle } = await supabase
    .from("live_battles")
    .select("id, teacher_id, status")
    .eq("room_code", roomCode)
    .single();

  if (!battle) {
    return NextResponse.json({ error: "Battle not found" }, { status: 404 });
  }

  if (battle.teacher_id !== user.id && !isTeacherEmail(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await supabase
    .from("live_battles")
    .update({ status: "finished" })
    .eq("id", battle.id);

  return NextResponse.json({ ok: true, status: "finished" });
}
