#!/usr/bin/env node
/** Seed college-gen-chem-2. node scripts/seed-college-gen-chem-2.mjs */
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

const TRACK = "college-gen-chem-2";
const UNITS = [
  [1, "Chemical kinetics", "Rate laws, mechanisms, and catalysis"],
  [2, "Chemical equilibrium", "Kc, Kp, and Le Châtelier's principle"],
  [3, "Acids & bases", "pH, buffers, titrations, and polyprotic systems"],
  [4, "Thermodynamics", "Entropy, Gibbs free energy, and spontaneity"],
  [5, "Electrochemistry", "Cells, Nernst equation, and redox applications"],
];

const LESSONS = [
  [1, 1, "Reaction rates and rate laws", ["Determine order from experimental data", "Relate rate to concentration"], "# Kinetics\n\nRate = k[A]^m[B]^n. Initial rates or integrated plots reveal orders."],
  [1, 2, "Activation energy and catalysis", ["Use Arrhenius equation qualitatively", "Explain how catalysts lower Ea"], "# Activation energy\n\nCatalysts provide an alternate pathway—they are not consumed in the net reaction."],
  [1, 3, "Mechanisms and the rate-determining step", ["Match mechanisms to rate laws", "Identify intermediates"], "# Mechanisms\n\nThe slowest elementary step controls the observed rate law."],
  [2, 1, "Equilibrium constants", ["Write Kc and Kp expressions", "Convert between Kc and Kp"], "# Equilibrium\n\nOnly gases and aqueous species appear in K expressions. Solids and liquids are omitted."],
  [2, 2, "ICE tables and reaction quotient", ["Solve equilibrium concentrations", "Predict shift using Q vs K"], "# ICE\n\nSmall-x approximation works when K is small and initial concentration is large."],
  [2, 3, "Le Châtelier's principle", ["Predict response to stress", "Link partial pressure and concentration changes"], "# Le Châtelier\n\nSystem shifts to partially counteract imposed stress."],
  [3, 1, "Strong vs weak acids and bases", ["Rank acid/base strength", "Calculate pH of strong solutions"], "# Acids\n\nStrong acids ionize completely; weak acids require Ka and ICE."],
  [3, 2, "Buffers and Henderson–Hasselbalch", ["Prepare buffer solutions", "Estimate pH with pKa"], "# Buffers\n\npH = pKa + log([A⁻]/[HA]). Best buffering near pKa."],
  [3, 3, "Acid–base titrations", ["Interpret titration curves", "Choose indicators for equivalence"], "# Titrations\n\nEquivalence moles acid = moles base (for 1:1 stoichiometry)."],
  [4, 1, "Entropy and the second law", ["Predict sign of ΔS", "Relate disorder to phase changes"], "# Entropy\n\nΔS_univ > 0 for spontaneous processes in isolated systems."],
  [4, 2, "Gibbs free energy", ["Compute ΔG = ΔH − TΔS", "Determine spontaneity from ΔG"], "# Gibbs\n\nΔG < 0 spontaneous at constant T,P. ΔG° = −RT ln K links equilibrium."],
  [4, 3, "Coupled reactions and ΔG°", ["Use ΔG° = −nFE° for electrochemical link", "Combine reactions via Hess-style addition"], "# Coupling\n\nUnfavorable steps can be driven by favorable ones when total ΔG < 0."],
  [5, 1, "Galvanic cells and cell notation", ["Draw cell diagrams", "Compute E°cell from half-reactions"], "# Galvanic\n\nCathode reduction, anode oxidation. E°cell = E°cathode − E°anode."],
  [5, 2, "Nernst equation", ["Calculate E under nonstandard conditions", "Relate E to ΔG and K"], "# Nernst\n\nE = E° − (RT/nF) ln Q. At 25 °C: E = E° − (0.0592/n) log Q."],
  [5, 3, "Semester II review strategy", ["Integrate kinetics, equilibrium, and thermodynamics", "Drill mixed problems under timed conditions"], "# Review\n\nGen Chem II exams chain topics—equilibrium constants from kinetics, ΔG from E°."]];

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
