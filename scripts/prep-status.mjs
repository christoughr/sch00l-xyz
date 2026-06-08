#!/usr/bin/env node
/** Rewrite + quiz prep progress. Usage: node scripts/prep-status.mjs */
import { createClient } from "@supabase/supabase-js";
import { loadEnvLocal } from "./load-env.mjs";

loadEnvLocal();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function wasLlmRewritten(body) {
  return (
    /### Key ideas/i.test(body) &&
    /### Practice/i.test(body) &&
    /Ask the AI tutor to quiz you on this topic/i.test(body)
  );
}

function needsRewrite(body, source) {
  if (!body?.trim() || source === "sch00l-original-oer-aligned") return false;
  if (wasLlmRewritten(body)) return false;
  if (source) return true;
  if (/### Study notes \(extract|publisher source:/i.test(body)) return true;
  const plain = body.replace(/[#*_`\[\]()>-]/g, " ").replace(/\s+/g, " ").trim();
  if (plain.length > 400 && (body.match(/###/g)?.length ?? 0) <= 1) return true;
  if (/### Key ideas/i.test(body) && !/### Worked example/i.test(body) && plain.length > 500)
    return true;
  return false;
}

const { data: units } = await supabase.from("course_units").select("track_id, id");
const byTrack = {};

for (const u of units ?? []) {
  const { data: lessons } = await supabase
    .from("course_lessons")
    .select("body_markdown, source_pdf_name")
    .eq("unit_id", u.id);
  for (const l of lessons ?? []) {
    byTrack[u.track_id] ??= { total: 0, rewritten: 0, pending: 0 };
    byTrack[u.track_id].total++;
    if (wasLlmRewritten(l.body_markdown ?? "")) byTrack[u.track_id].rewritten++;
    else if (needsRewrite(l.body_markdown ?? "", l.source_pdf_name))
      byTrack[u.track_id].pending++;
  }
}

let rewritten = 0;
let pending = 0;
for (const v of Object.values(byTrack)) {
  rewritten += v.rewritten;
  pending += v.pending;
}

const { error: quizErr } = await supabase.from("lesson_quiz_items").select("id").limit(1);
const quizTable = !quizErr || quizErr.code !== "PGRST205";

let quizCount = 0;
if (quizTable) {
  const { count } = await supabase
    .from("lesson_quiz_items")
    .select("id", { count: "exact", head: true });
  quizCount = count ?? 0;
}

console.log("=== sch00l prep status ===");
console.log(`Paraphrase: ${rewritten} done · ${pending} pending`);
console.log(`Quiz bank: ${quizTable ? `${quizCount} items` : "migration 029 NOT applied yet"}`);
console.log("");
for (const [track, v] of Object.entries(byTrack).sort((a, b) => b[1].pending - a[1].pending)) {
  if (v.pending > 0 || v.rewritten > 0)
    console.log(`  ${track}: ${v.rewritten}/${v.total} rewritten · ${v.pending} pending`);
}
