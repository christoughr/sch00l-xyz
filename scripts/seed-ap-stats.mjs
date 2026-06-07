#!/usr/bin/env node
/** node scripts/seed-ap-stats.mjs — applies seed via service role */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TRACK = "ap-stats";

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
  [1, "Exploring data", "Distributions, displays, and summary statistics"],
  [2, "Sampling & experiments", "Study design, bias, and randomization"],
  [3, "Probability", "Random variables, distributions, and expected value"],
  [4, "Inference", "Confidence intervals and significance tests"],
  [5, "Regression & chi-square", "Linear models, residuals, and categorical tests"],
];

const LESSONS = [
  [1, 1, "Describing distributions", ["Interpret shape, center, spread, and outliers", "Compare distributions with parallel dotplots or histograms"], "# Distributions\n\nSOCS: Shape, Outliers, Center, Spread. Always put distributions in context."],
  [1, 2, "Measures of center and spread", ["Choose mean/SD vs median/IQR appropriately", "Describe the effect of outliers on each measure"], "# Center and spread\n\nMean and SD are pulled by outliers; median and IQR resist them."],
  [1, 3, "Graphical displays", ["Construct and read stemplots, histograms, and boxplots", "Identify misleading graph features"], "# Graphs\n\nCheck scale breaks and area vs height in bar charts—visual bias matters on FRQs."],
  [2, 1, "Sampling methods and bias", ["Distinguish SRS, stratified, cluster, and systematic samples", "Identify sources of bias in surveys"], "# Sampling\n\nVoluntary response and convenience samples over-represent willing participants."],
  [2, 2, "Experimental design", ["Define treatments, factors, and control groups", "Explain random assignment and blinding"], "# Experiments\n\nRandom assignment enables cause-and-effect; random sampling enables generalization."],
  [2, 3, "Scope of inference", ["State whether results generalize to a population or a cause", "Identify blocking and matched pairs designs"], "# Scope\n\n*Can we generalize?* needs random sampling. *Can we conclude cause?* needs random assignment."],
  [3, 1, "Probability rules and simulations", ["Apply addition and multiplication rules for events", "Use simulation to estimate long-run probability"], "# Probability\n\nP(A and B) = P(A) × P(B|A) for dependent events—order the conditional carefully."],
  [3, 2, "Random variables and distributions", ["Compute mean and SD of discrete random variables", "Recognize binomial and geometric settings"], "# Random variables\n\nBinomial: fixed n, independent trials, two outcomes, constant p."],
  [3, 3, "Normal distribution", ["Standardize with z-scores", "Use normalcdf and invNorm on the calculator"], "# Normal model\n\nCentral Limit Theorem justifies normal approximations for sample means when n is large."],
  [4, 1, "Confidence intervals for proportions", ["Construct and interpret one-proportion z intervals", "Check conditions: random, 10% rule, success/failure"], "# CI for p\n\nInterpret: we are C% confident the true parameter lies in this interval—not that there's a C% chance."],
  [4, 2, "Significance tests", ["State hypotheses and compute test statistics", "Find p-values and make conclusions in context"], "# Significance\n\nFail to reject H₀ is not proof H₀ is true—only insufficient evidence against it."],
  [4, 3, "Inference for means", ["Run one- and two-sample t procedures", "Check normality and independence conditions"], "# t procedures\n\nUse t when σ is unknown; df and t* depend on the procedure (one sample, paired, two sample)."],
  [5, 1, "Least-squares regression", ["Interpret slope, intercept, and r² in context", "Use the regression line for prediction with caution"], "# Regression\n\nSlope = predicted change in y per one-unit increase in x, holding other variables fixed."],
  [5, 2, "Residuals and model diagnostics", ["Compute and plot residuals vs fitted values", "Identify influential points and extrapolation risk"], "# Residuals\n\nResidual = observed − predicted. Patterns in residual plots mean the linear model is wrong."],
  [5, 3, "Chi-square tests", ["Run goodness-of-fit and homogeneity/independence tests", "Check expected counts and state conclusions"], "# Chi-square\n\nAll expected counts should be at least 5; χ² measures how far observed counts are from expected."],
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
