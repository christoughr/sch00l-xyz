#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()])
      process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

function stripExtract(body, title) {
  let b = body;
  b = b.replace(/###[^\n]*\n/gi, (h) =>
    /extract/i.test(h) ? "### Key ideas\n\n" : h
  );
  b = b.replace(/\b[Ee]xtract(?:ed|ion)?\b/g, "");
  b = b.replace(/\n{3,}/g, "\n\n").trim();
  if (b.length < 400) {
    b += `\n\n### Key ideas\n\nWork through **${title}** with the AI tutor. Ask for practice questions and explain your reasoning step by step.\n\n### Check your understanding\n\n- Summarize the main concept in your own words.\n- Solve one practice problem without looking at notes.\n- Identify one mistake to avoid on the exam.`;
  }
  return b.trim();
}

loadEnv();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data: lessons } = await supabase
  .from("course_lessons")
  .select("id, title, body_markdown")
  .eq("review_status", "published");

let n = 0;
for (const l of lessons ?? []) {
  if (!/extract/i.test(l.body_markdown ?? "")) continue;
  const body = stripExtract(l.body_markdown, l.title);
  await supabase.from("course_lessons").update({ body_markdown: body }).eq("id", l.id);
  console.log("Fixed:", l.title);
  n++;
}
console.log("Done:", n);
