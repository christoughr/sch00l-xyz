#!/usr/bin/env node
/** Seed college-physics-1. node scripts/seed-college-physics-1.mjs */
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

const TRACK = "college-physics-1";
const UNITS = [
  [1, "Kinematics", "Motion in one and two dimensions, vectors, and graphs"],
  [2, "Forces & Newton's laws", "Free-body diagrams, friction, and circular motion"],
  [3, "Energy & momentum", "Work, power, conservation laws, and collisions"],
  [4, "Rotation & oscillations", "Torque, angular kinematics, and SHM"],
  [5, "Fluids & problem-solving", "Pressure, buoyancy, and semester synthesis"],
];

const LESSONS = [
  [1, 1, "Vectors and 1D motion", ["Resolve vectors into components", "Use kinematic equations with consistent signs"], "# Vectors\n\nPick a positive direction and stick with it. **v**, **a**, and **Δx** signs must be consistent in 1D problems."],
  [1, 2, "Projectile motion", ["Separate horizontal and vertical motion", "Find range, max height, and time of flight"], "# Projectiles\n\nHorizontal: a = 0, x = v_x t. Vertical: a = −g (up positive). Symmetric launches: time up equals time down."],
  [1, 3, "Graphs of motion", ["Interpret x–t, v–t, and a–t graphs", "Find displacement from area under v–t"], "# Graphs\n\nSlope of x–t is v; slope of v–t is a. Area under v–t is displacement."],
  [2, 1, "Free-body diagrams", ["Draw all forces on a single object", "Apply ΣF = ma along chosen axes"], "# FBDs\n\nContact forces, tension, friction, weight, normal. Only forces **on** the object—not forces the object exerts on something else."],
  [2, 2, "Friction and inclined planes", ["Use static vs kinetic friction models", "Tilt axes along the plane when helpful"], "# Friction\n\nf_s ≤ μ_s N; f_k = μ_k N. On inclines, split weight into parallel and perpendicular components."],
  [2, 3, "Uniform circular motion", ["Identify centripetal acceleration v²/r", "Connect tension, normal, or gravity to centripetal force"], "# Circular motion\n\nSomething must provide ΣF toward the center—tension on a string, friction on a curve, gravity for orbits (at high level)."],
  [3, 1, "Work and kinetic energy", ["Compute W = F·d cos θ", "Apply work–energy theorem"], "# Work\n\nOnly the force component parallel to displacement does work. Net work changes kinetic energy."],
  [3, 2, "Potential energy and conservation", ["Track gravitational and spring PE", "Use E_initial = E_final when non-conservative work is zero"], "# Energy conservation\n\nDefine a zero level for PE once per problem. Include all forms: KE, U_g, U_s."],
  [3, 3, "Momentum and collisions", ["Use p = mv and impulse–momentum theorem", "Apply conservation in 1D elastic/inelastic collisions"], "# Momentum\n\nImpulse J = Δp = F_avg Δt. Closed system: Σp_before = Σp_after if external impulse is negligible."],
  [4, 1, "Torque and rotational kinematics", ["Relate τ = rF sin θ to angular acceleration", "Use α, ω, θ analogs to linear kinematics"], "# Rotation\n\nSign convention for CCW positive. Rolling without slipping links v = rω and a = rα."],
  [4, 2, "Rotational energy", ["Include I and ω in energy accounting", "Apply conservation with rotation"], "# Rotational KE\n\nKE_rot = ½Iω². For rolling, total KE = ½mv² + ½Iω²."],
  [4, 3, "Simple harmonic motion", ["Recognize restoring force proportional to displacement", "Use period formulas for mass–spring and simple pendulum (small angle)"], "# SHM\n\nx(t) = A cos(ωt + φ). Energy oscillates between KE and PE; total mechanical energy is constant."],
  [5, 1, "Pressure and Pascal's principle", ["Relate P = F/A and hydrostatic pressure ρgh", "Analyze hydraulic lifts and barometers"], "# Fluids static\n\nPressure at depth increases linearly with h in a uniform fluid."],
  [5, 2, "Continuity and Bernoulli", ["Use A v = constant for incompressible flow", "Apply Bernoulli along a streamline"], "# Fluids moving\n\nBernoulli ties pressure, speed, and height—faster flow often means lower pressure in horizontal pipes."],
  [5, 3, "Mixed review and units", ["Check SI units on every final answer", "Build a personal weak-topic drill list"], "# Review\n\nPhysics I rewards setup: diagram, knowns/unknowns, principle, algebra, units check."]];

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
