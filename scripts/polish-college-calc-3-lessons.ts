#!/usr/bin/env npx tsx
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import {
  planOpenStaxPass,
  planPublisherLessonUpdates,
  isPublisherLesson,
  type LessonRow,
} from "../src/lib/college-calc-3-lesson-polish";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TRACK = "college-calc-3";

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()])
      process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

async function main() {
  loadEnv();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data: units } = await supabase
    .from("course_units")
    .select("id, ord")
    .eq("track_id", TRACK)
    .order("ord");
  if (!units?.length) {
    console.error("Run scripts/seed-college-calc-3.mjs first");
    process.exit(1);
  }
  const unitIdByOrd = Object.fromEntries(units.map((u) => [u.ord, u.id]));
  const { data: lessons } = await supabase
    .from("course_lessons")
    .select("id, unit_id, ord, title, body_markdown, source_pdf_name")
    .in("unit_id", units.map((u) => u.id))
    .eq("review_status", "published");
  const rows: LessonRow[] = (lessons ?? []).map((l) => ({
    id: l.id,
    unit_id: l.unit_id,
    unit_ord: units.find((u) => u.id === l.unit_id)?.ord ?? 1,
    ord: l.ord,
    title: l.title,
    body_markdown: l.body_markdown,
    source_pdf_name: l.source_pdf_name,
  }));
  const publisherUpdates = planPublisherLessonUpdates(rows, unitIdByOrd);
  const allUpdates = [...publisherUpdates, ...planOpenStaxPass(rows)];
  console.log("Publisher lessons:", publisherUpdates.length);
  if (publisherUpdates.length > 0) {
    let bumpOrd = 6000;
    for (const id of rows.filter((l) => isPublisherLesson(l.source_pdf_name)).map((l) => l.id)) {
      await supabase.from("course_lessons").update({ ord: bumpOrd++ }).eq("id", id);
    }
  }
  for (const u of allUpdates) {
    await supabase
      .from("course_lessons")
      .update({ unit_id: u.unit_id, ord: u.ord, title: u.title, body_markdown: u.body_markdown })
      .eq("id", u.id);
  }
  console.log("Done — Calculus III");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
