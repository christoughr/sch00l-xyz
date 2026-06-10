#!/usr/bin/env node
/**
 * Per-track content progress vs catalog.
 * Usage: node scripts/track-progress-report.mjs [--json]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { loadEnvLocal } from "./load-env.mjs";

loadEnvLocal();

const jsonOut = process.argv.includes("--json");
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/** @type {Set<string>} */
const catalogIds = new Set();
for (const file of [
  "src/lib/study-tracks.ts",
  "src/lib/study-tracks-college.ts",
  "src/lib/study-tracks-expanded.ts",
  "src/lib/study-tracks-global.ts",
  "src/lib/study-tracks-k12-exams.ts",
  "src/lib/study-tracks-worldwide.ts",
  "src/lib/study-tracks-state.ts",
]) {
  const text = fs.readFileSync(path.join(root, file), "utf8");
  for (const m of text.matchAll(/id:\s*"([^"]+)"/g)) catalogIds.add(m[1]);
}

const { data: units } = await supabase.from("course_units").select("id, track_id");
const lessonsByTrack = {};
for (const u of units ?? []) {
  const { count } = await supabase
    .from("course_lessons")
    .select("id", { count: "exact", head: true })
    .eq("unit_id", u.id)
    .eq("review_status", "published");
  lessonsByTrack[u.track_id] = (lessonsByTrack[u.track_id] ?? 0) + (count ?? 0);
}

function status(n) {
  if (n >= 100) return "solid";
  if (n >= 20) return "ingested";
  if (n > 0) return "seed-only";
  return "none";
}

const rows = [...catalogIds]
  .filter((id) => id !== "custom")
  .sort()
  .map((id) => {
    const lessons = lessonsByTrack[id] ?? 0;
    return { id, lessons, status: status(lessons) };
  });

const buckets = { solid: [], ingested: [], "seed-only": [], none: [] };
for (const r of rows) buckets[r.status].push(r);

if (jsonOut) {
  console.log(JSON.stringify({ rows, summary: Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, v.length])) }, null, 2));
} else {
  console.log("=== Track progress (catalog vs DB lessons) ===\n");
  for (const [label, list] of Object.entries(buckets)) {
    console.log(`${label.toUpperCase()} (${list.length})`);
    const show = list.slice(0, 40);
    for (const r of show) console.log(`  ${r.id}: ${r.lessons} lessons`);
    if (list.length > 40) console.log(`  … +${list.length - 40} more`);
    console.log("");
  }
}
