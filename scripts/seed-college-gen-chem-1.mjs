#!/usr/bin/env node
/** Seed college-gen-chem-1. node scripts/seed-college-gen-chem-1.mjs */
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

const TRACK = "college-gen-chem-1";
const UNITS = [
  [1, "Matter & measurement", "Units, significant figures, and the mole"],
  [2, "Atomic structure", "Electrons, periodic trends, and nomenclature"],
  [3, "Bonding & geometry", "Lewis structures, VSEPR, and intermolecular forces"],
  [4, "Reactions & stoichiometry", "Balancing, limiting reagent, and solutions"],
  [5, "Thermochemistry & gases", "Enthalpy, gas laws, and exam synthesis"],
];

const LESSONS = [
  [1, 1, "SI units and dimensional analysis", ["Convert between metric prefixes", "Use factor-label method"], "# Units\n\nTreat units like algebra—only add quantities with the same dimension. Density, concentration, and rate problems start with a unit roadmap."],
  [1, 2, "Significant figures and uncertainty", ["Report measurements with correct precision", "Propagate uncertainty in multiplication and addition"], "# Sig figs\n\nMultiplication/division: result matches fewest sig figs in inputs. Addition: fewest decimal places."],
  [1, 3, "The mole and molar mass", ["Convert between grams, moles, and particles", "Use molar mass from the periodic table"], "# Mole\n\n1 mol = 6.022×10²³ entities. Molar mass (g/mol) is the bridge between lab mass and particle count."],
  [2, 1, "Atomic models and electron configuration", ["Write configurations and orbital diagrams", "Apply aufbau, Pauli, and Hund's rules"], "# Electrons\n\nValence electrons drive bonding and periodic trends—memorize patterns, not every exception."],
  [2, 2, "Periodic trends", ["Compare atomic radius, ionization energy, and electronegativity", "Relate trends to effective nuclear charge"], "# Trends\n\nAcross a period: Z_eff rises → smaller atoms, higher IE. Down a group: more shells → larger radius."],
  [2, 3, "Ions and chemical formulas", ["Name common ions and binary compounds", "Write formulas from charges"], "# Nomenclature\n\nTransition metals need Roman numerals for charge. Polyatomic ions act as units in ionic compounds."],
  [3, 1, "Lewis structures and resonance", ["Draw octet structures for molecules and polyatomic ions", "Identify equivalent resonance forms"], "# Lewis\n\nCount valence electrons first. Formal charge helps pick the best structure when multiple layouts exist."],
  [3, 2, "VSEPR and molecular polarity", ["Predict electron and molecular geometry", "Determine net dipole from bond dipoles"], "# VSEPR\n\nElectron pairs repel—lone pairs compress bond angles. Symmetric molecules can be nonpolar even with polar bonds."],
  [3, 3, "Intermolecular forces", ["Rank IMF strength: dispersion, dipole–dipole, H-bonding", "Connect IMF to boiling point and solubility"], "# IMF\n\nStronger IMF → higher boiling point. *Like dissolves like* follows polarity and hydrogen bonding."],
  [4, 1, "Balancing and reaction types", ["Balance combustion, precipitation, and acid–base equations", "Identify redox by electron transfer"], "# Reactions\n\nConservation of atoms is non-negotiable—balance last for O and H in combustion if stuck."],
  [4, 2, "Stoichiometry and limiting reagent", ["Use mole ratios from balanced equations", "Find theoretical yield and percent yield"], "# Stoichiometry\n\nLimiting reagent: pick one product and compare required vs available moles of each reactant."],
  [4, 3, "Solutions and molarity", ["Compute M = mol/L and dilution C₁V₁ = C₂V₂", "Link solution stoichiometry to titration setups"], "# Solutions\n\nMolarity is moles solute per liter **solution**. In titrations, moles acid = moles base at equivalence (for 1:1 stoichiometry)."],
  [5, 1, "Enthalpy and calorimetry", ["Use q = mcΔT and ΔH for phase changes", "Apply Hess's law to combine steps"], "# Thermochemistry\n\nSign conventions: exothermic ΔH < 0. Hess: enthalpy is a state function—path independent."],
  [5, 2, "Gas laws and kinetic theory", ["Apply ideal gas law PV = nRT", "Relate temperature to average kinetic energy"], "# Gases\n\nR units must match P and V. STP: 0 °C, 1 atm (know your textbook's modern vs legacy STP if cited)."],
  [5, 3, "Semester review strategy", ["Build a formula sheet by topic", "Drill mixed problems under timed conditions"], "# Review\n\nGen Chem I exams mix concepts—tag misses as unit 1–5 and revisit the weakest third of topics first."]];

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
