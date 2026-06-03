import { scoreAnswer } from "@/lib/battle";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const MIGRATION = "010_epics_b_through_h.sql";

const answerSchema = z.object({
  displayName: z.string().min(1).max(40),
  questionId: z.string().uuid(),
  choiceIndex: z.number().int().min(0).max(10),
  elapsedMs: z.number().int().min(0).max(120_000).optional(),
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

  const parsed = answerSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid answer" }, { status: 400 });
  }

  const { displayName, questionId, choiceIndex, elapsedMs } = parsed.data;

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

  if (battle.status !== "active") {
    return NextResponse.json({ error: "Battle is not active" }, { status: 400 });
  }

  const { data: participant } = await supabase
    .from("battle_participants")
    .select("display_name")
    .eq("battle_id", battle.id)
    .eq("display_name", displayName)
    .maybeSingle();

  if (!participant) {
    return NextResponse.json({ error: "Join the battle first" }, { status: 400 });
  }

  const { data: existingAnswer } = await supabase
    .from("battle_answers")
    .select("question_id")
    .eq("battle_id", battle.id)
    .eq("display_name", displayName)
    .eq("question_id", questionId)
    .maybeSingle();

  if (existingAnswer) {
    return NextResponse.json({ error: "Already answered" }, { status: 400 });
  }

  const { data: question, error: qErr } = await supabase
    .from("battle_questions")
    .select("id, correct_index")
    .eq("id", questionId)
    .eq("battle_id", battle.id)
    .single();

  if (qErr || !question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  const correct = choiceIndex === question.correct_index;
  const points = scoreAnswer(correct, elapsedMs ?? 15_000);

  const { error: ansErr } = await supabase.from("battle_answers").insert({
    battle_id: battle.id,
    display_name: displayName,
    question_id: questionId,
    choice_index: choiceIndex,
    correct,
    points,
  });

  if (ansErr) {
    if (ansErr.code === "42P01") {
      return NextResponse.json(
        { error: `Run migration ${MIGRATION}` },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: ansErr.message }, { status: 500 });
  }

  if (correct && points > 0) {
    const { data: part } = await supabase
      .from("battle_participants")
      .select("total_score")
      .eq("battle_id", battle.id)
      .eq("display_name", displayName)
      .single();

    await supabase
      .from("battle_participants")
      .update({ total_score: (part?.total_score ?? 0) + points })
      .eq("battle_id", battle.id)
      .eq("display_name", displayName);
  }

  return NextResponse.json({
    ok: true,
    correct,
    points,
  });
}
