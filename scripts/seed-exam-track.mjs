#!/usr/bin/env node
/**
 * Generic seed for exam-prep tracks (units + placeholder lessons).
 * Usage: node scripts/seed-exam-track.mjs <track-id> "<Track Label>" "<subject>"
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const track = process.argv[2];
const label = process.argv[3] ?? track;
const subjectHint = process.argv[4] ?? "exam prep";

if (!track) {
  console.error("Usage: node scripts/seed-exam-track.mjs <track-id> [label] [topic hint]");
  process.exit(1);
}

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()])
      process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

const UNITS = [
  [1, "Foundations", "Core concepts and terminology"],
  [2, "Skills practice", "Problem types and strategies"],
  [3, "Timed practice", "Full sections under exam conditions"],
  [4, "Review", "Weak areas and mixed sets"],
];

const LESSON_TITLES = [
  [1, 1, "Overview and scoring"],
  [1, 2, "Study plan and resources"],
  [2, 1, "Core question types"],
  [2, 2, "Common traps and fixes"],
  [3, 1, "Timed section strategy"],
  [3, 2, "Pacing and guessing"],
  [4, 1, "Error log method"],
  [4, 2, "Final review checklist"],
];

async function main() {
  loadEnv();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: existing } = await supabase.from("course_units").select("id").eq("track_id", track);
  if (existing?.length) {
    console.log("Already seeded", track);
    return;
  }

  for (const [ord, title, desc] of UNITS) {
    const { data: unit, error } = await supabase
      .from("course_units")
      .insert({ track_id: track, ord, title, description: desc })
      .select("id")
      .single();
    if (error) throw error;
    for (const [uOrd, lOrd, lTitle] of LESSON_TITLES.filter((l) => l[0] === ord)) {
      const body = `# ${lTitle}\n\n**${label}** — ${subjectHint}\n\nUse the AI tutor for practice questions on this topic. Ask for drills, not answer keys.\n\n### Key ideas\n\n- Build habits before memorizing facts\n- Review mistakes in an error log\n- Simulate timed conditions weekly`;
      const { error: le } = await supabase.from("course_lessons").insert({
        unit_id: unit.id,
        ord: lOrd,
        title: lTitle,
        objectives: [`Master ${lTitle.toLowerCase()} for ${label}`],
        body_markdown: body,
        review_status: "published",
        source_pdf_name: "sch00l-original-oer-aligned",
      });
      if (le) throw le;
    }
  }
  console.log("Seeded", track);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
