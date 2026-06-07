#!/usr/bin/env node
/** node scripts/seed-ap-physics-c.mjs — applies 027 seed via service role */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TRACK = "ap-physics-c";

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
  [1, "Kinematics & dynamics", "Calculus-based motion and Newton's laws"],
  [2, "Work, energy & momentum", "Integrals, conservation laws, collisions"],
  [3, "Rotation & oscillations", "Torque, angular momentum, SHM"],
  [4, "Electricity & magnetism", "Fields, Gauss, Ampère, induction"],
  [5, "AP exam prep", "FRQ, MCQ, calculus setups"],
];

const LESSONS = [
  [1, 1, "Calculus kinematics", ["Relate position, velocity, and acceleration with derivatives", "Interpret motion from graphs"], "# Kinematics\n\nv = dx/dt, a = dv/dt. Use definite integrals for displacement when a(t) is known."],
  [1, 2, "Newton's laws with calculus", ["Set up differential equations for motion", "Solve F = ma with variable forces"], "# Dynamics\n\nΣF = ma is a differential equation when F depends on v or x."],
  [1, 3, "Circular and relative motion", ["Use a = v²/r with calculus setups", "Transform between reference frames"], "# Circular motion\n\nCentripetal acceleration requires a net force toward the center."],
  [2, 1, "Work as an integral", ["Compute work W = ∫F·dx", "Apply work–energy theorem"], "# Work\n\nWork by a variable force needs integration along the path."],
  [2, 2, "Potential energy and conservation", ["Derive U from conservative forces", "Track energy with non-conservative work"], "# Energy\n\nF = −dU/dx for one-dimensional conservative forces."],
  [2, 3, "Momentum and center of mass", ["Use ∫v dm for center of mass", "Analyze collisions with calculus"], "# Momentum\n\nImpulse J = ∫F dt = Δp."],
  [3, 1, "Rotational kinematics", ["Relate ω, α, and θ with calculus", "Use I and τ = Iα"], "# Rotation\n\nθ, ω, α mirror linear kinematics with integrals."],
  [3, 2, "Angular momentum", ["Apply L = Iω and τ = dL/dt", "Solve rolling without slipping"], "# Angular momentum\n\nAngular momentum is conserved when net external torque is zero."],
  [3, 3, "Simple harmonic motion", ["Solve F = −kx with calculus", "Connect energy and period"], "# SHM\n\nx(t) = A cos(ωt + φ) for ideal springs."],
  [4, 1, "Electric fields and Gauss's law", ["Compute fields with symmetry", "Use flux integrals"], "# Electrostatics\n\nΦ = ∮E·dA relates to enclosed charge."],
  [4, 2, "Capacitance and circuits", ["Analyze RC transients with calculus", "Use Kirchhoff's rules"], "# Circuits\n\ndq/dt gives current in charging capacitors."],
  [4, 3, "Magnetism and induction", ["Apply Ampère's law and Biot–Savart qualitatively", "Use Faraday's law with flux change"], "# Magnetism\n\nChanging flux induces emf; Lenz's law gives direction."],
  [5, 1, "Calculus setups on FRQs", ["Show derivatives and integrals with labels", "Check units on every line"], "# FRQ calculus\n\nDefine symbols before differentiating or integrating."],
  [5, 2, "Free-response strategies", ["Draw diagrams and coordinate systems", "Write complete reasoning chains"], "# FRQs\n\nParagraph-length responses with claims and evidence."],
  [5, 3, "Mixed review and pacing", ["Split time between Mechanics and E&M sections", "Build an error log"], "# Exam prep\n\nMark long problems and return after a full pass."],
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
