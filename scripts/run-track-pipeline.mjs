#!/usr/bin/env node
/** Seed → ingest → publish → polish for one track. */
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const track = process.argv[2];
const flags = new Set(process.argv.slice(3));
if (!track) {
  console.error("Usage: node scripts/run-track-pipeline.mjs <track> [--skip-seed] [--refresh]");
  process.exit(1);
}

function run(cmd, args) {
  console.log("\n>", cmd, args.join(" "));
  const r = spawnSync(cmd, args, { cwd: path.join(__dirname, ".."), stdio: "inherit", shell: true });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

const seedScript = {
  "sat-reading": "seed-sat-reading.mjs",
  "act-math": "seed-act-math.mjs",
  "act-science": "seed-act-science.mjs",
  "act-english": "seed-act-english.mjs",
  "ap-stats": "seed-ap-stats.mjs",
  "college-calc-1": "seed-college-calc-1.mjs",
  "college-calc-2": "seed-college-calc-2.mjs",
  "college-physics-1": "seed-college-physics-1.mjs",
  "college-gen-chem-1": "seed-college-gen-chem-1.mjs",
  "college-gen-chem-2": "seed-college-gen-chem-2.mjs",
  "college-calc-3": "seed-college-calc-3.mjs",
  "college-linear-algebra": "seed-college-linear-algebra.mjs",
  "college-physics-2": "seed-college-physics-2.mjs",
  "college-stats-intro": "seed-college-stats-intro.mjs",
  "college-discrete-math": "seed-college-discrete-math.mjs",
  "college-org-chem": "seed-college-org-chem.mjs",
  "college-differential-equations": "seed-college-differential-equations.mjs",
  "ap-calc-ab": "seed-ap-calc-ab.mjs",
}[track];

const polishScript = {
  "sat-reading": "polish-sat-reading-lessons.ts",
  "act-math": "polish-act-math-lessons.ts",
  "act-science": "polish-act-science-lessons.ts",
  "act-english": "polish-act-english-lessons.ts",
  "ap-stats": "polish-ap-stats-lessons.ts",
  "college-calc-1": "polish-college-calc-1-lessons.ts",
  "college-calc-2": "polish-college-calc-2-lessons.ts",
  "college-physics-1": "polish-college-physics-1-lessons.ts",
  "college-gen-chem-1": "polish-college-gen-chem-1-lessons.ts",
  "college-gen-chem-2": "polish-college-gen-chem-2-lessons.ts",
  "college-calc-3": "polish-college-calc-3-lessons.ts",
  "college-linear-algebra": "polish-college-linear-algebra-lessons.ts",
  "college-physics-2": "polish-college-physics-2-lessons.ts",
  "sat-math": "polish-sat-math-lessons.ts",
  "ap-bio": "polish-ap-bio-lessons.ts",
  "ap-chem": "polish-ap-chem-lessons.ts",
  "ap-calc-ab": "polish-ap-calc-ab-lessons.ts",
  "ap-physics-1": "polish-ap-physics-1-lessons.ts",
  "ap-physics-2": "polish-ap-physics-2-lessons.ts",
  "ap-physics-c": "polish-ap-physics-c-lessons.ts",
  "college-stats-intro": "polish-college-stats-intro-lessons.ts",
  "college-discrete-math": "polish-college-discrete-math-lessons.ts",
  "college-org-chem": "polish-college-org-chem-lessons.ts",
  "college-differential-equations": "polish-college-differential-equations-lessons.ts",
}[track];

run("node", ["scripts/prepare-downloads.mjs"]);
if (!flags.has("--skip-seed") && seedScript) run("node", [`scripts/${seedScript}`]);
if (flags.has("--refresh")) run("node", ["scripts/delete-publisher-lessons.mjs", track]);
run("node", ["scripts/ingest-licensed-pdf.mjs", "--track", track, "--from-downloads", "--apply"]);
if (!flags.has("--skip-rewrite"))
  run("npx", ["tsx", "scripts/rewrite-publisher-lessons.ts", track, "--limit", "100"]);
run("node", ["scripts/publish-track-drafts.mjs", track]);
if (polishScript) run("npx", ["tsx", `scripts/${polishScript}`]);
