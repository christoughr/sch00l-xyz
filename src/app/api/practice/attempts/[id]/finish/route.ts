import { weakTagsFromMisses } from "@/lib/practice-engine";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const MIGRATION = "010_epics_b_through_h.sql";

const finishSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().optional(),
      choiceIndex: z.number().int().min(0),
      correctIndex: z.number().int().min(0),
      skillTag: z.string().optional(),
    })
  ),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: attemptId } = await params;
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = finishSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid answers" }, { status: 400 });
  }

  const { data: attempt, error: fetchErr } = await supabase
    .from("practice_attempts")
    .select("id, user_id, test_id, ended_at")
    .eq("id", attemptId)
    .single();

  if (fetchErr) {
    if (fetchErr.code === "42P01") {
      return NextResponse.json(
        { error: `Run migration ${MIGRATION}`, migrationRequired: MIGRATION },
        { status: 503 }
      );
    }
    if (fetchErr.code === "PGRST116") {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }

  if (attempt.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (attempt.ended_at) {
    return NextResponse.json({ error: "Attempt already finished" }, { status: 400 });
  }

  const answers = parsed.data.answers;
  const total = answers.length;
  let score = 0;
  const misses: { skillTag?: string; correct: boolean }[] = [];

  for (const a of answers) {
    const correct = a.choiceIndex === a.correctIndex;
    if (correct) score++;
    misses.push({ skillTag: a.skillTag, correct });
  }

  const weakTags = weakTagsFromMisses(misses);

  const { error: updateErr } = await supabase
    .from("practice_attempts")
    .update({
      ended_at: new Date().toISOString(),
      score,
      total,
      weak_tags: weakTags,
    })
    .eq("id", attemptId);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    score,
    total,
    percent: total > 0 ? Math.round((score / total) * 100) : 0,
    weakTags,
  });
}
