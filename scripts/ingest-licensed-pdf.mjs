#!/usr/bin/env node
/**
 * Extract text from licensed PDFs + EPUBs → draft lesson SQL.
 *
 * Usage:
 *   node scripts/ingest-licensed-pdf.mjs --track ap-bio --dir ./content/ingest/ap-bio
 *   node scripts/ingest-licensed-pdf.mjs --track ap-bio --from-downloads
 *
 * MOBI: convert to EPUB/PDF first (Calibre).
 */

import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import { extractText, getDocumentProxy } from "unpdf";
import { classifyByNameAndText } from "./classify-downloads.mjs";

const args = process.argv.slice(2);
const trackIdx = args.indexOf("--track");
const dirIdx = args.indexOf("--dir");
const fromDownloads = args.includes("--from-downloads");
const applyToDb = args.includes("--apply");

const trackId = trackIdx >= 0 ? args[trackIdx + 1] : "ap-bio";
const inputDir =
  dirIdx >= 0 ? args[dirIdx + 1] : `content/ingest/${trackId}`;

const DOWNLOADS =
  process.env.USERPROFILE
    ? path.join(process.env.USERPROFILE, "Downloads")
    : "C:\\Users\\Administrator\\Downloads";

const CHUNK_CHARS = 3500;
const MAX_CHUNKS_PER_FILE = 8;
const ORD_START = 100; // avoids collision with 018 seed (ord 1–3 per unit)

function escapeSql(s) {
  return s.replace(/'/g, "''").slice(0, 8000);
}

function chunkText(text) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length < 200) return [];
  const chunks = [];
  for (let i = 0; i < clean.length && chunks.length < MAX_CHUNKS_PER_FILE; i += CHUNK_CHARS) {
    chunks.push(clean.slice(i, i + CHUNK_CHARS));
  }
  return chunks;
}

function lessonTitle(filename, index) {
  const base = path.basename(filename, path.extname(filename)).slice(0, 72);
  return `${base} — part ${index + 1}`;
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

async function extractPdf(filePath) {
  const buf = fs.readFileSync(filePath);
  const pdf = await getDocumentProxy(new Uint8Array(buf));
  const { text } = await extractText(pdf, { mergePages: true });
  return typeof text === "string" ? text : (text ?? []).join("\n");
}

function extractEpub(filePath) {
  const zip = new AdmZip(filePath);
  const parts = [];
  for (const entry of zip.getEntries()) {
    if (entry.isDirectory) continue;
    const name = entry.entryName;
    if (!/\.(xhtml|html|htm|xml)$/i.test(name)) continue;
    if (/nav|toc|copyright|cover/i.test(name)) continue;
    try {
      const raw = entry.getData().toString("utf8");
      const t = stripHtml(raw);
      if (t.length > 100) parts.push(t);
    } catch {
      /* skip bad entry */
    }
  }
  return parts.join("\n\n");
}

function copyFromDownloads(targetDir, track) {
  fs.mkdirSync(targetDir, { recursive: true });
  const names = fs.readdirSync(DOWNLOADS);
  const matches = names.filter((n) => {
    if (!/\.(pdf|epub|zip|txt)$/i.test(n)) return false;
    if (/\.converted\.pdf$/i.test(n)) return false;
    return classifyByNameAndText(n).includes(track);
  });
  for (const name of matches) {
    const src = path.join(DOWNLOADS, name);
    const dest = path.join(targetDir, name);
    if (!fs.statSync(src).isFile()) continue;
    fs.copyFileSync(src, dest);
    console.log("Copied", name);
  }
  return matches.length;
}

function extractHtmlDir(dirPath) {
  const parts = [];
  function walk(d) {
    for (const name of fs.readdirSync(d)) {
      const full = path.join(d, name);
      const st = fs.statSync(full);
      if (st.isDirectory()) walk(full);
      else if (/\.(xhtml|html|htm)$/i.test(name)) {
        const t = stripHtml(fs.readFileSync(full, "utf8"));
        if (t.length > 100) parts.push(t);
      }
    }
  }
  walk(dirPath);
  return parts.join("\n\n");
}

function sanitizeDirName(name) {
  return name.replace(/[^\w.-]+/g, "_").slice(0, 80);
}

function findFilesRecursive(dir, ext) {
  const out = [];
  function walk(d) {
    for (const name of fs.readdirSync(d)) {
      const full = path.join(d, name);
      const st = fs.statSync(full);
      if (st.isDirectory()) walk(full);
      else if (name.toLowerCase().endsWith(ext)) out.push(full);
    }
  }
  walk(dir);
  return out;
}

async function extractZybookZip(filePath, workDir) {
  const zip = new AdmZip(filePath);
  const dest = path.join(
    workDir,
    `zybook-${sanitizeDirName(path.basename(filePath, path.extname(filePath)))}`
  );
  fs.mkdirSync(dest, { recursive: true });
  zip.extractAllTo(dest, true);
  const pdfs = findFilesRecursive(dest, ".pdf");
  for (const pdf of pdfs) {
    try {
      const t = await extractPdf(pdf);
      if (t.trim().length > 200) return t;
    } catch {
      /* try next pdf */
    }
  }
  return extractHtmlDir(dest);
}

async function extractFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".txt") return fs.readFileSync(filePath, "utf8");
  if (ext === ".pdf") return extractPdf(filePath);
  if (ext === ".epub") return extractEpub(filePath);
  if (ext === ".zip") {
    const workDir = path.join(path.dirname(filePath), ".extract");
    fs.mkdirSync(workDir, { recursive: true });
    return extractZybookZip(filePath, workDir);
  }
  return "";
}

