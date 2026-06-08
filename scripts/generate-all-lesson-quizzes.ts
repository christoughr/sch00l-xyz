#!/usr/bin/env npx tsx
/**
 * Generate lesson prep quizzes for every track.
 * Usage: npx tsx scripts/generate-all-lesson-quizzes.ts [--limit-per-track N]
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

function runTrack(track: string): Promise<number> {
  return new Promise((resolve) => {
    const child = spawn(
      "npx",
      [
        "tsx",
        "scripts/generate-lesson-quizzes.ts",
        track,
        "--limit",
        limitPerTrack,
      ],
      { cwd: root, stdio: "inherit", shell: true, env: process.env }
    );
    child.on("close", (code) => resolve(code ?? 1));
  });
}

async function main() {
  const { loadEnvLocal } = await import("./load-env.mjs");
  loadEnvLocal(root);
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: units } = await supabase.from("course_units").select("track_id");
  const tracks = [...new Set((units ?? []).map((u) => u.track_id as string))].sort();
  console.log(`Generating quizzes (limit ${limitPerTrack}/track) for ${tracks.length} tracks…`);

  for (const track of tracks) {
    console.log(`\n=== ${track} ===`);
    await runTrack(track);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
