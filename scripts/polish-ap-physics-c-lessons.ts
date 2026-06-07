#!/usr/bin/env npx tsx
/** npx tsx scripts/polish-ap-physics-c-lessons.ts — after AP Physics C publish */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import {
  planOpenStaxPass,
  planPublisherLessonUpdates,
  isPublisherLesson,
  type LessonRow,
} from "../src/lib/ap-physics-c-lesson-polish";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TRACK = "ap-physics-c";

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
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Add SUPABASE_SERVICE_ROLE_KEY to .env.local");
    process.exit(1);
  }

  const supabase = createClient(url, key);

  const { data: units } = await supabase
    .from("course_units")
    .select("id, ord")
    .eq("track_id", TRACK)
    .order("ord");

  if (!units?.length) {
    console.error("Run seed-ap-physics-c.mjs first");
    process.exit(1);
  }

  const unitIdByOrd = Object.fromEntries(units.map((u) => [u.ord, u.id]));
  const unitIds = units.map((u) => u.id);

  const { data: lessons } = await supabase
    .from("course_lessons")
    .select("id, unit_id, ord, title, body_markdown, source_pdf_name")
    .in("unit_id", unitIds)
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
  const openStaxUpdates = planOpenStaxPass(rows);
  const allUpdates = [...publisherUpdates, ...openStaxUpdates];

  console.log("Publisher lessons:", publisherUpdates.length);
  if (publisherUpdates.length > 0) {
    const dist: Record<number, number> = {};
    for (const u of publisherUpdates) dist[u.unit_ord] = (dist[u.unit_ord] ?? 0) + 1;
    console.log("Distribution:", dist);
    let bumpOrd = 6000;
    for (const id of rows.filter((l) => isPublisherLesson(l.source_pdf_name)).map((l) => l.id)) {
      await supabase.from("course_lessons").update({ ord: bumpOrd++ }).eq("id", id);
    }
  }

  console.log("Applying", allUpdates.length, "updates...");
  for (const u of allUpdates) {
    const { error } = await supabase
      .from("course_lessons")
      .update({
        unit_id: u.unit_id,
        ord: u.ord,
        title: u.title,
        body_markdown: u.body_markdown,
      })
      .eq("id", u.id);
    if (error) console.error(u.title, error.message);
  }

  console.log("Done — https://sch00l.ai/study → AP Physics C");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
