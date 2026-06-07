#!/usr/bin/env node
/** node scripts/seed-act-math.mjs — applies seed via service role */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TRACK = "act-math";

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
  [1, "Number & pre-algebra", "Integers, fractions, ratios, and percents"],
  [2, "Algebra & functions", "Equations, inequalities, quadratics, and graphs"],
  [3, "Geometry & trig", "Plane figures, coordinate geometry, and basic trig"],
  [4, "Statistics & probability", "Data analysis, averages, and counting"],
  [5, "Test strategies", "Calculator use, pacing, and problem-solving tactics"],
];

const LESSONS = [
  [1, 1, "Fractions, decimals, and percents", ["Convert fluently between forms", "Solve percent increase and decrease problems"], "# Fractions and percents\n\nPercent change: (new − old) / old × 100%. Watch for *of* vs *more than* wording."],
  [1, 2, "Ratios and proportions", ["Set up and solve proportion equations", "Apply unit rates in word problems"], "# Ratios\n\nKeep units consistent—cross-multiply only when both sides are pure ratios."],
  [1, 3, "Number properties and operations", ["Use factors, multiples, and prime factorization", "Apply order of operations with nested expressions"], "# Number properties\n\nEven × odd = even; odd + odd = even. These shortcuts save time on plug-in questions."],
  [2, 1, "Linear equations and inequalities", ["Isolate variables in multi-step equations", "Graph and interpret linear inequalities"], "# Linear algebra\n\nClear fractions early by multiplying through by the LCD."],
  [2, 2, "Systems and word problems", ["Solve 2×2 systems by substitution or elimination", "Translate words into algebraic relationships"], "# Systems\n\nDefine variables on the first read—most ACT word problems need only one or two unknowns."],
  [2, 3, "Quadratics and functions", ["Factor or use the quadratic formula", "Evaluate function notation and composite functions"], "# Quadratics\n\nVertex form y = a(x − h)² + k reveals the maximum or minimum immediately."],
  [3, 1, "Angles, triangles, and polygons", ["Apply angle-sum and exterior-angle rules", "Use similar-triangle ratios"], "# Triangles\n\nAA similarity is the most common geometry setup on the ACT."],
  [3, 2, "Circles and coordinate geometry", ["Use distance and midpoint formulas", "Write equations of circles and lines"], "# Coordinate geometry\n\nDistance formula is just the Pythagorean theorem on a grid."],
  [3, 3, "Right-triangle trigonometry", ["Use SOH-CAH-TOA for missing sides and angles", "Recognize special right triangles (30-60-90, 45-45-90)"], "# Trigonometry\n\nACT trig stays in degrees—check that your calculator mode matches."],
  [4, 1, "Mean, median, and data displays", ["Compute measures of center from tables", "Interpret bar graphs, histograms, and scatter plots"], "# Data displays\n\nThe median resists outliers; the mean does not."],
  [4, 2, "Probability and counting", ["Compute simple and compound probabilities", "Use combinations when order does not matter"], "# Probability\n\nP(A or B) = P(A) + P(B) − P(A and B) for overlapping events."],
  [4, 3, "Statistics in context", ["Draw conclusions supported by sample data", "Distinguish correlation from causation"], "# Statistics\n\nA larger sample generally reduces variability in estimates."],
  [5, 1, "Calculator efficiency", ["Know when to compute vs estimate", "Avoid entry errors on multi-step calculations"], "# Calculator\n\nUse stored answers and parentheses—ACT allows most graphing calculators."],
  [5, 2, "Plug-in and backsolving", ["Test answer choices strategically", "Pick friendly numbers for abstract problems"], "# Plug-in\n\nStart with choice (C) on numeric MCQs—it is the middle value."],
  [5, 3, "Pacing and triage", ["Spend ~1 minute per question on average", "Skip and return to lengthy or unfamiliar items"], "# Pacing\n\nThe last 10 questions are often harder—protect time for questions you can solve."],
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
