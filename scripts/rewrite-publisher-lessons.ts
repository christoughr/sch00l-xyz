#!/usr/bin/env npx tsx
/**
 * Paraphrase publisher lesson drafts via LLM before publish.
 * Usage: npx tsx scripts/rewrite-publisher-lessons.ts <track-id> [--limit N] [--dry-run]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { chatCompletion } from "../src/lib/llm";
import {
  buildRewriteUserPrompt,
  needsPublisherRewrite,
  REWRITE_SYSTEM_PROMPT,
} from "../src/lib/lesson-rewrite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const track = process.argv[2];
const limitIdx = process.argv.indexOf("--limit");
const limit = limitIdx >= 0 ? Number(process.argv[limitIdx + 1]) : 50;
const dryRun = process.argv.includes("--dry-run");

if (!track) {
  console.error("Usage: npx tsx scripts/rewrite-publisher-lessons.ts <track-id> [--limit N] [--dry-run]");
  process.exit(1);
}

async function loadEnv() {
  const { loadEnvLocal } = await import("./load-env.mjs");
  loadEnvLocal(path.join(__dirname, ".."));
}

async function main() {
  await loadEnv();
  if (!process.env.OPENAI_API_KEY && !process.env.GROQ_API_KEY && !process.env.AI_API_KEY) {
    console.error("Set OPENAI_API_KEY or AI_API_KEY in .env.local for paraphrase rewrite");
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
    .select("id, title, body_markdown, source_pdf_name, ord, review_status")
    .in("unit_id", unitIds)
    .order("ord");

  const needsRewrite = (lessons ?? []).filter((l) =>
    needsPublisherRewrite(l.body_markdown ?? "", l.source_pdf_name)
  );
  const todo = needsRewrite.slice(0, limit);

  console.log(
    `Track ${track}: ${todo.length}/${needsRewrite.length} need rewrite (${lessons?.length ?? 0} total lessons)`
  );
  if (!todo.length) return;

  let ok = 0;
  for (const lesson of todo) {
    const rewritten = await chatCompletion(
      REWRITE_SYSTEM_PROMPT,
      buildRewriteUserPrompt(lesson.title, lesson.body_markdown ?? ""),
      { maxTokens: 1800, temperature: 0.6 }
    );
    if (!rewritten || rewritten.length < 200) {
      console.warn("  skip (no LLM output):", lesson.title.slice(0, 60));
      continue;
    }
    if (dryRun) {
      console.log("  [dry-run]", lesson.title.slice(0, 50), "→", rewritten.slice(0, 80), "...");
      ok++;
      continue;
    }
    const { error } = await supabase
      .from("course_lessons")
      .update({ body_markdown: rewritten.trim() })
      .eq("id", lesson.id);
    if (error) console.error("  fail:", lesson.title, error.message);
    else {
      ok++;
      console.log("  rewritten:", lesson.title.slice(0, 70));
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  console.log(`Done — ${ok}/${todo.length} rewritten for ${track}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
