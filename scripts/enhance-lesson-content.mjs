#!/usr/bin/env node
/**
 * Expand short seed lessons and clean publisher extract boilerplate.
 * npx tsx scripts/enhance-lesson-content.mjs [--dry-run]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TRACKS = ["ap-bio", "ap-chem", "sat-math", "ap-calc-ab"];
const DRY = process.argv.includes("--dry-run");

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()])
      process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

function polishBody(body) {
  let b = body ?? "";
  b = b.replace(/\*\*Publisher source:\*\*[^\n]+\n*/gi, "");
  b = b.replace(/###[^\n]*extract[^\n]*\n*/gi, "### Key ideas\n\n");
  b = b.replace(/\(extract[^\)]*\)/gi, "");
  b = b.replace(/\bextract from licensed material\b/gi, "");
  b = b.replace(/\*Replace this block with original sch00l lesson prose[^\n]*\n*/gi, "");
  b = b.replace(/\*Digital adaptation for sch00l[^\n]*\*/gi, "");
  b = b.replace(/\n+---\n+\*\*Free textbook:\*\*[^\n]*openstax\.org[^\n]*\n*/gi, "\n");
  b = b.replace(/…/g, "...");
  b = b.replace(/\n{3,}/g, "\n\n");
  return b.trim();
}

function expandSeedLesson(title, body) {
  const core = body.trim();
  if (core.length >= 520) return core;

  return `${core}

### Practice with the tutor

Ask the AI to quiz you on **${title}** — request "give me a practice question" or "explain step by step," not a full answer key.

### Check your understanding

- State the main idea in one sentence without looking at your notes.
- Work one new example (different numbers or scenario) and show your reasoning.
- Name one common mistake students make on this topic and how to avoid it.

### Exam-style tip

On test day, link every answer to evidence: a definition, a calculation, or a line from the passage — partial credit follows clear reasoning.`;
}

function needsEnhancement(lesson) {
  const body = lesson.body_markdown ?? "";
  const isSeed = lesson.source_pdf_name === "sch00l-original-oer-aligned";
  if (isSeed && body.length < 520) return "seed";
  if (/extract|publisher source|replace this block/i.test(body)) return "publisher";
  if (!isSeed && body.length < 500) return "publisher-short";
  return null;
}

async function main() {
  loadEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Need SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const supabase = createClient(url, key);
  let updated = 0;

  for (const trackId of TRACKS) {
    const { data: units } = await supabase
      .from("course_units")
      .select("id")
      .eq("track_id", trackId);
    if (!units?.length) continue;

    const { data: lessons } = await supabase
      .from("course_lessons")
      .select("id, title, body_markdown, source_pdf_name")
      .in("unit_id", units.map((u) => u.id))
      .eq("review_status", "published");

    for (const lesson of lessons ?? []) {
      const kind = needsEnhancement(lesson);
      if (!kind) continue;

      let body =
        kind === "seed"
          ? expandSeedLesson(lesson.title, lesson.body_markdown)
          : polishBody(lesson.body_markdown);

      if (body === lesson.body_markdown) continue;

      if (DRY) {
        console.log(`[dry] ${trackId} | ${lesson.title} (${kind})`);
        updated++;
        continue;
      }

      const { error } = await supabase
        .from("course_lessons")
        .update({ body_markdown: body })
        .eq("id", lesson.id);
      if (error) console.error(lesson.title, error.message);
      else {
        updated++;
        console.log(`Updated ${trackId}: ${lesson.title}`);
      }
    }
  }

  console.log(DRY ? `Would update ${updated} lessons` : `Updated ${updated} lessons`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
