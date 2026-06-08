#!/usr/bin/env node
/** Report Downloads files classified per track — highlights tracks with sources but low lesson counts. */
import fs from "fs";
import path from "path";
import { classifyByNameAndText } from "./classify-downloads.mjs";

const DOWNLOADS = path.join(process.env.USERPROFILE || "C:\\Users\\Administrator", "Downloads");
const outJson = process.argv.includes("--json");

const byTrack = {};
let skipped = 0;

for (const name of fs.readdirSync(DOWNLOADS)) {
  if (!/\.(pdf|epub|zip|txt|djvu|ocr\.epub|converted\.txt)$/i.test(name)) continue;
  if (/^index(?:eng|kr)?\.pdf$/i.test(name) || /정부24|사업자등록|business registration/i.test(name)) {
    skipped++;
    continue;
  }
  const tracks = classifyByNameAndText(name);
  if (!tracks.length) continue;
  for (const t of tracks) {
    byTrack[t] = byTrack[t] ?? [];
    byTrack[t].push(name);
  }
}

const sorted = Object.entries(byTrack).sort((a, b) => b[1].length - a[1].length);

if (outJson) {
  console.log(JSON.stringify({ byTrack, skippedMegaIndex: skipped }, null, 2));
  process.exit(0);
}

console.log("# Downloads → track coverage\n");
console.log(`Skipped mega-index PDFs: ${skipped}\n`);
console.log("| Track | Files in Downloads |");
console.log("|-------|-------------------:|");
for (const [track, files] of sorted) {
  console.log(`| \`${track}\` | ${files.length} |`);
}

console.log("\n## Priority ingest (10+ files, college/AP)\n");
for (const [track, files] of sorted) {
  if (files.length < 5) continue;
  if (!/^(college-|ap-|act-|sat-|exam_prep|mcat-|gmat|gre-|toefl|ielts|med-|k12-|dat|oat|pcat|usmle|cpa-|cfa-|pmp|aws-)/.test(track)) continue;
  console.log(`### ${track} (${files.length})`);
  for (const f of files.slice(0, 8)) console.log(`- ${f.slice(0, 90)}${f.length > 90 ? "…" : ""}`);
  if (files.length > 8) console.log(`- … +${files.length - 8} more`);
  console.log("");
}
