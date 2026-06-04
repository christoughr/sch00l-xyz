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

const args = process.argv.slice(2);
const trackIdx = args.indexOf("--track");
const dirIdx = args.indexOf("--dir");
const fromDownloads = args.includes("--from-downloads");

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

const DOWNLOAD_PATTERNS = {
  "ap-bio": /biology|ap.?bio/i,
  "ap-chem": /chemistry|ap.?chem|5 steps to a 5.*chem/i,
  "ap-calc-ab": /calculus|ap.?calc|5 steps to a 5.*calc/i,
  "sat-math": /digital sat|sat prep|college.?board|for dummies.*sat/i,
  sat: /digital sat|sat prep|college.?board/i,
  ssat: /ssat/i,
};

function copyFromDownloads(targetDir, track) {
  fs.mkdirSync(targetDir, { recursive: true });
  const pattern = DOWNLOAD_PATTERNS[track] ?? new RegExp(track.replace(/-/g, ".?"), "i");
  const names = fs.readdirSync(DOWNLOADS);
  const matches = names.filter(
    (n) => pattern.test(n) && /\.(pdf|epub)$/i.test(n)
  );
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

async function extractFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".pdf") return extractPdf(filePath);
  if (ext === ".epub") return extractEpub(filePath);
  return "";
}

async function main() {
  if (fromDownloads) {
    const n = copyFromDownloads(inputDir, trackId);
    console.log(`Copied ${n} PDF/EPUB files from Downloads.`);
  }

  if (!fs.existsSync(inputDir)) {
    fs.mkdirSync(inputDir, { recursive: true });
    console.log(`Created ${inputDir}`);
    process.exit(0);
  }

  const files = fs
    .readdirSync(inputDir)
    .filter((f) => /\.(pdf|epub)$/i.test(f))
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
      const title = escapeSql(lessonTitle(file, i));
      const preview = chunks[i].slice(0, 1800);
      const body = escapeSql(
        `# ${lessonTitle(file, i)}\n\n` +
          `**Publisher source:** ${path.basename(file)}\n\n` +
          `### Study notes (extract — rewrite for publish)\n\n${preview}…\n\n` +
          `---\n*Digital adaptation for sch00l. Align with your publisher agreement before setting published.*`
      );
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
      const title = escapeSql(`${fakeName} — part ${i + 1}`);
      const preview = chunks[i].slice(0, 1800);
      const body = escapeSql(
        `# ${fakeName} — part ${i + 1}\n\n` +
          `**Publisher source:** converted from MOBI\n\n` +
          `### Study notes (extract — rewrite for publish)\n\n${preview}…\n\n` +
          `---\n*Digital adaptation for sch00l.*`
      );
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
  console.log(
    `Wrote ${outPath} (${globalOrd - ORD_START} drafts, ord ${ORD_START}+). Run in Supabase SQL editor.`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
