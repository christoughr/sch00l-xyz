#!/usr/bin/env node
/** Seed college-physics-2 (E&M). node scripts/seed-college-physics-2.mjs */
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

const TRACK = "college-physics-2";
const UNITS = [
  [1, "Electrostatics", "Charge, Coulomb's law, and electric fields"],
  [2, "Electric potential", "Potential, capacitance, and energy storage"],
  [3, "Circuits", "Current, resistance, DC circuits, and Kirchhoff's rules"],
  [4, "Magnetism", "Magnetic fields, forces, and induction"],
  [5, "EM waves & review", "Maxwell's equations intuition and synthesis"],
];

const LESSONS = [
  [1, 1, "Charge and Coulomb's law", ["Quantize charge and apply superposition", "Compute forces between point charges"], "# Coulomb\n\nF = k q₁q₂/r² along line joining charges. Use unit vectors for components."],
  [1, 2, "Electric field", ["Define **E** = **F**/q_test", "Field of point charges and continuous distributions"], "# Electric field\n\nSuperpose fields from each source. Symmetry often suggests Gauss's law later."],
  [1, 3, "Gauss's law", ["Use flux Φ = ∮ **E·dA**", "Find **E** for highly symmetric charge"], "# Gauss\n\nClosed surface: Φ = Q_enc/ε₀. Spherical, cylindrical, planar symmetry are standard."],
  [2, 1, "Electric potential", ["Relate ΔV to work per charge", "Compute V from point charges"], "# Potential\n\n**E** = −∇V. Potential is scalar—easier to superpose than vector fields."],
  [2, 2, "Capacitors", ["Use C = Q/V and parallel-plate model", "Combine series and parallel capacitors"], "# Capacitors\n\nEnergy U = ½CV² = ½Q²/C. Dielectric changes C by factor κ."],
  [2, 3, "Dielectrics and energy density", ["Explain polarization at introductory level", "Use u = ½ε₀E² for field energy"], "# Dielectrics\n\nField inside dielectric reduced; bound charges matter in advanced treatments."],
  [3, 1, "Current and resistance", ["Apply I = dQ/dt and V = IR", "Use resistivity ρ and geometry"], "# Ohm's law\n\nMicroscopic: **J** = σ**E**. Power P = IV = I²R."],
  [3, 2, "DC circuit analysis", ["Apply Kirchhoff's junction and loop rules", "Simplify resistor networks"], "# Circuits\n\nSign conventions on loop walks—consistent drops and rises."],
  [3, 3, "RC circuits", ["Describe charging/discharging qualitatively", "Use τ = RC for time scale"], "# RC\n\nExponential approach to steady state; capacitor blocks DC at steady state."],
  [4, 1, "Magnetic force and field", ["Use **F** = q**v×B** and **F** = I**L×B**", "Right-hand rules for direction"], "# Magnetism\n\nForces always ⊥ to **v** and **B**—no work from magnetic force alone."],
  [4, 2, "Ampère's law and solenoids", ["Find **B** around long wire and inside solenoid", "Apply Biot–Savart at introductory level"], "# Ampère\n\n∮ **B·dl** = μ₀ I_enc for steady currents."],
  [4, 3, "Faraday's law and induction", ["Compute induced EMF with changing flux", "Lenz's law for direction"], "# Induction\n\nε = −dΦ/dt. Motional EMF when conductors move in **B**."],
  [5, 1, "Inductance and LR circuits", ["Define L and energy ½LI²", "Compare LR time constants to RC"], "# Inductors\n\nInductor opposes change in current; dual behavior to capacitors."],
  [5, 2, "AC circuits intro", ["Use phasors for resistive/reactive elements", "Define RMS values"], "# AC\n\nX_L = ωL, X_C = 1/(ωC). Impedance combines R and reactances."],
  [5, 3, "EM synthesis", ["Connect electrostatics, circuits, and magnetism", "Review problem types for finals"], "# Review\n\nTag problems: fields, potentials, circuits, induction—draw diagrams first."]];

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
