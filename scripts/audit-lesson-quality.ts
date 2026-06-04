#!/usr/bin/env npx tsx
/**
 * List published lessons that still need editorial work.
 * npx tsx scripts/audit-lesson-quality.ts [--track ap-bio] [--json]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LIVE_TRACKS = ["ap-bio", "ap-chem", "sat-math", "ap-calc-ab"] as const;

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()])
      process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

type Flag = "extract" | "publisher_source" | "short_body" | "publisher_title" | "openstax";

function auditLesson(row: {
  id: string;
  title: string;
  body_markdown: string;
  source_pdf_name: string | null;
  track_id: string;
  unit_title: string;
}): Flag[] {
  const flags: Flag[] = [];
  const body = row.body_markdown ?? "";
  const title = row.title ?? "";
  if (/extract/i.test(body) || /replace this block/i.test(body)) flags.push("extract");
  if (/publisher source/i.test(body)) flags.push("publisher_source");
  if (body.length < 280) flags.push("short_body");
  if (/barron|princeton|5 steps|set\s*\d/i.test(title)) flags.push("publisher_title");
  if (/openstax/i.test(body)) flags.push("openstax");
  if (
    row.source_pdf_name &&
    row.source_pdf_name !== "sch00l-original-oer-aligned" &&
    !flags.includes("extract") &&
    body.length < 500
  ) {
    flags.push("short_body");
  }
  return flags;
}

async function main() {
  loadEnv();
  const trackArg = process.argv.find((a) => a.startsWith("--track="))?.split("=")[1]
    ?? (process.argv.includes("--track") ? process.argv[process.argv.indexOf("--track") + 1] : null);
  const asJson = process.argv.includes("--json");
  const tracks = trackArg ? [trackArg] : [...LIVE_TRACKS];

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Need SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const supabase = createClient(url, key);
  const results: Array<{
    track_id: string;
    unit: string;
    id: string;
    title: string;
    source: string | null;
    flags: Flag[];
  }> = [];

  for (const trackId of tracks) {
    const { data: units } = await supabase
      .from("course_units")
      .select("id, title")
      .eq("track_id", trackId);
    if (!units?.length) {
      console.warn(`No units for ${trackId} — skip or run seed SQL`);
      continue;
    }
    const unitMap = Object.fromEntries(units.map((u) => [u.id, u.title]));
    const { data: lessons } = await supabase
      .from("course_lessons")
      .select("id, unit_id, title, body_markdown, source_pdf_name")
      .in("unit_id", units.map((u) => u.id))
      .eq("review_status", "published");

    for (const l of lessons ?? []) {
      const flags = auditLesson({
        id: l.id,
        title: l.title,
        body_markdown: l.body_markdown,
        source_pdf_name: l.source_pdf_name,
        track_id: trackId,
        unit_title: unitMap[l.unit_id] ?? "",
      });
      if (flags.length > 0) {
        results.push({
          track_id: trackId,
          unit: unitMap[l.unit_id] ?? "",
          id: l.id,
          title: l.title,
          source: l.source_pdf_name,
          flags,
        });
      }
    }
  }

  if (asJson) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  console.log(`\nLessons needing editorial: ${results.length}\n`);
  for (const r of results) {
    console.log(`${r.track_id} | ${r.unit} | ${r.title}`);
    console.log(`  id: ${r.id}`);
    console.log(`  flags: ${r.flags.join(", ")}`);
    if (r.source) console.log(`  source: ${r.source}`);
    console.log("");
  }
  console.log("See CONTENT-EDITORIAL.md for workflow.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
