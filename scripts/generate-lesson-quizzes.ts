#!/usr/bin/env npx tsx
/**
 * Generate 2–3 original MCQs per published lesson from paraphrased lesson prose.
 * Usage: npx tsx scripts/generate-lesson-quizzes.ts <track-id> [--limit N] [--force]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { chatCompletion, parseJsonArray } from "../src/lib/llm";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const track = process.argv[2];
const limitIdx = process.argv.indexOf("--limit");
const limit = limitIdx >= 0 ? Number(process.argv[limitIdx + 1]) : 100;
const force = process.argv.includes("--force");

if (!track) {
  console.error(
    "Usage: npx tsx scripts/generate-lesson-quizzes.ts <track-id> [--limit N] [--force]"
  );
  process.exit(1);
}

const QUIZ_SYSTEM = `You write original multiple-choice prep questions for sch00l.ai lessons.

Rules:
- Questions must test understanding of the lesson concepts — never copy publisher wording.
- Each question has exactly 4 answer choices; one correct.
- Include a short explanation for the correct answer.
- Return ONLY a JSON array of 2–3 objects with keys: prompt, choices (string[4]), correctIndex (0-3), explanation.`;

async function loadEnv() {
  const { loadEnvLocal } = await import("./load-env.mjs");
  loadEnvLocal(path.join(__dirname, ".."));
}

type QuizDraft = {
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation?: string;
};

async function main() {
  await loadEnv();
  if (!process.env.OPENAI_API_KEY && !process.env.GROQ_API_KEY && !process.env.AI_API_KEY) {
    console.error("Set OPENAI_API_KEY in .env.local");
    process.exit(1);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: units } = await supabase
    .from("course_units")
    .select("id")
    .eq("track_id", track);
  if (!units?.length) {
    console.error("No units for", track);
    process.exit(1);
  }

  const unitIds = units.map((u) => u.id);
  const { data: lessons } = await supabase
    .from("course_lessons")
    .select("id, title, body_markdown")
    .in("unit_id", unitIds)
    .eq("review_status", "published")
    .order("ord");

  let todo = lessons ?? [];
  if (!force && todo.length) {
    const ids = todo.map((l) => l.id);
    const { data: existing } = await supabase
      .from("lesson_quiz_items")
      .select("lesson_id")
      .in("lesson_id", ids);
    const hasQuiz = new Set((existing ?? []).map((r) => r.lesson_id));
    todo = todo.filter((l) => !hasQuiz.has(l.id));
  }
  todo = todo.slice(0, limit);

  console.log(`Track ${track}: generating quizzes for ${todo.length} lessons`);
  if (!todo.length) return;

  let ok = 0;
  for (const lesson of todo) {
    const body = (lesson.body_markdown ?? "").slice(0, 3500);
    if (body.length < 120) {
      console.warn("  skip (thin body):", lesson.title.slice(0, 50));
      continue;
    }

    const raw = await chatCompletion(
      QUIZ_SYSTEM,
      `Lesson: ${lesson.title}\n\nLesson content:\n"""\n${body}\n"""\n\nWrite 2–3 MCQs as JSON.`,
      { maxTokens: 1400, temperature: 0.5 }
    );
    const drafts = raw ? parseJsonArray<QuizDraft>(raw) : null;
    if (!drafts?.length) {
      console.warn("  skip (bad JSON):", lesson.title.slice(0, 50));
      continue;
    }

    if (force) {
      await supabase.from("lesson_quiz_items").delete().eq("lesson_id", lesson.id);
    }

    const rows = drafts.slice(0, 3).map((d, i) => ({
      lesson_id: lesson.id,
      ord: i + 1,
      prompt: String(d.prompt ?? "").trim(),
      choices: Array.isArray(d.choices) ? d.choices.slice(0, 4) : [],
      correct_index: Math.min(3, Math.max(0, Number(d.correctIndex) || 0)),
      explanation: d.explanation ? String(d.explanation).trim() : null,
    })).filter((r) => r.prompt && r.choices.length === 4);

    if (!rows.length) {
      console.warn("  skip (invalid rows):", lesson.title.slice(0, 50));
      continue;
    }

    const { error } = await supabase.from("lesson_quiz_items").insert(rows);
    if (error) console.error("  fail:", lesson.title, error.message);
    else {
      ok++;
      console.log(`  +${rows.length} Qs:`, lesson.title.slice(0, 60));
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  console.log(`Done — ${ok}/${todo.length} lessons quizzed for ${track}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
