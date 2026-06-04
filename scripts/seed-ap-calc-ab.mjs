#!/usr/bin/env node
/** Apply 024_seed_ap_calc_ab_course.sql via service role. node scripts/seed-ap-calc-ab.mjs */
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

const TRACK = "ap-calc-ab";
const UNITS = [
  [1, "Limits & continuity", "One-sided limits, continuity, and asymptotic behavior"],
  [2, "Differentiation", "Definition of derivative, rules, and implicit differentiation"],
  [3, "Applications of derivatives", "Optimization, related rates, and curve analysis"],
  [4, "Integration", "Riemann sums, FTC, and u-substitution"],
  [5, "AP exam prep", "FRQ strategies, calculator skills, and review"],
];

const LESSONS = [
  [1, 1, "Limits from graphs and tables", ["Estimate limits numerically and graphically", "Identify discontinuities"], "# Limits\n\nA **limit** describes y-values as x approaches a number (not necessarily at that x). One-sided limits matter when the function behaves differently from left vs right.\n\n**AP tip:** On FRQs, cite the definition or graph behavior — don't just write \"DNE\" without reason."],
  [1, 2, "Continuity and asymptotes", ["Apply the three-part continuity definition", "Classify vertical and horizontal asymptotes"], "# Continuity\n\nf is continuous at a if f(a) exists, the limit as x→a exists, and they are equal. **Removable** holes can be \"filled\"; **infinite** discontinuities often mean vertical asymptotes."],
  [1, 3, "Squeeze theorem and algebraic limits", ["Use squeeze when bounded by simpler functions", "Rationalize or factor to resolve 0/0 forms"], "# Algebraic limits\n\nFactor, conjugate, or compare to bound tricky expressions. Squeeze: if g(x) ≤ f(x) ≤ h(x) near a and g, h share limit L, then f→L."],
  [2, 1, "Definition and basic rules", ["Interpret derivative as instantaneous rate of change", "Apply power, product, and quotient rules"], "# Derivative\n\nf'(x) is the slope of the tangent line. Power rule: d/dx[x^n] = nx^(n−1). Show setup on AP work — notation matters."],
  [2, 2, "Chain rule and implicit differentiation", ["Differentiate composite functions", "Find dy/dx for implicit relations"], "# Chain & implicit\n\nChain: (f(g(x)))' = f'(g(x))·g'(x). Implicit: differentiate both sides with respect to x, then solve for dy/dx."],
  [2, 3, "Motion: position, velocity, acceleration", ["Relate s, v, a via derivatives", "Interpret sign of v and a"], "# Motion\n\nIf s(t) is position, v(t) = s'(t), a(t) = v'(t). Particle changes direction when v changes sign (and v=0 with crossing)."],
  [3, 1, "Extrema and the first derivative test", ["Find critical points", "Classify local max/min"], "# Extrema\n\nCritical points: f'=0 or undefined. First derivative test: sign change of f' across the point tells max vs min."],
  [3, 2, "Concavity and optimization", ["Use second derivative for concavity", "Set up and solve optimization word problems"], "# Optimization\n\nDefine variables, constraint equation, objective function, domain. Check endpoints and critical points — AP readers want a closed interval justification."],
  [3, 3, "Related rates", ["Differentiate with respect to time", "Link multiple changing quantities"], "# Related rates\n\nDraw a diagram, label changing quantities, write an equation relating them, differentiate with respect to t, substitute known rates at an instant."],
  [4, 1, "Riemann sums and definite integrals", ["Approximate area with left/right/midpoint/trapezoid", "Interpret ∫ as net area"], "# Riemann sums\n\nMore rectangles → better area estimate. Definite integral is the limit of Riemann sums when the function is integrable."],
  [4, 2, "Fundamental Theorem of Calculus", ["Connect antiderivatives to definite integrals", "Evaluate using FTC"], "# FTC\n\nIf F' = f, then ∫_a^b f(x) dx = F(b) − F(a). Part 1: derivative of accumulation function rebuilds the integrand."],
  [4, 3, "u-substitution", ["Choose u and du for integrals", "Adjust bounds when integrating definite"], "# u-sub\n\nMatch an inner function and its derivative (up to a constant). For definite integrals, change limits to u-bounds or resubstitute at the end."],
  [5, 1, "Calculator-active vs non-calculator skills", ["Know when graphing calculator helps", "Practice without CAS on Section II Part A"], "# Calculator policy\n\nAB exam mixes calculator and non-calculator sections. Practice both — store common programs only if rules allow for your year."],
  [5, 2, "FRQ scoring rubric habits", ["Show reasoning and units", "Earn points on setup even with arithmetic slips"], "# FRQs\n\nJustify theorems (MVT, IVT, FTC). Label graphs. One sentence can earn a \"reasoning\" point."],
  [5, 3, "Mixed review and error log", ["Tag misses by skill (limits, deriv, integral)", "Build a 10-problem custom set"], "# Review\n\nKeep an error log: problem type, mistake, fix rule. Re-drill weakest skill before full-length practice."],
];

async function main() {
  loadEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Need SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }
  const supabase = createClient(url, key);

  const { data: existing } = await supabase
    .from("course_units")
    .select("id")
    .eq("track_id", TRACK)
    .limit(1);
  if (existing?.length) {
    console.log("ap-calc-ab units already exist — run 024 SQL to reset, or skip");
    process.exit(0);
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

  console.log("Seeded ap-calc-ab:", LESSONS.length, "lessons");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
