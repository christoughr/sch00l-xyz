#!/usr/bin/env node
/** Seed college-org-chem. node scripts/seed-college-org-chem.mjs */
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

const TRACK = "college-org-chem";
const UNITS = [
  [1, "Structure & bonding", "Hybridization, resonance, and functional groups"],
  [2, "Alkanes & stereochemistry", "Conformations, chirality, and configuration"],
  [3, "Substitution & elimination", "SN1/SN2, E1/E2, and mechanism prediction"],
  [4, "Alkenes & addition", "Electrophilic addition, alkynes, and regioselectivity"],
  [5, "Spectroscopy & synthesis", "IR/NMR interpretation and retrosynthetic thinking"],
];

const LESSONS = [
  [1, 1, "Hybridization and bond angles", ["Assign sp, sp², and sp³ hybridization", "Relate hybridization to geometry and bond angles"], "# Hybridization\n\nsp³ → tetrahedral (~109.5°), sp² → trigonal planar (~120°), sp → linear (~180°). Lone pairs count as electron domains."],
  [1, 2, "Resonance and acidity", ["Draw resonance contributors and rank stability", "Use pKa trends to predict acid–base equilibria"], "# Resonance\n\nDelocalized charge stabilizes ions—resonance lowers acidity of conjugate acids. More stable conjugate base → stronger acid."],
  [1, 3, "Functional groups overview", ["Identify major organic families by structure", "Predict polarity and intermolecular forces"], "# Functional groups\n\nAlcohols, carbonyls, amines, and halides each bring characteristic reactivity—tag every carbon skeleton with its functional handles."],
  [2, 1, "Alkanes and cycloalkanes", ["Name branched alkanes with IUPAC rules", "Compare ring strain in cycloalkanes"], "# Alkanes\n\nLongest chain defines the parent name; substituents get lowest possible locants. Cyclohexane chair flips swap axial and equatorial positions."],
  [2, 2, "Conformations and Newman projections", ["Draw staggered vs eclipsed conformers", "Rank conformational stability with steric strain"], "# Conformations\n\nAnti staggered is usually lowest energy; gauche raises energy via steric clash. Newman projections make torsion angles visible."],
  [2, 3, "Chirality and configuration", ["Identify stereocenters and enantiomers", "Assign R/S with Cahn–Ingold–Prelog rules"], "# Stereochemistry\n\nEnantiomers have identical physical properties except optical rotation. Meso compounds have internal symmetry and are achiral."],
  [3, 1, "SN1 and SN2 mechanisms", ["Compare unimolecular vs bimolecular substitution", "Predict rate laws and stereochemical outcomes"], "# Substitution\n\nSN2: one step, backside attack, inversion. SN1: carbocation intermediate, racemization at stereocenters, rate depends only on substrate."],
  [3, 2, "E1 and E2 elimination", ["Draw elimination mechanisms and transition states", "Apply Zaitsev's rule for major alkenes"], "# Elimination\n\nE2 needs anti-periplanar geometry; E1 competes with SN1 via carbocations. Strong bases favor elimination over substitution."],
  [3, 3, "Predicting substitution vs elimination", ["Use substrate, base, and solvent to choose pathway", "Design conditions for desired product"], "# Mechanism choice\n\nMethyl/primary + strong nucleophile → SN2. Tertiary + weak nucleophile/heat → SN1/E1. Bulky base + β-hydrogens → E2."],
  [4, 1, "Electrophilic addition to alkenes", ["Add HX, X₂, and H₂O across double bonds", "Use curved-arrow notation for π-bond attacks"], "# Alkene addition\n\nπ electrons attack electrophiles; carbocation or cyclic halonium intermediates set regio- and stereochemistry."],
  [4, 2, "Markovnikov and stereochemistry of additions", ["Apply Markovnikov's rule to regioselectivity", "Predict syn vs anti addition products"], "# Regioselectivity\n\nMarkovnikov: H adds to less substituted carbon, X to more substituted. Anti addition (halohydrin, halogen) vs syn (catalytic hydrogenation)."],
  [4, 3, "Alkynes and hydration", ["Reduce alkynes to cis or trans alkenes", "Hydrate alkynes to carbonyls via enol intermediates"], "# Alkynes\n\nLindlar → cis alkene; Na/NH₃ → trans. Acid-catalyzed hydration gives ketones (internal) or aldehydes (terminal with special reagents)."],
  [5, 1, "IR spectroscopy", ["Match key stretches to functional groups", "Use fingerprint region to confirm identity"], "# IR\n\nO–H broad ~3300, C=O sharp ~1700, C=C ~1600. Absence of a peak is as informative as presence—check for expected functional handles."],
  [5, 2, "NMR spectroscopy", ["Interpret chemical shift, integration, and splitting", "Use DEPT and coupling constants for structure"], "# NMR\n\nδ increases with deshielding. n+1 rule for equivalent neighbors. Exchangeable protons (OH, NH) may not split partners."],
  [5, 3, "Synthesis strategy and review", ["Plan multi-step routes with retrosynthesis", "Drill mechanism and spectroscopy under timed conditions"], "# Synthesis\n\nWork backward from target to available starting materials. Orgo exams reward arrow-pushing, stereochemistry, and spectral evidence together."]];

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
