#!/usr/bin/env node
/**
 * Ingest only explicit file paths (chat attachments) — never scans Downloads.
 *
 * Usage:
 *   node scripts/ingest-attached.mjs --track lsat --apply path1.pdf path2.epub
 *   node scripts/ingest-attached.mjs --apply path1.pdf   # auto-classify from content
 *   node scripts/ingest-attached.mjs --list manifest.txt --apply
 *
 * Files are stored as {track}-{contentHash8}.pdf (no ugly publisher filenames).
 */
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";
import { classifyFromContent } from "./classify-downloads.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const forceTrack = args.includes("--track") ? args[args.indexOf("--track") + 1] : null;
const listFile = args.includes("--list") ? args[args.indexOf("--list") + 1] : null;

function collectPaths() {
  if (listFile) {
    return fs
      .readFileSync(listFile, "utf8")
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
  }
  const skip = new Set(["--apply", "--track", "--list"]);
  const paths = [];
  for (let i = 0; i < args.length; i++) {
    if (skip.has(args[i])) {
      if (args[i] === "--track" || args[i] === "--list") i++;
      continue;
    }
    paths.push(args[i]);
  }
  return paths;
}

function contentHash(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(buf).digest("hex").slice(0, 12);
}

function loadHashes(trackDir) {
  const p = path.join(trackDir, ".ingested-hashes.json");
  if (!fs.existsSync(p)) return new Set();
  return new Set(JSON.parse(fs.readFileSync(p, "utf8")));
}

function saveHashes(trackDir, hashes) {
  const p = path.join(trackDir, ".ingested-hashes.json");
  fs.writeFileSync(p, JSON.stringify([...hashes], null, 2));
}

async function main() {
  const paths = collectPaths();
  if (!paths.length) {
    console.error(
      "Usage: node scripts/ingest-attached.mjs [--track id] [--apply] file1.pdf file2.epub"
    );
    process.exit(1);
  }

  const byTrack = new Map();

  for (const raw of paths) {
    const src = path.resolve(raw);
    if (!fs.existsSync(src)) {
      console.warn("Skip (missing):", src);
      continue;
    }
    const ext = path.extname(src).toLowerCase();
    if (![".pdf", ".epub", ".txt", ".zip"].includes(ext)) {
      console.warn("Skip (unsupported type):", src);
      continue;
    }

    let tracks = forceTrack ? [forceTrack] : await classifyFromContent(src);
    if (!tracks.length) {
      console.warn("Skip (unclassified):", path.basename(src));
      continue;
    }
    const track = tracks[0];
    const hash = contentHash(src);
    const destName = `${track}-${hash}${ext}`;
    const trackDir = path.join(root, "content", "ingest", track);
    fs.mkdirSync(trackDir, { recursive: true });

    const known = loadHashes(trackDir);
    if (known.has(hash)) {
      console.log("Skip (already ingested):", destName);
      continue;
    }

    const dest = path.join(trackDir, destName);
    fs.copyFileSync(src, dest);
    known.add(hash);
    saveHashes(trackDir, known);
    console.log("Staged", destName, "→", track);

    const list = byTrack.get(track) ?? [];
    list.push(dest);
    byTrack.set(track, list);
  }

  for (const [track, files] of byTrack) {
    if (!files.length) continue;
    console.log(`\nIngesting ${files.length} new file(s) for ${track}…`);
    const seed = spawnSync(
      "node",
      ["scripts/seed-exam-track.mjs", track, track.toUpperCase(), "exam prep"],
      { cwd: root, stdio: "inherit", shell: true }
    );
    if (seed.status !== 0 && seed.status !== null) {
      console.warn("Seed step returned", seed.status);
    }
    const ingest = spawnSync(
      "node",
      ["scripts/ingest-licensed-pdf.mjs", "--track", track, ...(apply ? ["--apply"] : [])],
      { cwd: root, stdio: "inherit", shell: true }
    );
    if (ingest.status !== 0) process.exit(ingest.status ?? 1);
  }

  console.log("\nDone. Attached-only ingest complete (Downloads folder untouched).");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
