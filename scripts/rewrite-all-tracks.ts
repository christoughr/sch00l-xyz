#!/usr/bin/env npx tsx
/**
 * Paraphrase publisher lessons across every track with course content.
 * Usage: npx tsx scripts/rewrite-all-tracks.ts [--limit-per-track N] [--dry-run]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const limitIdx = process.argv.indexOf("--limit-per-track");
const limitPerTrack =
  limitIdx >= 0 ? String(process.argv[limitIdx + 1]) : "500";
const extraArgs = process.argv.filter(
  (a) => a !== "--limit-per-track" && a !== process.argv[limitIdx + 1]
);

function runTrack(track: string): Promise<number> {
  return new Promise((resolve) => {
    const args = [
      "tsx",
      "scripts/rewrite-publisher-lessons.ts",
      track,
      "--limit",
      limitPerTrack,
      ...extraArgs.filter((a) => a !== process.argv[0] && !a.endsWith("rewrite-all-tracks.ts")),
    ];
    const child = spawn("npx", args, {
      cwd: root,
      stdio: "inherit",
      shell: true,
      env: process.env,
    });
    child.on("close", (code) => resolve(code ?? 1));
  });
}

async function main() {
  const { loadEnvLocal } = await import("./load-env.mjs");
  loadEnvLocal(root);
  if (!process.env.OPENAI_API_KEY && !process.env.GROQ_API_KEY && !process.env.AI_API_KEY) {
    console.error("Set OPENAI_API_KEY in .env.local");
    process.exit(1);
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: units, error } = await supabase
    .from("course_units")
    .select("track_id");
  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  const tracks = [...new Set((units ?? []).map((u) => u.track_id as string))].sort();
  console.log(`Rewriting up to ${limitPerTrack} lessons per track across ${tracks.length} tracks…`);

  let failed = 0;
  for (const track of tracks) {
    console.log(`\n=== ${track} ===`);
    const code = await runTrack(track);
    if (code !== 0) failed++;
  }

  console.log(`\nAll tracks done — ${tracks.length - failed}/${tracks.length} succeeded`);
  if (failed) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
