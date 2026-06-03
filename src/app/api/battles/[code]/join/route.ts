import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const MIGRATION = "010_epics_b_through_h.sql";

const joinSchema = z.object({
  displayName: z.string().min(1).max(40).regex(/^[a-zA-Z0-9 _.-]+$/),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const roomCode = code.toUpperCase().trim();

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const parsed = joinSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid display name" }, { status: 400 });
  }

  const displayName = parsed.data.displayName.trim().slice(0, 40);

  const { data: battle, error: battleErr } = await supabase
    .from("live_battles")
    .select("id, status")
    .eq("room_code", roomCode)
    .single();

  if (battleErr) {
    if (battleErr.code === "42P01") {
      return NextResponse.json(
        { error: `Run migration ${MIGRATION}` },
        { status: 503 }
      );
    }
    if (battleErr.code === "PGRST116") {
      return NextResponse.json({ error: "Battle not found" }, { status: 404 });
    }
    return NextResponse.json({ error: battleErr.message }, { status: 500 });
  }

  if (battle.status === "finished") {
    return NextResponse.json({ error: "Battle has ended" }, { status: 400 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: existing } = await supabase
    .from("battle_participants")
    .select("display_name, total_score")
    .eq("battle_id", battle.id)
    .eq("display_name", displayName)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({
      ok: true,
      displayName: existing.display_name,
      totalScore: existing.total_score,
      rejoined: true,
    });
  }

  const { error: joinErr } = await supabase.from("battle_participants").insert({
    battle_id: battle.id,
    user_id: user?.id ?? null,
    display_name: displayName,
    total_score: 0,
  });

  if (joinErr) {
    if (joinErr.code === "42P01") {
      return NextResponse.json(
        { error: `Run migration ${MIGRATION}` },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: joinErr.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    displayName,
    totalScore: 0,
    rejoined: false,
  });
}
