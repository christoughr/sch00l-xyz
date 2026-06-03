import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const scoreSchema = z.object({
  displayName: z.string().min(1).max(40),
  questionId: z.string().uuid(),
  choiceIndex: z.number().int().min(0).max(10),
  correct: z.boolean(),
  points: z.number().int().min(0),
  elapsedMs: z.number().int().min(0).optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const roomCode = code.toUpperCase().trim();
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { data: battle } = await supabase
    .from("live_battles")
    .select("id")
    .eq("room_code", roomCode)
    .single();

  if (!battle) {
    return NextResponse.json({ error: "Battle not found" }, { status: 404 });
  }

  const { data: participants } = await supabase
    .from("battle_participants")
    .select("display_name, total_score")
    .eq("battle_id", battle.id)
    .order("total_score", { ascending: false });

  return NextResponse.json({
    leaderboard: (participants ?? []).map((p, i) => ({
      rank: i + 1,
      displayName: p.display_name,
      totalScore: p.total_score,
    })),
  });
}

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

  const parsed = scoreSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const body = parsed.data;

  const { data: battle } = await supabase
    .from("live_battles")
    .select("id, status")
    .eq("room_code", roomCode)
    .single();

  if (!battle) {
    return NextResponse.json({ error: "Battle not found" }, { status: 404 });
  }

  const { data: existing } = await supabase
    .from("battle_answers")
    .select("id")
    .eq("battle_id", battle.id)
    .eq("display_name", body.displayName)
    .eq("question_id", body.questionId)
    .maybeSingle();

  if (!existing) {
    await supabase.from("battle_answers").insert({
      battle_id: battle.id,
      display_name: body.displayName,
      question_id: body.questionId,
      choice_index: body.choiceIndex,
      correct: body.correct,
      points: body.points,
    });
  }

  if (body.correct && body.points > 0) {
    const { data: part } = await supabase
      .from("battle_participants")
      .select("total_score")
      .eq("battle_id", battle.id)
      .eq("display_name", body.displayName)
      .single();

    await supabase
      .from("battle_participants")
      .update({ total_score: (part?.total_score ?? 0) + body.points })
      .eq("battle_id", battle.id)
      .eq("display_name", body.displayName);
  }

  return NextResponse.json({ ok: true });
}
