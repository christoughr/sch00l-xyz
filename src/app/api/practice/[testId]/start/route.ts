import {
  generatePracticeItems,
  type PracticeTestMeta,
} from "@/lib/practice-engine";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const MIGRATION = "010_epics_b_through_h.sql";

const startSchema = z.object({
  questionCount: z.number().int().min(5).max(40).optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ testId: string }> }
) {
  const { testId } = await params;
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = startSchema.safeParse(await req.json().catch(() => ({})));
  const questionCount = parsed.success ? parsed.data.questionCount ?? 10 : 10;

  const { data: test, error: testErr } = await supabase
    .from("practice_tests")
    .select("id, label, exam_family, region, duration_minutes, section_count")
    .eq("id", testId)
    .single();

  if (testErr) {
    if (testErr.code === "42P01") {
      return NextResponse.json(
        { error: `Run migration ${MIGRATION}`, migrationRequired: MIGRATION },
        { status: 503 }
      );
    }
    if (testErr.code === "PGRST116") {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }
    return NextResponse.json({ error: testErr.message }, { status: 500 });
  }

  const meta: PracticeTestMeta = {
    id: test.id,
    label: test.label,
    examFamily: test.exam_family,
    region: test.region,
    durationMinutes: test.duration_minutes,
    sectionCount: test.section_count,
  };

  const { data: attempt, error: attemptErr } = await supabase
    .from("practice_attempts")
    .insert({
      user_id: user.id,
      test_id: testId,
    })
    .select("id, started_at")
    .single();

  if (attemptErr) {
    if (attemptErr.code === "42P01") {
      return NextResponse.json(
        { error: `Run migration ${MIGRATION}` },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: attemptErr.message }, { status: 500 });
  }

  const { data: bankItems } = await supabase
    .from("practice_items")
    .select("id, prompt, choices, correct_index, skill_tag, section_ord")
    .eq("test_id", testId)
    .limit(questionCount);

  let questions: {
    id?: string;
    prompt: string;
    choices: string[];
    correctIndex: number;
    skillTag?: string;
  }[];

  if (bankItems && bankItems.length >= Math.min(5, questionCount)) {
    questions = bankItems.slice(0, questionCount).map((q) => ({
      id: q.id,
      prompt: q.prompt,
      choices: q.choices as string[],
      correctIndex: q.correct_index,
      skillTag: q.skill_tag ?? undefined,
    }));
  } else {
    const generated = await generatePracticeItems(meta, questionCount);
    questions = generated.map((q, i) => ({
      prompt: q.prompt,
      choices: q.choices,
      correctIndex: q.correctIndex,
      skillTag: `generated-${i}`,
    }));
  }

  const clientQuestions = questions.map((q) => ({
    id: q.id ?? `gen-${q.prompt.slice(0, 8)}`,
    prompt: q.prompt,
    choices: q.choices,
    skillTag: q.skillTag,
  }));

  return NextResponse.json({
    attemptId: attempt.id,
    startedAt: attempt.started_at,
    test: meta,
    questions: clientQuestions,
    answerKey: questions.map((q) => q.correctIndex),
  });
}