function buildLessonBody(fileLabel, preview, fromMobi = false) {
  return (
    `# ${fileLabel}\n\n` +
    `**Publisher source:** ${fromMobi ? "converted from MOBI" : fileLabel}\n\n` +
    `### Study notes (extract — rewrite for publish)\n\n${preview}…\n\n` +
    `---\n*Digital adaptation for sch00l. Align with your publisher agreement before setting published.*`
  );
}

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()])
      process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

async function applyDraftRows(trackId, rows) {
  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Set SUPABASE_SERVICE_ROLE_KEY in .env.local for --apply");
    process.exit(1);
  }
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url, key);

  const { data: unit } = await supabase
    .from("course_units")
    .select("id")
    .eq("track_id", trackId)
    .eq("ord", 1)
    .single();
  if (!unit?.id) {
    console.error(`No course_units for track ${trackId} — run seed SQL first`);
    process.exit(1);
  }

  await supabase
    .from("course_lessons")
    .delete()
    .eq("unit_id", unit.id)
    .gte("ord", ORD_START);

  const batchSize = 25;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize).map((r) => ({
      unit_id: unit.id,
      ord: r.ord,
      title: r.title,
      objectives: ["Master concepts from licensed prep material", "Practice AP-style reasoning"],
      body_markdown: r.body,
      review_status: r.review_status ?? "draft",
      source_pdf_name: r.source,
    }));
    const { error } = await supabase.from("course_lessons").insert(batch);
    if (error) {
      console.error("Insert failed:", error.message);
      process.exit(1);
    }
  }
  console.log(`Applied ${rows.length} draft lessons to Supabase (${trackId}).`);
}

