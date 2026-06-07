#!/usr/bin/env node
/** node scripts/seed-act-science.mjs — applies seed via service role */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TRACK = "act-science";

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
  [1, "Data representation", "Graphs, tables, and trend interpretation"],
  [2, "Research summaries", "Experiments, variables, and controlled studies"],
  [3, "Conflicting viewpoints", "Competing scientific models and hypotheses"],
  [4, "Science reasoning", "Integrating multiple figures and passages"],
  [5, "Test strategies", "Pacing, annotation, and outside-knowledge traps"],
];

const LESSONS = [
  [1, 1, "Reading graphs and axes", ["Identify independent and dependent variables", "Describe trends as variables increase or decrease"], "# Graphs\n\nAlways read axis labels and units before answering—ACT traps use unlabeled axes."],
  [1, 2, "Tables and interpolation", ["Extract values from data tables", "Estimate between listed data points"], "# Tables\n\nCircle the row and column headers first; most answers need only two lookups."],
  [1, 3, "Direct and inverse relationships", ["Recognize linear, exponential, and inverse patterns", "Predict values beyond the plotted range cautiously"], "# Relationships\n\nDirect: both variables increase together. Inverse: one rises as the other falls."],
  [2, 1, "Experimental design basics", ["Identify control and experimental groups", "Distinguish independent, dependent, and controlled variables"], "# Experiments\n\nOnly one independent variable should change between groups in a fair test."],
  [2, 2, "Multiple experiments in one passage", ["Compare results across Experiment 1, 2, 3", "Track how a changed variable alters outcomes"], "# Multiple experiments\n\nLater experiments often refine or contradict earlier ones—read the discussion."],
  [2, 3, "Drawing supported conclusions", ["Choose answers backed by the data shown", "Avoid conclusions that require unstated assumptions"], "# Conclusions\n\n*Supported* means you can point to a number or trend in the passage."],
  [3, 1, "Understanding competing models", ["State each scientist's central claim", "List evidence each viewpoint uses"], "# Viewpoints\n\nEach passage presents 2–4 named perspectives—summarize each in one sentence."],
  [3, 2, "Finding agreement and disagreement", ["Identify shared predictions between viewpoints", "Spot where models make opposite claims"], "# Agreement\n\nBoth scientists might agree on a fact but disagree on its cause."],
  [3, 3, "Evaluating new evidence", ["Predict how data would support one model over another", "Eliminate answers inconsistent with any viewpoint"], "# New evidence\n\nAsk: if this result were true, which scientist would say *I told you so*?"],
  [4, 1, "Cross-referencing figures", ["Connect a graph to its accompanying table", "Use figure captions as answer clues"], "# Cross-reference\n\nQuestion stems often say *According to Figure 2*—go there immediately."],
  [4, 2, "Unit conversions in science", ["Convert between metric prefixes when needed", "Check that compared quantities share units"], "# Units\n\nkilo-, centi-, and milli- conversions appear often—write the factor on your scratch paper."],
  [4, 3, "Integrating text and visuals", ["Use the prose to explain anomalies in data", "Answer synthesis questions linking two figures"], "# Integration\n\nWhen stuck, read the paragraph beside the figure—it usually explains the odd point."],
  [5, 1, "Passage order and triage", ["Attempt Data Representation passages first", "Save Conflicting Viewpoints for when warmed up"], "# Passage order\n\nPersonal preference matters—practice to find your fastest sequence."],
  [5, 2, "Avoiding outside knowledge", ["Answer only from information provided", "Recognize when a choice sounds true but isn't in the passage"], "# Outside knowledge\n\nBackground science can mislead you—the ACT tests reading, not memorization."],
  [5, 3, "Time management on science", ["Spend under 5 minutes per passage on average", "Guess on the last few rather than leave blanks"], "# Pacing\n\nThere is no penalty for wrong answers—never leave an bubble empty."],
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
