#!/usr/bin/env node
/** Seed all new exam/K12 tracks that lack course_units. */
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const TRACKS = [
  ["gmat", "GMAT Focus", "quant verbal data insights"],
  ["gre-quant", "GRE Quant", "math reasoning"],
  ["gre-verbal", "GRE Verbal", "reading vocabulary"],
  ["gre-analytical-writing", "GRE AW", "essays"],
  ["toefl-ibt", "TOEFL iBT", "integrated English"],
  ["ielts-academic", "IELTS Academic", "band skills"],
  ["ielts-general", "IELTS General", "letters practical English"],
  ["med-mmi", "Medical MMI", "interview stations"],
  ["mcat-ps", "MCAT Psych/Soc", "behavioral sciences"],
  ["mcat-cars", "MCAT CARS", "critical analysis"],
  ["k12-k-math", "Kindergarten Math", "counting shapes"],
  ["k12-k-reading", "Kindergarten Reading", "phonics"],
  ["k12-elem-math", "Elementary Math", "operations fractions"],
  ["k12-elem-reading", "Elementary ELA", "comprehension"],
  ["k12-elem-science", "Elementary Science", "NGSS phenomena"],
  ["k12-ms-math", "Middle School Math", "ratios algebra"],
  ["k12-ms-science", "Middle School Science", "cells ecosystems"],
  ["k12-ms-ela", "Middle School ELA", "analysis writing"],
];

for (const [id, label, hint] of TRACKS) {
  console.log("\n>", id);
  const r = spawnSync("node", ["scripts/seed-exam-track.mjs", id, label, hint], {
    cwd: root,
    stdio: "inherit",
    shell: true,
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

console.log("\nDone seeding new tracks.");
