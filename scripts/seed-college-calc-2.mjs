#!/usr/bin/env node
/** Seed college-calc-2 course units and lessons. node scripts/seed-college-calc-2.mjs */
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

const TRACK = "college-calc-2";
const UNITS = [
  [1, "Integration techniques", "Substitution, parts, partial fractions, and trig integrals"],
  [2, "Applications of integrals", "Area, volume, arc length, and work"],
  [3, "Improper integrals", "Infinite limits and discontinuities"],
  [4, "Sequences & series", "Convergence tests, power series, and Taylor series"],
  [5, "Parametric & polar", "Curves, derivatives, and areas in alternate coordinates"],
];

const LESSONS = [
  [1, 1, "u-substitution review", ["Choose u and du for standard integrals", "Adjust bounds on definite integrals"], "# u-substitution\n\nMatch an inner function and its derivative (up to a constant). For definite integrals, change limits or resubstitute at the end."],
  [1, 2, "Integration by parts", ["Apply ∫u dv = uv − ∫v du", "Use LIATE to pick u"], "# Integration by parts\n\n**LIATE** priority for u: Log, Inverse trig, Algebraic, Trig, Exponential. Tabular method helps repeated parts."],
  [1, 3, "Partial fractions and trig integrals", ["Decompose rational functions for integration", "Use power-reduction for ∫sin^n cos^m"], "# Advanced techniques\n\nPartial fractions: factor denominator, solve for coefficients, integrate term-by-term. Trig: half-angle identities reduce even powers."],
  [2, 1, "Area between curves", ["Set up ∫(top − bottom) dx or dy", "Find intersection points first"], "# Area\n\nSketch regions. Horizontal slices when x = f(y) is easier; vertical when y = f(x) is easier."],
  [2, 2, "Volumes of revolution", ["Disk/washer about an axis", "Shell method when washers are awkward"], "# Volume\n\nDisk: πr² Δx. Washer: π(R² − r²) Δx. Shell: 2πrh Δx — pick the method that avoids solving for x vs y."],
  [2, 3, "Arc length and work", ["Set up ∫√(1 + (dy/dx)²) dx", "Model work as ∫F(x) dx along a path"], "# Applications\n\nWork: force × distance along the motion. Arc length integral comes from √(dx² + dy²)."],
  [3, 1, "Improper integrals type I", ["Evaluate limits at infinity", "Apply p-integral test intuition"], "# Type I\n\n∫_a^∞ f(x) dx = lim_{b→∞} ∫_a^b f(x) dx. Compare to ∫_1^∞ 1/x^p — converges if p > 1."],
  [3, 2, "Improper integrals type II", ["Handle integrands with discontinuities", "Split integrals at singular points"], "# Type II\n\nIf f is unbounded at an interior point c, split at c and take limits from each side."],
  [3, 3, "Comparison and limit comparison", ["Bound integrands with simpler functions", "Use limit comparison for rational tails"], "# Comparison tests\n\nIf 0 ≤ f ≤ g and ∫g converges, ∫f converges. Limit comparison: if f/g → L > 0, both behave the same."],
  [4, 1, "Sequences and convergence", ["Write nth-term formulas", "Apply divergence test and ratio test"], "# Sequences\n\nIf lim a_n ≠ 0, Σa_n diverges. Ratio test: |a_{n+1}/a_n| → L; L < 1 implies absolute convergence."],
  [4, 2, "Power series and radius", ["Find interval of convergence", "Differentiate and integrate series termwise inside radius"], "# Power series\n\nΣ c_n (x − a)^n converges on an interval; check endpoints separately."],
  [4, 3, "Taylor and Maclaurin series", ["Build Taylor polynomials about a center", "Use known series for e^x, sin x, cos x, 1/(1−x)"], "# Taylor series\n\nf(x) = Σ f^(n)(a)/n! · (x−a)^n. Substitute into known series to expand new functions."],
  [5, 1, "Parametric curves", ["Differentiate parametric equations", "Find tangent lines and arc length"], "# Parametric\n\ndx/dt and dy/dt give slope dy/dx = (dy/dt)/(dx/dt). Watch for cusps where dx/dt = 0."],
  [5, 2, "Polar coordinates", ["Convert between polar and Cartesian", "Graph common polar curves"], "# Polar\n\nx = r cos θ, y = r sin θ, r² = x² + y². Symmetry shortcuts reduce plotting work."],
  [5, 3, "Area and length in polar", ["Set up (1/2)∫r² dθ for enclosed area", "Review Calc II exam synthesis"], "# Polar area\n\nA = (1/2)∫_α^β r(θ)² dθ. Mixed review: tag weak topics (series vs techniques) before finals."]];

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
