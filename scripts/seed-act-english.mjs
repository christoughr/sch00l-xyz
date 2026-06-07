#!/usr/bin/env node
/** node scripts/seed-act-english.mjs — applies seed via service role */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TRACK = "act-english";

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
  [1, "Usage & mechanics", "Grammar, punctuation, and sentence structure"],
  [2, "Rhetorical skills", "Organization, clarity, style, and tone"],
  [3, "Reading comprehension", "Main idea, inference, and vocabulary in context"],
  [4, "Writing strategy", "Revision, development, and coherent argument"],
  [5, "Test pacing", "Annotation, elimination, and section timing"],
];

const LESSONS = [
  [1, 1, "Subject-verb agreement and pronouns", ["Match verbs to singular and plural subjects", "Ensure pronouns have clear antecedents"], "# Agreement\n\nCollective nouns and prepositional phrases often hide the true subject—strip modifiers before checking agreement."],
  [1, 2, "Punctuation: commas and apostrophes", ["Fix comma splices and run-on sentences", "Use apostrophes for possession and contractions correctly"], "# Punctuation\n\nA comma before *and* joins two independent clauses—one subject cannot carry two full verbs without a conjunction."],
  [1, 3, "Verb tense and sentence boundaries", ["Maintain consistent tense within a passage", "Choose correct fragments and fused sentences"], "# Tense\n\nShift tense only when the timeline shifts—ACT passages usually stay in one primary tense."],
  [2, 1, "Concision and wordiness", ["Delete redundant words and phrases", "Choose the shortest grammatically correct option"], "# Concision\n\n*Due to the fact that* almost always loses to *because*—ACT rewards direct phrasing."],
  [2, 2, "Transitions and logical flow", ["Select transitions that match cause, contrast, or addition", "Reorder sentences for clearer progression"], "# Transitions\n\n*However* signals contrast; *therefore* signals result—read the sentence before and after."],
  [2, 3, "Style, tone, and word choice", ["Match diction to the passage's formal or informal tone", "Replace vague words with precise alternatives"], "# Style\n\nTone questions ask whether a word is too casual, too harsh, or off-topic for the context."],
  [3, 1, "Main idea and supporting details", ["Identify the central claim of a prose passage", "Distinguish key details from decorative examples"], "# Main idea\n\nThe thesis often appears in the first or last paragraph—summarize before reading choices."],
  [3, 2, "Inference and implied meaning", ["Draw conclusions supported by the text", "Avoid answers that require outside knowledge"], "# Inference\n\nIf you cannot point to a phrase that supports an answer, it is probably wrong."],
  [3, 3, "Vocabulary in context", ["Define words using surrounding sentences", "Eliminate choices that change the sentence's meaning"], "# Vocabulary\n\nPlug each choice back into the sentence—only one preserves both grammar and logic."],
  [4, 1, "Opening sentences and thesis clarity", ["Strengthen introductions that set up the topic", "Ensure the first sentence connects to the rest of the passage"], "# Openings\n\nA strong opener names the topic and establishes scope without repeating the title verbatim."],
  [4, 2, "Developing and supporting ideas", ["Add, cut, or revise sentences to improve development", "Ensure each paragraph has a clear focus"], "# Development\n\nBody paragraphs should advance one idea—cut sentences that repeat or digress."],
  [4, 3, "Revising for organization", ["Move sentences to improve logical order", "Choose conclusions that synthesize rather than introduce"], "# Organization\n\nWhen reordering, track pronouns and transition words—they reveal where a sentence belongs."],
  [5, 1, "Passage annotation", ["Mark topic sentences and underlined portions quickly", "Note whether each question tests usage or rhetoric"], "# Annotation\n\nBracket the underlined portion and read one sentence before and after—it defines the error window."],
  [5, 2, "Answer elimination tactics", ["Use NO CHANGE as a real option, not a default", "Reject choices that alter meaning or introduce new errors"], "# Elimination\n\nTwo answers are often grammatically fine—pick the one that matches the passage's purpose."],
  [5, 3, "Time management on English", ["Spend roughly 36 seconds per question on average", "Skip lengthy rhetoric items and return with time left"], "# Pacing\n\nThe last passage is often the hardest—protect time for questions you can answer quickly."],
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
