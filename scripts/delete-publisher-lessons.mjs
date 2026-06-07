#!/usr/bin/env node
/** Remove ingested publisher lessons for a track (keeps 15 seed lessons). */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const trackId = process.argv[2];
if (!trackId) {
  console.error("Usage: node scripts/delete-publisher-lessons.mjs <track-id>");
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()])
      process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data: units } = await supabase
  .from("course_units")
  .select("id")
  .eq("track_id", trackId);
if (!units?.length) {
  console.error("No units for", trackId);
  process.exit(1);
}

const { data, error } = await supabase
  .from("course_lessons")
  .delete()
  .in(
    "unit_id",
    units.map((u) => u.id)
  )
  .neq("source_pdf_name", "sch00l-original-oer-aligned")
  .select("id");

if (error) {
  console.error(error.message);
  process.exit(1);
}
console.log(`Deleted ${data?.length ?? 0} publisher lessons for ${trackId}.`);
