import {
  generatePracticeItems,
  type PracticeTestMeta,
} from "@/lib/practice-engine";
import { getBankItems, LOCAL_PRACTICE_TESTS } from "@/lib/practice-catalog";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const MIGRATION = "010_epics_b_through_h.sql";

const startSchema = z.object({
  questionCount: z.number().int().min(5).max(40).optional(),
});

function localTestMeta(testId: string): PracticeTestMeta | null {
  return LOCAL_PRACTICE_TESTS.find((t) => t.id === testId) ?? null;
}

function questionsFromBank(testId: string, count: number) {
  return getBankItems(testId, count).map((q) => ({
    id: q.id,
    prompt: q.prompt,
    choices: q.choices,
    correctIndex: q.correctIndex,
    skillTag: q.skillTag,
  }));
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ testId: string }> }
) {
  const { testId } = await params;
  const parsed = startSchema.safeParse(await req.json().catch(() => ({})));
  const questionCount = parsed.success ? parsed.data.questionCount ?? 10 : 10;

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  let meta: PracticeTestMeta | null = null;
  let attemptId: string | null = null;

  const { data: test, error: testErr } = await supabase
    .from("practice_tests")
    .select("id, label, exam_family, region, duration_minutes, section_count")
    .eq("id", testId)
    .single();

  if (!testErr && test) {
    meta = {
      id: test.id,
      label: test.label,
      examFamily: test.exam_family,
      region: test.region,
      durationMinutes: test.duration_minutes,
      sectionCount: test.section_count,
    };

    const { data: attempt, error: attemptErr } = await supabase
      .from("practice_attempts")
      .insert({ user_id: user.id, test_id: testId })
      .select("id, started_at")
      .single();

    if (!attemptErr && attempt) {
      attemptId = attempt.id;
    }
  }

  if (!meta) {
    meta = localTestMeta(testId);
    if (!meta) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }
  }

  let questions: {
    id?: string;
    prompt: string;
    choices: string[];
    correctIndex: number;
    skillTag?: string;
  }[] = questionsFromBank(testId, questionCount);

  if (questions.length < Math.min(5, questionCount)) {
    const { data: bankItems } = await supabase
      .from("practice_items")
      .select("id, prompt, choices, correct_index, skill_tag, section_ord")
      .eq("test_id", testId)
      .limit(questionCount);

    if (bankItems && bankItems.length >= Math.min(5, questionCount)) {
      questions = bankItems.slice(0, questionCount).map((q) => ({
        id: q.id,
        prompt: q.prompt,
        choices: q.choices as string[],
        correctIndex: q.correct_index,
        skillTag: q.skill_tag ?? undefined,
      }));
    }
  }

  if (questions.length < Math.min(5, questionCount)) {
    const generated = await generatePracticeItems(meta, questionCount);
    questions = generated.map((q, i) => ({
      prompt: q.prompt,
      choices: q.choices,
      correctIndex: q.correctIndex,
      skillTag: q.skillTag ?? `generated-${i}`,
    }));
  }

  if (questions.length === 0) {
    return NextResponse.json(
      { error: `Run migration ${MIGRATION} or use bundled catalog` },
      { status: 503 }
    );
  }

  const clientQuestions = questions.map((q) => ({
    id: q.id ?? `gen-${q.prompt.slice(0, 8)}`,
    prompt: q.prompt,
    choices: q.choices,
    skillTag: q.skillTag,
  }));

  return NextResponse.json({
    attemptId: attemptId ?? `local-${testId}-${Date.now()}`,
    startedAt: new Date().toISOString(),
    test: meta,
    questions: clientQuestions,
    answerKey: questions.map((q) => q.correctIndex),
    guestMode: false,
  });
}
