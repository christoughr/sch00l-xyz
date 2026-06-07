#!/usr/bin/env node
/**
 * Classify Downloads files into course tracks. Identifies annas-arch* by content.
 * Usage: node scripts/classify-downloads.mjs [--rename]
 */
import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import { extractText, getDocumentProxy } from "unpdf";

const DOWNLOADS = path.join(
  process.env.USERPROFILE || "C:\\Users\\Administrator",
  "Downloads"
);
const rename = process.argv.includes("--rename");

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function previewFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const name = path.basename(filePath).toLowerCase();
  if (ext === ".pdf") {
    try {
      const buf = fs.readFileSync(filePath);
      const pdf = await getDocumentProxy(new Uint8Array(buf));
      const { text } = await extractText(pdf, { mergePages: false });
      const pages = Array.isArray(text) ? text : [text];
      return pages.slice(0, 3).join(" ").slice(0, 4000);
    } catch {
      return "";
    }
  }
  if (ext === ".epub") {
    try {
      const zip = new AdmZip(filePath);
      let out = "";
      for (const entry of zip.getEntries()) {
        if (entry.isDirectory) continue;
        if (!/\.(xhtml|html|htm)$/i.test(entry.entryName)) continue;
        out += stripHtml(entry.getData().toString("utf8")) + " ";
        if (out.length > 4000) break;
      }
      return out.slice(0, 4000);
    } catch {
      return "";
    }
  }
  return name;
}

/** Hand-identified annas-arch files (content sniffed). */
export const ANNAS_ARCH_MANUAL = {
  "annas-arch-92b963a61b8b.pdf": ["sat-math"], // 500 SAT Math Questions
  "annas-arch-d491267c4dae.pdf": ["ap-physics-2"], // Barron's AP Physics 2
  "annas-arch-d9ab746b1238.epub": ["ap-physics-2"], // 5 Steps AP Physics 2 2024
  "annas-arch-f9722fcbd9fe.pdf": ["act-math"], // 500 ACT Math Questions
};

/** @returns {string[]} track ids */
export function classifyByNameAndText(filename, preview = "") {
  if (ANNAS_ARCH_MANUAL[filename]) return ANNAS_ARCH_MANUAL[filename];
  const n = filename.toLowerCase();
  const t = `${n} ${preview.toLowerCase()}`;

  if (/gmat|ssat|subject test math level|in the classroom|teacher/i.test(t)) return [];

  if (/ap\s*statistics|ap\s*stats|practice of statistics.*ap|barron.*statistics|5 steps.*statistics/i.test(t))
    return ["ap-stats"];

  if (/physics\s*c|ap\s*physics\s*c|physics c companion/i.test(t)) return ["ap-physics-c"];
  if (/physics\s*2|ap\s*physics\s*2|sterling.*physics\s*2/i.test(t)) return ["ap-physics-2"];
  if (/physics\s*1|ap\s*physics\s*1|cracking the ap physics 1/i.test(t)) return ["ap-physics-1"];

  if (/^5 steps to a 5 -- greg jacobs/i.test(n)) return ["ap-physics-1"];

  if (/5 steps to a 5.*greg jacobs/i.test(t) && /2018|2019|2020/.test(t)) {
    if (/physics\s*c/i.test(t)) return ["ap-physics-c"];
    if (/physics\s*2/i.test(t)) return ["ap-physics-2"];
    return ["ap-physics-1"];
  }

  if (/500\s+sat\s+math/i.test(t)) return ["sat-math"];

  if (/\bact\s*science\b|500\s+act\s+science/i.test(t)) return ["act-science"];

  if (/conquering.*act.*math.*science|act math.*science prep/i.test(t))
    return ["act-math", "act-science"];

  if (
    /\bact\b/.test(t) &&
    (/act math|top 50 act math|college panda.*act.*math|conquering act math|for the love of act math|ultimate guide to the math act|nova.*act math|bob miller.*act/i.test(t) ||
      (/math/.test(t) && !/sat reading/i.test(t)))
  )
    return ["act-math"];

  if (
    /sat reading|critical reader|reading and writing|reading & writing|sat verbal|ies sat reading|world literature.*sat|sat a\+\s*prep.*reading|digital sat reading|preppros digital sat reading|testmuse digital sat reading|golden book of reading|meltzer/i.test(t) ||
    /top 50 sat reading/i.test(t)
  )
    return ["sat-reading"];

  if (
    /sat math|top 50 sat math|college panda.*sat.*math|orange book|28 new sat math|perfect 800|digital sat math|mcgraw.*sat math|barron.*sat math|sat math mastery|conquering sat math|preppros.*sat math|for dummies.*sat math|cosmic prep digital sat.*math/i.test(t) ||
    (/digital sat/i.test(t) && !/reading|writing/i.test(t))
  )
    return ["sat-math"];

  if (/reading and writing prep for the sat & act|reading and writing workout/i.test(t))
    return ["sat-reading"];

  if (/math and science prep for the sat & act|math and science workout/i.test(t))
    return ["act-math", "sat-math"];

  if (/math workout for the sat/i.test(t)) return ["sat-math"];

  if (/digital sat|sat prep book|princeton review digital sat|mometrix.*sat|vibrant publishers.*digital sat/i.test(t)) {
    if (/reading|writing/i.test(t)) return ["sat-reading"];
    return ["sat-math"];
  }

  if (/biology|ap.?bio/i.test(t)) return ["ap-bio"];
  if (/chemistry|ap.?chem/i.test(t)) return ["ap-chem"];
  if (/calculus|ap.?calc/i.test(t)) return ["ap-calc-ab"];

  return [];
}

function suggestRename(filename, preview, tracks) {
  if (!tracks.length) return null;
  const label = tracks.join("+");
  const ext = path.extname(filename);
  if (/^annas-arch/i.test(filename) || /^5 steps to a 5 -- greg/i.test(filename)) {
    const hint = preview
      .slice(0, 80)
      .replace(/[\r\n]+/g, " ")
      .replace(/[^\w\s-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const base = `[${label}] ${hint || "identified"}`.slice(0, 150);
    return `${base}${ext}`;
  }
  return null;
}

const files = fs.readdirSync(DOWNLOADS).filter((f) => /\.(pdf|epub|fb2|azw3)$/i.test(f));
const report = { unclassified: [], renamed: [], byTrack: {} };

for (const name of files) {
  const full = path.join(DOWNLOADS, name);
  const needsPreview = /^annas-arch/i.test(name) || /^5 steps to a 5 -- greg/i.test(name);
  const preview = needsPreview ? await previewFile(full) : "";
  const tracks = classifyByNameAndText(name, preview);

  if (!tracks.length) {
    report.unclassified.push({ name, preview: preview.slice(0, 120) });
    continue;
  }
  for (const tr of tracks) {
    report.byTrack[tr] = report.byTrack[tr] ?? [];
    report.byTrack[tr].push(name);
  }

  const newName = suggestRename(name, preview, tracks);
  if (rename && newName && newName !== name) {
    const dest = path.join(DOWNLOADS, newName);
    if (!fs.existsSync(dest)) {
      fs.copyFileSync(full, dest);
      report.renamed.push({ from: name, to: newName, tracks });
    }
  }
}

console.log(JSON.stringify(report, null, 2));
