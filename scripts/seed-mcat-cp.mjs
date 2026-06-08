#!/usr/bin/env node
/** Seed mcat-cp (Chem/Phys). node scripts/seed-mcat-cp.mjs */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TRACK = "mcat-cp";

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
  [1, "General chemistry", "Stoichiometry, bonding, thermochemistry, equilibrium"],
  [2, "Physics foundations", "Kinematics, forces, energy, fluids"],
  [3, "Organic & biochem touchpoints", "Functional groups, lab techniques, bio interfaces"],
  [4, "Passage strategy", "C/P MCAT reasoning and data interpretation"],
  [5, "Mixed review", "Timed sets and error log"],
];

const LESSONS = [
  [1, 1, "Stoichiometry and solutions", ["Balance reactions and convert moles", "Use M1V1=M2V1 for dilutions"], "# Stoichiometry\n\nMCAT C/P favors proportional reasoning and unit tracking. Set up mole maps before plugging numbers."],
  [1, 2, "Atomic structure and periodic trends", ["Relate Z, mass number, isotopes", "Predict trends in IE, EN, radius"], "# Atoms\n\nTrends explain bonding and acid/base behavior — link periodic position to reactivity claims in passages."],
  [1, 3, "Equilibrium and acids/bases", ["Write K expressions", "Interpret pH and buffers qualitatively"], "# Equilibrium\n\nLe Châtelier and buffer logic appear constantly in passages — practice verbal predictions without a calculator when possible."],
  [2, 1, "Kinematics and vectors", ["Resolve components", "Use SUVAT for constant acceleration"], "# Kinematics\n\nDraw axes first. MCAT loves relative motion and inclined planes with minimal numbers."],
  [2, 2, "Forces and energy", ["Free-body diagrams", "Conservation of mechanical energy"], "# Forces\n\nIdentify all forces before writing ΣF. Energy methods often shortcut multi-step kinematics."],
  [2, 3, "Fluids and circuits overview", ["Pressure, continuity, buoyancy", "Series/parallel qualitative rules"], "# Fluids & circuits\n\nKnow proportional relationships (e.g., Q=Av, V=IR) for rapid elimination on MCQ options."],
  [3, 1, "Organic functional groups", ["Recognize major classes from structure", "Match reactions to functional group"], "# Organic\n\nNomenclature depth is lighter than orgo course — focus on recognition and lab technique vocabulary."],
  [3, 2, "Biochemistry bridges", ["Amino acids, enzymes, metabolism overview", "Connect chem claims to bio systems"], "# Biochem bridges\n\nC/P passages often mix disciplines — tag whether a claim is thermodynamic, kinetic, or structural."],
  [4, 1, "Reading C/P passages", ["Locate claim vs evidence", "Estimate when exact calc is unnecessary"], "# Passages\n\nUnderline quantities with units. Ask: what experiment would falsify this claim?"],
  [4, 2, "Graphs and research design", ["Interpret axes and controls", "Spot confounds and sample size issues"], "# Data\n\nMCAT rewards knowing what would strengthen/weaken a conclusion without outside knowledge."],
  [5, 1, "Timed mixed set strategy", ["Pace 95 seconds/question average", "Flag and return to heavy calculations"], "# Timing\n\nBank easy points first; batch calculation problems for a second pass with fresh scratch work."],
  [5, 2, "Error log and weak-topic drill", ["Tag misses: chem vs physics vs data", "Rebuild a 20-Q custom set"], "# Review\n\nC/P improvement is topic tagging — drill the weakest third of your error log each week."],
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
    const unitLessons = LESSONS.filter((l) => l[0] === ord);
    for (const [, lOrd, lTitle, objs, body] of unitLessons) {
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
