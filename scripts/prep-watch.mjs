#!/usr/bin/env node
/**
 * Live rewrite + quiz progress with elapsed time and ETA.
 * Usage:
 *   node scripts/prep-watch.mjs          # refresh every 60s
 *   node scripts/prep-watch.mjs --once   # single snapshot
 *   node scripts/prep-watch.mjs --interval 30
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { loadEnvLocal } from "./load-env.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const statePath = path.join(root, ".prep-watch-state.json");

const once = process.argv.includes("--once");
const intervalIdx = process.argv.indexOf("--interval");
const intervalSec =
  intervalIdx >= 0 ? Math.max(10, Number(process.argv[intervalIdx + 1]) || 60) : 60;

loadEnvLocal(root);

function wasLlmRewritten(body) {
  return (
    /### Key ideas/i.test(body) &&
    /### Practice/i.test(body) &&
    /Ask the AI tutor to quiz you on this topic/i.test(body)
  );
}

function needsRewrite(body, source) {
  if (!body?.trim() || source === "sch00l-original-oer-aligned") return false;
  if (wasLlmRewritten(body)) return false;
  if (source) return true;
  if (/### Study notes \(extract|publisher source:/i.test(body)) return true;
  const plain = body.replace(/[#*_`\[\]()>-]/g, " ").replace(/\s+/g, " ").trim();
  if (plain.length > 400 && (body.match(/###/g)?.length ?? 0) <= 1) return true;
  if (/### Key ideas/i.test(body) && !/### Worked example/i.test(body) && plain.length > 500)
    return true;
  return false;
}

function fmtDuration(ms) {
  if (!Number.isFinite(ms) || ms < 0) return "—";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

function bar(done, total, width = 28) {
  if (!total) return "[" + " ".repeat(width) + "]";
  const n = Math.min(width, Math.round((done / total) * width));
  return "[" + "█".repeat(n) + "░".repeat(width - n) + "]";
}

async function snapshot() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: units } = await supabase.from("course_units").select("track_id, id");
  const byTrack = {};
  let rewritten = 0;
  let pending = 0;
  let publisher = 0;

  for (const u of units ?? []) {
    const { data: lessons } = await supabase
      .from("course_lessons")
      .select("body_markdown, source_pdf_name, ord")
      .eq("unit_id", u.id);
    for (const l of lessons ?? []) {
      byTrack[u.track_id] ??= { total: 0, rewritten: 0, pending: 0, publisher: 0 };
      byTrack[u.track_id].total++;
      const isPub =
        l.source_pdf_name && l.source_pdf_name !== "sch00l-original-oer-aligned";
      if (isPub) {
        publisher++;
        byTrack[u.track_id].publisher++;
      }
      if (wasLlmRewritten(l.body_markdown ?? "")) {
        rewritten++;
        byTrack[u.track_id].rewritten++;
      } else if (needsRewrite(l.body_markdown ?? "", l.source_pdf_name)) {
        pending++;
        byTrack[u.track_id].pending++;
      }
    }
  }

  const { count: quizCount } = await supabase
    .from("lesson_quiz_items")
    .select("id", { count: "exact", head: true });

  return {
    at: Date.now(),
    rewritten,
    pending,
    publisher,
    total: rewritten + pending,
    quizCount: quizCount ?? 0,
    byTrack,
  };
}

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(statePath, "utf8"));
  } catch {
    return { startedAt: Date.now(), baseline: null, last: null };
  }
}

function saveState(state) {
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
}

function render(cur, state) {
  const now = cur.at;
  if (!state.startedAt) state.startedAt = now;
  if (!state.baseline) state.baseline = { at: now, rewritten: cur.rewritten };

  const elapsed = now - state.startedAt;
  const sinceLast = state.last ? now - state.last.at : 0;
  const deltaRewrite = state.last ? cur.rewritten - state.last.rewritten : 0;
  const deltaQuiz = state.last ? cur.quizCount - state.last.quizCount : 0;

  const doneSinceStart = cur.rewritten - state.baseline.rewritten;
  const runMs = now - state.baseline.at;
  const ratePerMin = runMs > 0 ? (doneSinceStart / runMs) * 60000 : 0;
  const etaMs = ratePerMin > 0 ? (cur.pending / ratePerMin) * 60000 : Infinity;

  console.clear();
  console.log("=== sch00l prep watch ===");
  console.log(`Updated: ${new Date(now).toLocaleTimeString()}`);
  console.log(`Session elapsed: ${fmtDuration(elapsed)}`);
  console.log("");
  console.log(
    `Paraphrase  ${bar(cur.rewritten, cur.rewritten + cur.pending)}  ${cur.rewritten}/${cur.rewritten + cur.pending}`
  );
  console.log(`  pending: ${cur.pending}  ·  rate: ${ratePerMin.toFixed(1)}/min (last ${fmtDuration(sinceLast)}: +${deltaRewrite})`);
  console.log(`  ETA rewrite: ${Number.isFinite(etaMs) ? fmtDuration(etaMs) : "—"} (~${ratePerMin > 0 ? Math.ceil(cur.pending / ratePerMin) : "?"} min at current rate)`);
  console.log("");
  console.log(`Quiz bank: ${cur.quizCount} items (+${deltaQuiz} since last refresh)`);
  console.log(`Publisher lessons in DB: ${cur.publisher}`);
  console.log("");
  console.log("Tracks with pending rewrites (top 12):");
  for (const [track, v] of Object.entries(cur.byTrack)
    .filter(([, v]) => v.pending > 0)
    .sort((a, b) => b[1].pending - a[1].pending)
    .slice(0, 12)) {
    console.log(
      `  ${track.padEnd(28)} ${bar(v.rewritten, v.total, 16)} ${v.rewritten}/${v.total} (${v.pending} left)`
    );
  }
  console.log("");
  console.log("Tip: Ctrl+C to stop watching. Progress saves to .prep-watch-state.json");
  console.log("Ingest: run pipelines in another terminal; publisher lesson count will grow here.");

  state.last = { at: now, rewritten: cur.rewritten, quizCount: cur.quizCount };
  saveState(state);
}

async function main() {
  const state = loadState();
  do {
    const cur = await snapshot();
    render(cur, state);
    if (once) break;
    await new Promise((r) => setTimeout(r, intervalSec * 1000));
  } while (true);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
