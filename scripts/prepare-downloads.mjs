#!/usr/bin/env node
/**
 * Pre-process Downloads before ingest:
 * - azw3/fb2/mobi → epub (Calibre)
 * - djvu → text (djvutxt)
 * - image-only PDFs → OCR epub (Calibre)
 *
 * Usage: node scripts/prepare-downloads.mjs
 */
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import { extractText, getDocumentProxy } from "unpdf";
import { classifyByNameAndText } from "./classify-downloads.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOWNLOADS = path.join(process.env.USERPROFILE || "C:\\Users\\Administrator", "Downloads");
const CALIBRE = "C:\\Program Files\\Calibre2\\ebook-convert.exe";
const DJVUTXT = "C:\\Program Files (x86)\\DjVuLibre\\djvutxt.exe";
const MAX_AUTO_OCR_BYTES = 80 * 1024 * 1024;

/** Explicit scan PDFs to OCR when no text layer (filename patterns). */
const OCR_NAME_PATTERNS = [
  /study guide and student solutions manual for mcmurry/i,
  /microsoft word - klein_ssm/i,
  /student.?s study guide and solutions manual for organic/i,
];

function isUpToDate(src, dest) {
  if (!fs.existsSync(dest)) return false;
  return fs.statSync(dest).mtimeMs >= fs.statSync(src).mtimeMs;
}

function calibreConvert(inPath, outPath, extraArgs = []) {
  if (isUpToDate(inPath, outPath)) {
    console.log("Skip (up to date):", path.basename(outPath));
    return true;
  }
  if (!fs.existsSync(CALIBRE)) {
    console.error("Calibre not found at", CALIBRE);
    return false;
  }
  console.log("Converting:", path.basename(inPath), "→", path.basename(outPath));
  const r = spawnSync(CALIBRE, [inPath, outPath, "--enable-heuristics", ...extraArgs], {
    stdio: "inherit",
    shell: false,
  });
  return r.status === 0 && fs.existsSync(outPath);
}

function djvuToTxt(inPath, outPath) {
  if (isUpToDate(inPath, outPath)) {
    console.log("Skip (up to date):", path.basename(outPath));
    return true;
  }
  if (!fs.existsSync(DJVUTXT)) {
    console.error("djvutxt not found at", DJVUTXT, "— install DjVuLibre.DjView via winget");
    return false;
  }
  console.log("DjVu → text:", path.basename(inPath));
  const r = spawnSync(DJVUTXT, [inPath, outPath], { stdio: "inherit", shell: false });
  if (r.status !== 0 || !fs.existsSync(outPath)) return false;
  return fs.statSync(outPath).size > 200;
}

async function pdfHasText(filePath, minChars = 120) {
  try {
    const buf = fs.readFileSync(filePath);
    const pdf = await getDocumentProxy(new Uint8Array(buf));
    const { text } = await extractText(pdf, { mergePages: false });
    const pages = Array.isArray(text) ? text : [text];
    const sample = pages.slice(0, 5).join(" ").replace(/\s+/g, " ").trim();
    return sample.length >= minChars;
  } catch {
    return false;
  }
}

function convertedStemName(baseName) {
  const stem = baseName.replace(/\.(pdf|djvu|epub)$/i, "");
  return stem.slice(0, 100).replace(/[^\w.-]+/g, "_");
}

function convertedTxtName(baseName) {
  return `${convertedStemName(baseName)}.converted.txt`;
}

function ocrEpubName(baseName) {
  return baseName.replace(/\.pdf$/i, ".ocr.epub");
}

const converted = [];
const djvuConverted = [];
const ocr = [];

for (const name of fs.readdirSync(DOWNLOADS)) {
  const full = path.join(DOWNLOADS, name);
  if (!fs.statSync(full).isFile()) continue;

  if (/\.(azw3|fb2|mobi)$/i.test(name)) {
    const out = path.join(DOWNLOADS, name.replace(/\.(azw3|fb2|mobi)$/i, ".converted.epub"));
    if (calibreConvert(full, out)) converted.push(path.basename(out));
  }

  if (/\.djvu$/i.test(name)) {
    const out = path.join(DOWNLOADS, convertedTxtName(name));
    if (djvuToTxt(full, out)) djvuConverted.push(path.basename(out));
  }
}

for (const name of fs.readdirSync(DOWNLOADS)) {
  if (!/\.pdf$/i.test(name) || /\.(converted|ocr-text)\.pdf$/i.test(name)) continue;
  if (!OCR_NAME_PATTERNS.some((re) => re.test(name))) continue;
  const tracks = classifyByNameAndText(name);
  if (!tracks.length) continue;

  const full = path.join(DOWNLOADS, name);
  const ocrOut = path.join(DOWNLOADS, ocrEpubName(name));
  if (fs.existsSync(ocrOut) && isUpToDate(full, ocrOut)) continue;
  if (fs.statSync(full).size > MAX_AUTO_OCR_BYTES) {
    console.log("Skip auto-OCR (file too large):", name);
    continue;
  }

  const hasText = await pdfHasText(full);
  if (hasText) continue;

  console.log("Auto-OCR (no text layer):", name, "→", tracks.join("+"));
  if (calibreConvert(full, ocrOut, ["--pdf-engine", "calibre"])) ocr.push(path.basename(ocrOut));
}

console.log("\nConverted ebooks:", converted.length, converted);
console.log("DjVu → text:", djvuConverted.length, djvuConverted);
console.log("OCR epubs:", ocr.length, ocr);
