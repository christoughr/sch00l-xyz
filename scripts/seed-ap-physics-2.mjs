#!/usr/bin/env node
/** node scripts/seed-ap-physics-2.mjs — applies 026 seed via service role */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TRACK = "ap-physics-2";

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
  [1, "Fluids & thermodynamics", "Pressure, buoyancy, ideal gas, entropy"],
  [2, "Electrostatics", "Charge, fields, potential, capacitance"],
  [3, "Circuits & magnetism", "RC circuits, magnetism, induction"],
  [4, "Optics & modern physics", "Lenses, interference, quantum, nuclear"],
  [5, "AP exam prep", "Lab skills, FRQ, MCQ review"],
];

const LESSONS = [
  [1, 1, "Fluid statics and pressure", ["Relate pressure to depth and density", "Apply Pascal's principle"], "# Fluids\n\nPressure P = F/A. In a fluid at rest, pressure increases with depth: P = P₀ + ρgh."],
  [1, 2, "Buoyancy and continuity", ["Use Archimedes' principle", "Apply continuity equation A₁v₁ = A₂v₂"], "# Buoyancy\n\nBuoyant force equals weight of displaced fluid."],
  [1, 3, "Thermodynamics and entropy", ["Interpret PV diagrams", "Explain entropy and the second law"], "# Thermodynamics\n\nΔU = Q − W for a system. Entropy tends to increase in isolated systems."],
  [2, 1, "Electric fields and potential", ["Sketch equipotential lines", "Relate field and potential gradient"], "# Electrostatics\n\nE points from high to low potential for positive test charges."],
  [2, 2, "Capacitors and dielectrics", ["Compute energy stored in a capacitor", "Explain dielectric effects"], "# Capacitors\n\nC = Q/V. Energy U = ½CV²."],
  [2, 3, "Gauss's law (qualitative)", ["Identify symmetric charge distributions", "Explain flux conceptually"], "# Gauss's law\n\nElectric flux through a closed surface relates to enclosed charge."],
  [3, 1, "RC circuits", ["Analyze charging and discharging curves", "Use time constant τ = RC"], "# RC circuits\n\nCurrent and voltage change exponentially in RC transients."],
  [3, 2, "Magnetism and forces", ["Use right-hand rules", "Compute force on moving charges"], "# Magnetism\n\nF = qvB sin θ on moving charges in B fields."],
  [3, 3, "Electromagnetic induction", ["Apply Faraday's law qualitatively", "Explain Lenz's law"], "# Induction\n\nChanging magnetic flux induces emf."],
  [4, 1, "Geometric optics", ["Trace rays for lenses and mirrors", "Use thin-lens equation"], "# Optics\n\n1/f = 1/d₀ + 1/dᵢ. Sign conventions matter on FRQs."],
  [4, 2, "Interference and diffraction", ["Explain double-slit patterns", "Connect path difference to phase"], "# Wave optics\n\nConstructive interference when path difference is nλ."],
  [4, 3, "Quantum and nuclear physics", ["Describe photoelectric effect", "Balance nuclear reactions"], "# Modern physics\n\nE = hf for photons. Mass–energy conservation in nuclear decay."],
  [5, 1, "Experimental design", ["Identify systematic vs random error", "Linearize data for interpretation"], "# Lab skills\n\nState independent and dependent variables clearly."],
  [5, 2, "FRQ strategies", ["Write claim–evidence–reasoning paragraphs", "Draw labeled diagrams"], "# FRQs\n\nStart with a diagram and defined positive directions."],
  [5, 3, "Mixed review and pacing", ["Budget time across MCQ clusters", "Build an error log by topic"], "# Exam prep\n\nReturn to flagged questions after a full pass."],
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
