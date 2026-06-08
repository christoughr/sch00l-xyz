#!/usr/bin/env node
/** Seed college-differential-equations. node scripts/seed-college-differential-equations.mjs */
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

const TRACK = "college-differential-equations";
const UNITS = [
  [1, "First-order ODEs", "Direction fields, separable equations, and integrating factors"],
  [2, "Second-order linear", "Characteristic equations, undetermined coefficients, and variation of parameters"],
  [3, "Laplace transforms", "Transform tables, inverse transforms, and IVPs"],
  [4, "Systems of ODEs", "Phase plane, eigenvalue methods, and stability"],
  [5, "Modeling & review", "Population, mechanical vibrations, and exam synthesis"],
];

const LESSONS = [
  [1, 1, "Direction fields and separable equations", ["Sketch slope fields from dy/dx = f(x, y)", "Solve separable equations with initial conditions"], "# Separable ODEs\n\nRewrite as g(y) dy = f(x) dx, integrate both sides, then apply the IC. Direction fields preview solution behavior before you solve."],
  [1, 2, "Linear first-order and integrating factors", ["Solve y′ + P(x)y = Q(x) with μ(x) = e^∫P", "Recognize exact equations when applicable"], "# Integrating factor\n\nMultiply through by μ to make the left side an exact derivative: d/dx[μy] = μQ. Check for singularities where P is undefined."],
  [1, 3, "Modeling with first-order ODEs", ["Set up mixing, cooling, and growth models", "Interpret parameters in context"], "# First-order models\n\nExponential growth/decay: y′ = ky. Logistic correction slows growth as y approaches capacity. Units must match in every term."],
  [2, 1, "Characteristic equation for constant coefficients", ["Solve ay″ + by′ + cy = 0 via r² + br + c = 0", "Handle repeated and complex roots"], "# Second-order homogeneous\n\nDistinct real roots → exponentials. Complex roots → sinusoids with damping. Repeated root → add te^{rt} term."],
  [2, 2, "Undetermined coefficients", ["Guess particular solutions for standard forcing terms", "Adjust guesses when resonance occurs"], "# Undetermined coefficients\n\nMatch the forcing: polynomials, exponentials, sin/cos. If a guess term appears in y_h, multiply by x (or x²) until independent."],
  [2, 3, "Variation of parameters", ["Build particular solutions when coefficients vary", "Use Wronskian to find u₁′ and u₂′"], "# Variation of parameters\n\nWorks for non-constant coefficients when you know y₁, y₂. y_p = u₁y₁ + u₂y₂ with u₁′y₁ + u₂′y₂ = 0 and u₁′y₁′ + u₂′y₂′ = g."],
  [3, 1, "Laplace transform basics", ["Use linearity and tables for common transforms", "Apply first shift theorem e^{at}f(t) → F(s−a)"], "# Laplace\n\nL{y′} = sY − y(0). Transform turns derivatives into algebra—ideal for IVPs with discontinuous forcing."],
  [3, 2, "Inverse Laplace and partial fractions", ["Decompose rational F(s) for term-by-term inversion", "Complete the square for irreducible quadratics"], "# Inverse Laplace\n\nFactor denominators, cover-up for simple poles, assign Ax + B for quadratics. Check table entries after partial fractions."],
  [3, 3, "Solving IVPs with Laplace", ["Transform the ODE and solve for Y(s)", "Invert to get y(t) and verify initial data"], "# Laplace IVPs\n\nSubstitute ICs before solving for Y(s). Heaviside step functions model switches; translate and shift in s-domain."],
  [4, 1, "First-order systems and phase plane", ["Write x′ = Ax + b as coupled equations", "Classify equilibrium points from eigenvalues"], "# Phase plane\n\nNullclines show where x′ or y′ is zero. Trajectory direction follows the sign of each component of the vector field."],
  [4, 2, "Eigenvalue method for linear systems", ["Solve x′ = Ax with real and complex eigenpairs", "Sketch stable/unstable node, saddle, and spiral behavior"], "# Eigenvalue method\n\nReal distinct λ → exponentials along eigenvectors. Complex λ → spirals. Sign of real part determines stability."],
  [4, 3, "Nonlinear systems overview", ["Linearize near equilibria with the Jacobian", "Recognize limit cycles and conserved quantities"], "# Nonlinear systems\n\nJacobian eigenvalues at an equilibrium predict local behavior. Global behavior may differ—use nullclines and numerical plots."],
  [5, 1, "Population and logistic models", ["Compare Malthusian and logistic growth", "Find equilibria and stability for autonomous equations"], "# Population models\n\nLogistic equilibria at y = 0 and y = K. Stability flips at carrying capacity—sketch solutions for different initial populations."],
  [5, 2, "Mechanical vibrations and resonance", ["Model spring–mass with damping and forcing", "Identify beats and resonance from forcing frequency"], "# Vibrations\n\nm x″ + c x′ + k x = F₀ cos ωt. Undamped resonance when ω = √(k/m). Light damping sharpens resonance peaks."],
  [5, 3, "Course review strategy", ["Build a method sheet by ODE type", "Practice IVPs, systems, and modeling under timed conditions"], "# Review\n\nTag misses by unit: first-order, second-order, Laplace, systems. Finals mix analytic techniques with interpreting slope and phase plots."]];

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
