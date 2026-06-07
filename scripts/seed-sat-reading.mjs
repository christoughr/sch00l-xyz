#!/usr/bin/env node
/** node scripts/seed-sat-reading.mjs — applies seed via service role */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TRACK = "sat-reading";

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()])
      process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

const UNITS = [
  [1, "Literature passages", "Fiction, poetry, and literary analysis"],
  [2, "History & social science", "Founding documents, speeches, and social science texts"],
  [3, "Natural science passages", "Biology, chemistry, and physics excerpts"],
  [4, "Grammar & writing", "Standard English conventions and expression of ideas"],
  [5, "Test strategies", "Pacing, annotation, and answer elimination"],
];

const LESSONS = [
  [1, 1, "Character and point of view", ["Identify narrator perspective and its effect", "Track character motivation across a passage"], "# Character\n\nAsk who is speaking, what they know, and how their perspective shapes the passage's meaning."],
  [1, 2, "Theme and tone in fiction", ["Infer central theme from details and structure", "Distinguish tone from mood using word choice"], "# Theme and tone\n\nThemes emerge from repeated images and conflicts—not from a single sentence."],
  [1, 3, "Poetry and figurative language", ["Interpret metaphor, simile, and symbolism", "Connect structure to meaning in short poems"], "# Poetry\n\nRead line breaks and punctuation as part of the poem's argument."],
  [2, 1, "Primary source analysis", ["Identify an author's claim in historical texts", "Connect evidence to the historical context"], "# Primary sources\n\nLook for purpose, audience, and the problem the author addresses."],
  [2, 2, "Argument in social science", ["Map claim, evidence, and reasoning in expository prose", "Evaluate how data supports a conclusion"], "# Social science\n\nAuthors often qualify claims—note hedging words like *often* or *may*."],
  [2, 3, "Comparing perspectives", ["Contrast two authors' views on the same issue", "Explain how evidence leads to different conclusions"], "# Perspectives\n\nAlignment questions ask what both authors would agree—or disagree—about."],
  [3, 1, "Science passage structure", ["Locate the hypothesis and experimental setup", "Follow cause-and-effect chains in prose"], "# Science structure\n\nMany passages move from observation → method → result → implication."],
  [3, 2, "Interpreting data in context", ["Read tables and graphs embedded in passages", "Connect numerical trends to the author's claim"], "# Data in passages\n\nThe text usually explains *why* a trend matters, not just *what* it shows."],
  [3, 3, "Vocabulary in technical writing", ["Use context to define domain-specific terms", "Avoid bringing outside science knowledge to answers"], "# Technical vocabulary\n\nAnswers must be supported by the passage, not general textbook facts."],
  [4, 1, "Sentence boundaries and clarity", ["Fix comma splices and run-on sentences", "Choose the most concise grammatically correct option"], "# Sentence clarity\n\nShorter is not always correct—meaning and grammar both matter."],
  [4, 2, "Pronouns and modifiers", ["Ensure pronouns have clear antecedents", "Place modifiers next to what they describe"], "# Modifiers\n\nMisplaced modifiers often create humorous wrong answers—read literally."],
  [4, 3, "Transitions and organization", ["Select logical transition words between sentences", "Improve flow without changing the author's intent"], "# Transitions\n\n*However*, *therefore*, and *for example* signal different logical relationships."],
  [5, 1, "Active reading and annotation", ["Mark thesis, evidence, and pivot words", "Predict questions before reading answer choices"], "# Annotation\n\nUnderline the first and last sentences of each paragraph—they anchor meaning."],
  [5, 2, "Evidence-based elimination", ["Reject choices not supported by the text", "Avoid extremes unless the passage is extreme"], "# Elimination\n\nThree wrong answers are usually too broad, too narrow, or off-topic."],
  [5, 3, "Timing and module strategy", ["Budget time per passage and question type", "Use a two-pass approach for hard items"], "# Pacing\n\nFlag and return—never spend three minutes on one question early in a module."],
];

async function main() {
  loadEnv();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: existing } = await supabase
    .from("course_units")
    .select("id")
    .eq("track_id", TRACK);
  if (existing?.length) {
    for (const u of existing) {
      await supabase.from("course_lessons").delete().eq("unit_id", u.id);
    }
    await supabase.from("course_units").delete().eq("track_id", TRACK);
  }

  const unitIds = {};
  for (const [ord, title, description] of UNITS) {
    const { data, error } = await supabase
      .from("course_units")
      .insert({ track_id: TRACK, ord, title, description })
      .select("id")
      .single();
    if (error) throw error;
    unitIds[ord] = data.id;
  }

  for (const [unitOrd, lessonOrd, title, objectives, body] of LESSONS) {
    const { error } = await supabase.from("course_lessons").insert({
      unit_id: unitIds[unitOrd],
      ord: lessonOrd,
      title,
      objectives,
      body_markdown: body,
      review_status: "published",
      source_pdf_name: "sch00l-original-oer-aligned",
    });
    if (error) throw error;
  }

  console.log("Seeded", TRACK, "—", LESSONS.length, "lessons");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
