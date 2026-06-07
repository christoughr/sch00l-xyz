#!/usr/bin/env node
/**
 * Convert azw3/fb2/mobi → epub; OCR known image-only PDFs before ingest.
 * Usage: node scripts/prepare-downloads.mjs
 */
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOWNLOADS = path.join(process.env.USERPROFILE || "C:\\Users\\Administrator", "Downloads");
const CALIBRE = "C:\\Program Files\\Calibre2\\ebook-convert.exe";

/** PDFs that need OCR (image scans). Add filenames as we identify them. */
const OCR_PDFS = new Set([
  "annas-arch-69a2025c9d90.pdf",
]);

function convert(inPath, outPath) {
  if (fs.existsSync(outPath)) {
    const inM = fs.statSync(inPath).mtimeMs;
    const outM = fs.statSync(outPath).mtimeMs;
    if (outM >= inM) {
      console.log("Skip (up to date):", path.basename(outPath));
      return true;
    }
  }
  if (!fs.existsSync(CALIBRE)) {
    console.error("Calibre not found at", CALIBRE);
    return false;
  }
  console.log("Converting:", path.basename(inPath), "→", path.basename(outPath));
  const r = spawnSync(CALIBRE, [inPath, outPath, "--enable-heuristics"], {
    stdio: "inherit",
    shell: false,
  });
  return r.status === 0 && fs.existsSync(outPath);
}

const converted = [];
const ocr = [];

for (const name of fs.readdirSync(DOWNLOADS)) {
  const full = path.join(DOWNLOADS, name);
  if (!fs.statSync(full).isFile()) continue;
  if (/\.(azw3|fb2|mobi)$/i.test(name)) {
    const out = path.join(DOWNLOADS, name.replace(/\.(azw3|fb2|mobi)$/i, ".converted.epub"));
    if (convert(full, out)) converted.push(path.basename(out));
  }
}

for (const name of OCR_PDFS) {
  const full = path.join(DOWNLOADS, name);
  if (!fs.existsSync(full)) continue;
  const out = path.join(DOWNLOADS, name.replace(/\.pdf$/i, ".ocr.epub"));
  console.log("OCR target:", name);
  if (convert(full, out)) ocr.push(path.basename(out));
}

console.log("\nConverted ebooks:", converted.length, converted);
console.log("OCR epubs:", ocr.length, ocr);
