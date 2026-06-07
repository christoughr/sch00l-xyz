#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tracks = process.argv.slice(2);

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()])
      process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

loadEnv();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

for (const track of tracks) {
  const { data: units } = await supabase
    .from("course_units")
    .select("id")
    .eq("track_id", track);
  const ids = (units ?? []).map((u) => u.id);
  const { count } = await supabase
    .from("course_lessons")
    .select("*", { count: "exact", head: true })
    .in("unit_id", ids)
    .eq("review_status", "published");
  console.log(`${track}: ${count ?? 0} lessons`);
}
