#!/usr/bin/env node
/** Seed college-stats-intro. node scripts/seed-college-stats-intro.mjs */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()])
      process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

const TRACK = "college-stats-intro";
const UNITS = [
  [1, "Exploring data", "Distributions, displays, and descriptive statistics"],
  [2, "Probability & sampling", "Chance models, sampling, and study design"],
  [3, "Inference", "Confidence intervals and significance tests"],
  [4, "Regression", "Correlation, least squares, and residuals"],
  [5, "Multiple variables & design", "ANOVA, chi-square, and multivariable thinking"],
];

const LESSONS = [
  [1, 1, "Variables and displays", ["Classify variables as categorical or quantitative", "Choose appropriate graphs for each type"], "# Data basics\n\nContext matters: label axes, include units, and describe SOCS for distributions."],
  [1, 2, "Center, spread, and outliers", ["Compute mean, median, SD, and IQR", "Explain how outliers affect each measure"], "# Summary statistics\n\nMean and SD are sensitive to outliers; median and IQR are resistant."],
  [1, 3, "Comparing distributions", ["Compare groups with parallel displays", "Avoid misleading scales in graphics"], "# Comparison\n\nWhen comparing groups, match display type and scale across categories."],
  [2, 1, "Probability rules", ["Apply addition and multiplication rules", "Use complements and independence"], "# Probability\n\nP(A or B) uses inclusion–exclusion; P(A and B) needs independence or a conditional."],
  [2, 2, "Sampling and bias", ["Distinguish sampling methods", "Identify bias in surveys and observational studies"], "# Sampling\n\nRandom sampling supports generalization; it does not by itself prove causation."],
  [2, 3, "Random variables", ["Find expected value and SD of discrete RVs", "Recognize binomial settings"], "# Random variables\n\nE(X) and Var(X) linearize with constants; sums of independent RVs add variances."],
  [3, 1, "Confidence intervals", ["Construct intervals for proportions and means", "Interpret confidence levels correctly"], "# Intervals\n\n“We are 95% confident…” refers to the method, not a 95% chance for one interval."],
  [3, 2, "Hypothesis tests", ["State H₀ and Hₐ in context", "Use p-values and fixed α to decide"], "# Testing\n\nReject H₀ when p-value < α; failing to reject is not proof H₀ is true."],
  [3, 3, "Two-sample inference", ["Run two-proportion and two-mean procedures", "Check random, independence, and normality conditions"], "# Two sample\n\nPooled vs unpooled proportions: follow your text’s rule for the course."],
  [4, 1, "Correlation and regression line", ["Interpret r and r² in context", "Fit and use least-squares regression"], "# Regression\n\nCorrelation does not imply causation; regression describes association, not mechanism."],
  [4, 2, "Residual analysis", ["Plot and interpret residuals", "Detect nonlinearity and influential points"], "# Residuals\n\nResidual = observed − predicted. Curved residual patterns mean the model is wrong."],
  [4, 3, "Transformations and prediction", ["Use log or other transforms when needed", "Avoid extrapolation beyond observed x"], "# Transforms\n\nTransforming y or x can linearize relationships—check residual plots after."],
  [5, 1, "Chi-square procedures", ["Run goodness-of-fit and independence tests", "Check expected counts"], "# Chi-square\n\nLarge χ² means observed counts are far from what independence predicts."],
  [5, 2, "ANOVA overview", ["Compare means across several groups", "Read ANOVA tables at a conceptual level"], "# ANOVA\n\nF compares between-group variation to within-group variation."],
  [5, 3, "Semester review strategy", ["Build a formula sheet by topic", "Practice interpreting output, not just computing"], "# Review\n\nIntro stats exams reward clear context statements and correct conditions."]];

async function main() {
  loadEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Add SUPABASE_SERVICE_ROLE_KEY to .env.local");
    process.exit(1);
  }

  const supabase = createClient(url, key);

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
