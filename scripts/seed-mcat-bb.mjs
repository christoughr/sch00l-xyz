#!/usr/bin/env node
/** Seed mcat-bb (Bio/Biochem). node scripts/seed-mcat-bb.mjs */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TRACK = "mcat-bb";

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()])
      process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

const UNITS = [
  [1, "Biomolecules", "Amino acids, proteins, lipids, carbs, nucleic acids"],
  [2, "Metabolism", "Glycolysis, Krebs, ETC, regulation"],
  [3, "Molecular biology", "Replication, transcription, translation, mutations"],
  [4, "Physiology systems", "Organ systems and homeostasis"],
  [5, "Passage strategy", "B/B reasoning and experimental analysis"],
];

const LESSONS = [
  [1, 1, "Amino acids and protein structure", ["Classify side chains", "Relate structure to function"], "# Proteins\n\nKnow levels of structure and what denatures proteins — passages love enzyme mechanism vocabulary."],
  [1, 2, "Enzymes and kinetics", ["Michaelis-Menten intuition", "Inhibitor types from graphs"], "# Enzymes\n\nLink Vmax and Km changes to competitive vs noncompetitive inhibition without memorizing beyond graphs."],
  [1, 3, "Lipids, carbs, and nucleic acids", ["Compare storage vs structural roles", "Base pairing and DNA stability"], "# Biomolecules\n\nTag whether a passage claim is about structure, energy storage, or information flow."],
  [2, 1, "Glycolysis and fermentation", ["Track ATP/NADH yield", "Anaerobic vs aerobic entry"], "# Glycolysis\n\nDraw the pathway skeleton — MCAT tests regulation points (PFK, insulin/glucagon context)."],
  [2, 2, "Krebs and oxidative phosphorylation", ["Follow carbon in and CO2 out", "Chemiosmosis and proton gradient"], "# ETC\n\nOxidation/reduction language must be fluent — who donates electrons to whom?"],
  [2, 3, "Metabolic regulation", ["Hormonal control overview", "Fasted vs fed state priorities"], "# Regulation\n\nThink organ priority: brain needs glucose; adipose stores triglycerides; liver buffers."],
  [3, 1, "Central dogma", ["Replication fidelity mechanisms", "Transcription vs translation location"], "# Dogma\n\nEukaryote compartmentalization is high yield — where does each step occur?"],
  [3, 2, "Mutations and repair", ["Classify mutation outcomes", "Connect to disease passage claims"], "# Mutations\n\nFrame-shift vs missense consequences — tie to protein function predictions."],
  [4, 1, "Cardiovascular and respiratory", ["Pressure/volume loops qualitatively", "Gas exchange and ventilation"], "# CV/Resp\n\nSystems passages reward knowing direction of flow and control variables (CO2, O2, pH)."],
  [4, 2, "Renal, endocrine, and immune overview", ["Nephron segments at high level", "Innate vs adaptive immunity"], "# Systems\n\nDon't over-detail anatomy — focus on homeostasis variables each system defends."],
  [5, 1, "Reading B/B passages", ["Separate background from passage data", "Predict experiment controls"], "# Passages\n\nTreat every figure as a mini experiment — identify independent and dependent variables first."],
  [5, 2, "Mixed review plan", ["Build 30-Q timed set", "Log misses by biochem vs physiology"], "# Review\n\nAlternate content review with passage-only sets to build stamina for dense figures."],
];

async function main() {
  loadEnv();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: existing } = await supabase.from("course_units").select("id").eq("track_id", TRACK);
  if (existing?.length) {
    console.log("Already seeded", TRACK);
    return;
  }

  for (const [ord, title, desc] of UNITS) {
    const { data: unit, error } = await supabase
      .from("course_units")
      .insert({ track_id: TRACK, ord, title, description: desc })
      .select("id")
      .single();
    if (error) throw error;
    for (const [, lOrd, lTitle, objs, body] of LESSONS.filter((l) => l[0] === ord)) {
      const { error: le } = await supabase.from("course_lessons").insert({
        unit_id: unit.id,
        ord: lOrd,
        title: lTitle,
        objectives: objs,
        body_markdown: body,
        review_status: "published",
        source_pdf_name: "sch00l-original-oer-aligned",
      });
      if (le) throw le;
    }
  }
  console.log("Seeded", TRACK, "—", LESSONS.length, "lessons");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
