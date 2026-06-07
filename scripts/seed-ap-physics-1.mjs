#!/usr/bin/env node
/** node scripts/seed-ap-physics-1.mjs — applies 025 seed via service role */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TRACK = "ap-physics-1";

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
  [1, "Kinematics & forces", "Motion, Newton's laws, free-body diagrams"],
  [2, "Energy & momentum", "Work, power, collisions, conservation"],
  [3, "Rotation & oscillations", "Torque, SHM, mechanical waves"],
  [4, "Electricity & circuits", "Charge, fields, DC circuits"],
  [5, "AP exam prep", "Lab skills, FRQ, MCQ review"],
];

const LESSONS = [
  [1, 1, "Position, velocity, and acceleration", ["Interpret motion graphs", "Relate displacement, velocity, and acceleration"], "# Kinematics\n\n**Scalars vs vectors:** displacement and velocity are vectors; speed and distance are scalars.\n\n**AP tip:** Always define a positive direction on FRQs."],
  [1, 2, "Newton's laws and free-body diagrams", ["Draw FBDs with correct forces", "Apply ΣF = ma in components"], "# Forces\n\nIdentify weight, normal, tension, and friction only when present. Net force causes acceleration."],
  [1, 3, "Circular motion and gravitation", ["Use centripetal acceleration a = v²/r", "Explain universal gravitation qualitatively"], "# Circular motion\n\nCentripetal acceleration points toward the center."],
  [2, 1, "Work and kinetic energy", ["Compute work from force and displacement", "Use work–energy theorem"], "# Work & energy\n\nWork W = Fd cos θ. Net work changes kinetic energy."],
  [2, 2, "Potential energy and conservation", ["Track mechanical energy in closed systems", "Solve problems with friction losses"], "# Conservation of energy\n\nE = K + U when only conservative forces do work."],
  [2, 3, "Momentum and collisions", ["Apply impulse–momentum theorem", "Analyze elastic and inelastic collisions"], "# Momentum\n\np = mv. In closed systems, total momentum is conserved."],
  [3, 1, "Torque and rotational kinematics", ["Relate angular and linear quantities", "Solve torque equilibrium"], "# Rotation\n\nτ = rF sin θ. Rolling: v = ωr."],
  [3, 2, "Simple harmonic motion", ["Describe SHM with sine/cosine graphs", "Connect period to spring and pendulum"], "# SHM\n\nF = −kx. Period T = 2π√(m/k) for a spring."],
  [3, 3, "Mechanical waves and sound", ["Compare transverse and longitudinal waves", "Use v = fλ"], "# Waves\n\nWave speed depends on medium."],
  [4, 1, "Electric charge and Coulomb's law", ["Explain charging by contact and induction", "Use Coulomb's law qualitatively"], "# Electrostatics\n\nLike charges repel; opposite attract."],
  [4, 2, "DC circuits", ["Apply Ohm's law V = IR", "Analyze series and parallel resistors"], "# Circuits\n\nCurrent is the same in series; voltage splits."],
  [4, 3, "Electric fields and potential (intro)", ["Sketch field lines", "Relate field and potential difference"], "# Fields\n\nE points from + to −."],
  [5, 1, "Experimental design and uncertainty", ["Propagate uncertainty in measurements", "Linearize data for slope meaning"], "# Lab skills\n\nIdentify independent/dependent variables."],
  [5, 2, "FRQ strategies", ["Write paragraph-length responses with claims", "Draw and label diagrams on every FRQ"], "# FRQs\n\nStart with a diagram and coordinate system."],
  [5, 3, "Mixed review and pacing", ["Budget time per MCQ cluster", "Build an error log by topic"], "# Exam prep\n\nMark and return to long calculations."],
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
