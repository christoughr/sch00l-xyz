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
  "ap-stats": "seed-ap-stats.mjs",
}[track];

const polishScript = {
  "sat-reading": "polish-sat-reading-lessons.ts",
  "act-math": "polish-act-math-lessons.ts",
  "act-science": "polish-act-science-lessons.ts",
  "ap-stats": "polish-ap-stats-lessons.ts",
  "sat-math": "polish-sat-math-lessons.ts",
  "ap-physics-1": "polish-ap-physics-1-lessons.ts",
  "ap-physics-2": "polish-ap-physics-2-lessons.ts",
}[track];

if (!flags.has("--skip-seed") && seedScript) run("node", [`scripts/${seedScript}`]);
if (flags.has("--refresh")) run("node", ["scripts/delete-publisher-lessons.mjs", track]);
run("node", ["scripts/ingest-licensed-pdf.mjs", "--track", track, "--from-downloads", "--apply"]);
run("node", ["scripts/publish-track-drafts.mjs", track]);
if (polishScript) run("npx", ["tsx", `scripts/${polishScript}`]);