async function main() {
  if (fromDownloads) {
    const n = copyFromDownloads(inputDir, trackId);
    console.log(`Copied ${n} PDF/EPUB/ZIP files from Downloads.`);
  }

  if (!fs.existsSync(inputDir)) {
    fs.mkdirSync(inputDir, { recursive: true });
    console.log(`Created ${inputDir}`);
    process.exit(0);
  }

  const files = fs
    .readdirSync(inputDir)
    .filter((f) => /\.(pdf|epub|zip|txt)$/i.test(f) && !/\.converted\.pdf$/i.test(f))
    .map((f) => path.join(inputDir, f));

  const mobiDirs = fs
    .readdirSync(inputDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name.startsWith("mobi-"))
    .map((d) => path.join(inputDir, d.name));

  const skipped = fs
    .readdirSync(inputDir)
    .filter((f) => /\.mobi$/i.test(f));

  if (skipped.length) {
    console.log(
      `Skipping ${skipped.length} MOBI (convert to EPUB/PDF):`,
      skipped.join(", ")
    );
  }

  if (!files.length && !mobiDirs.length) {
    console.log(`No PDF/EPUB in ${inputDir}. Use --from-downloads or copy files.`);
    process.exit(0);
  }

  const outDir = path.join(inputDir, "out");
  fs.mkdirSync(outDir, { recursive: true });

  const lines = [
    "-- Draft lessons from licensed publisher files",
    `-- track: ${trackId}`,
    "-- review_status = draft until editorial approval",
    "",
  ];

  let globalOrd = ORD_START;
  const draftRows = [];

  for (const file of files) {
    console.log("Processing", path.basename(file));
    let text = "";
    try {
      text = await extractFile(file);
    } catch (e) {
      console.warn("  failed:", e.message);
      continue;
    }
    const chunks = chunkText(text);
    if (!chunks.length) {
      console.warn("  no text extracted");
      continue;
    }
    const sourceName = escapeSql(path.basename(file));

    for (let i = 0; i < chunks.length; i++) {
      const rawTitle = lessonTitle(file, i);
      const title = escapeSql(rawTitle);
      const preview = chunks[i].slice(0, 1800);
      const bodyRaw = buildLessonBody(path.basename(file), preview);
      const body = escapeSql(bodyRaw);
      draftRows.push({
        ord: globalOrd,
        title: rawTitle,
        body: bodyRaw,
        source: path.basename(file),
      });
      lines.push(`
insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, ${globalOrd}, '${title}',
  '["Master concepts from licensed prep material","Practice AP-style reasoning"]'::jsonb,
  E'${body}',
  'draft', '${sourceName}'
from public.course_units u where u.track_id = '${trackId}' and u.ord = 1;`);
      globalOrd++;
    }
  }

  for (const dir of mobiDirs) {
    console.log("Processing MOBI extract", path.basename(dir));
    const text = extractHtmlDir(dir);
    const chunks = chunkText(text);
    if (!chunks.length) {
      console.warn("  no text from MOBI html");
      continue;
    }
    const sourceName = escapeSql(path.basename(dir) + " (from .mobi)");

    for (let i = 0; i < chunks.length; i++) {
      const fakeName = path.basename(dir);
      const rawTitle = `${fakeName} — part ${i + 1}`;
      const title = escapeSql(rawTitle);
      const preview = chunks[i].slice(0, 1800);
      const bodyRaw = buildLessonBody(rawTitle, preview, true);
      const body = escapeSql(bodyRaw);
      draftRows.push({
        ord: globalOrd,
        title: rawTitle,
        body: bodyRaw,
        source: `${path.basename(dir)} (from .mobi)`,
      });
      lines.push(`
insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, ${globalOrd}, '${title}',
  '["Master concepts from licensed prep material","Practice AP-style reasoning"]'::jsonb,
  E'${body}',
  'draft', '${sourceName}'
from public.course_units u where u.track_id = '${trackId}' and u.ord = 1;`);
      globalOrd++;
    }
  }

  const outPath = path.join(outDir, "drafts.sql");
  fs.writeFileSync(outPath, lines.join("\n"));
  const count = globalOrd - ORD_START;
  console.log(
    `Wrote ${outPath} (${count} drafts, ord ${ORD_START}+). Run in Supabase SQL editor.`
  );

  if (applyToDb && draftRows.length) {
    await applyDraftRows(trackId, draftRows);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
