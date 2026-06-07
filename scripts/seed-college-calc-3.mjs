#!/usr/bin/env node
/** Seed college-calc-3. node scripts/seed-college-calc-3.mjs */
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

const TRACK = "college-calc-3";
const UNITS = [
  [1, "Vectors & 3D geometry", "Dot/cross products, lines, and planes in space"],
  [2, "Partial derivatives", "Functions of several variables, gradients, and chain rule"],
  [3, "Multiple integrals", "Double and triple integrals, Jacobians, and change of variables"],
  [4, "Vector calculus", "Line integrals, Green's theorem, and flux"],
  [5, "Stokes & synthesis", "Divergence theorem, Stokes' theorem, and review"],
];

const LESSONS = [
  [1, 1, "Vectors in R³", ["Compute magnitude, dot product, and projections", "Find angles between vectors"], "# Vectors\n\n**a · b** = |a||b|cos θ. Projection of **a** onto **b**: (a·b/|b|²)**b**."],
  [1, 2, "Cross product and area", ["Use **a × b** for area and normal vectors", "Apply right-hand rule"], "# Cross product\n\n|a×b| = |a||b|sin θ gives parallelogram area. Direction ⊥ to both vectors."],
  [1, 3, "Lines and planes", ["Write parametric line equations", "Use point-normal form for planes"], "# Lines & planes\n\nPlane: a(x−x₀)+b(y−y₀)+c(z−z₀)=0 where ⟨a,b,c⟩ is normal."],
  [2, 1, "Limits and partial derivatives", ["Compute ∂f/∂x and ∂f/∂y from definitions", "Identify continuity in two variables"], "# Partials\n\nTreat other variables as constants when differentiating."],
  [2, 2, "Chain rule and gradients", ["Differentiate composite multivariable functions", "Interpret ∇f as direction of steepest ascent"], "# Gradient\n\n∇f = ⟨f_x, f_y, f_z⟩. Level curves ⊥ to gradient."],
  [2, 3, "Optimization with constraints", ["Find critical points in 2 variables", "Introduce Lagrange multipliers for constraints"], "# Lagrange\n\nAt constrained extrema, ∇f = λ∇g when g=0 defines the constraint surface."],
  [3, 1, "Double integrals over regions", ["Set up ∫∫ f dA in rectangular and polar coordinates", "Choose type I vs type II domains"], "# Double integrals\n\nSketch the region first—wrong bounds are the #1 error."],
  [3, 2, "Triple integrals", ["Integrate in rectangular, cylindrical, and spherical coordinates", "Pick coordinates matching symmetry"], "# Triple integrals\n\nCylindrical for cylinders; spherical for spheres and cones."],
  [3, 3, "Change of variables", ["Use Jacobian for u,v substitutions", "Transform differentials dx dy → |J| du dv"], "# Jacobian\n\n|J| accounts for area/volume scaling under coordinate change."],
  [4, 1, "Line integrals of fields", ["Integrate **F·dr** along curves", "Distinguish work integrals from circulation"], "# Line integrals\n\nParametrize the curve **r**(t), then ∫ **F**(**r**(t))·**r**′(t) dt."],
  [4, 2, "Green's theorem", ["Relate circulation to double integral of curl (2D)", "Apply to conservative fields"], "# Green\n\n∮_C P dx + Q dy = ∬_D (Q_x − P_y) dA for positively oriented simple closed C."],
  [4, 3, "Surface integrals and flux", ["Parametrize surfaces and compute flux ∫∫ **F·n** dS", "Set up integrals for graphs z = g(x,y)"], "# Flux\n\nUnit normal choice matters—stick outward for closed surfaces."],
  [5, 1, "Divergence theorem", ["Relate flux through closed surface to ∭ div **F** dV", "Check orientation (outward normal)"], "# Divergence\n\n∯_S **F**·d**S** = ∭_E div **F** dV for solid E bounded by S."],
  [5, 2, "Stokes' theorem", ["Relate circulation on boundary to ∬ curl **F**·**n** dS", "Connect to Green's theorem as a special case"], "# Stokes\n\n∮_∂S **F**·d**r** = ∬_S curl **F**·d**S** — unify circulation formulas."],
  [5, 3, "Vector calculus review", ["Map which theorem applies to a given integral", "Build a formula sheet by geometry"], "# Synthesis\n\nClosed surface → divergence; open surface with boundary → Stokes; plane region → Green."]];

async function main() {
  loadEnv();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: existing } = await supabase.from("course_units").select("id").eq("track_id", TRACK);
  if (existing?.length) {
    for (const u of existing) await supabase.from("course_lessons").delete().eq("unit_id", u.id);
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
