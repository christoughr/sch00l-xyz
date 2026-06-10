#!/usr/bin/env node
/**
 * Find LSAT files in Downloads not yet in content/ingest/lsat/.ingested-hashes.json
 */
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dl = process.env.DOWNLOADS_DIR || "C:\\Users\\Administrator\\Downloads";

const LSAT =
  /lsat|preptest|law school admission|tripleprep|triple-prep|examkrackers|loophole|fox.*logical reasoning|lsat trainer|curvebreakers|get prepped|powerscore.*lsat|blueprint.*lsat|manhattan.*lsat|nova.*lsat|master the lsat|cambridge lsat|traciela|elemental prep|artisanal|kaplan lsat|rea.*lsat|barron.*lsat|cliffs.*lsat|arco.*lsat|gruber.*lsat|peterson.*lsat|testbuster.*lsat|lsatmax|apex test prep.*lsat|mometrix.*lsat|introducing the lsat|30-day lsat|lsat necessary|bring home the score|critical reader.*lsat|digital lsat|lsat decoded|lsat explained|lsat unlocked|lsat deconstructed|lsat problem-type|lsat logical reasoning by type|lsat direct|lsat mastery|lsat endurance|lsat stratosphere|lsat extreme|lsat success|lsat bookf|lsat prep plus|lsat-premier|lsat-fox|lsat-33-common|gre.*lsat.*mcat|gmat.*lsat|logic.*lsat/i;

const SKIP =
  /cracking the sat|master the sat|master ap|sat literature|getting ready for the sat|2400 fiske|501 critical reading|501 algebra|ap english|vocabulary puzzles|essential words.*gre|gruber.*complete sat|gruber.*psat|barron.*sat[^a-z]|ace the sat|law school bound|webster|secret sharer|odyssey|modest proposal|defining new moon|breaking dawn|higher education|by design|powerscore sentence correction|manhattan gre|ets graduate|8 kinds of writing|act english|barron's act|mcgraw-hill's sat[^a-z]|writing workbook for the new sat|sat secrets|sat 2400|sat & psat|sat subject|college board.*sat|gre cat|cracking the gre|get into graduate|gruber's complete gre|stewart master the gre|kaplan new gre|gre gmat lsat mcat reading|logic and reading review for the gre(?!.*lsat)|gre-lsat logic workbook|gre.*analytic workout(?!.*lsat)/i;

const SUPPORTED = new Set([".pdf", ".epub", ".txt", ".zip"]);

function contentHash(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(buf).digest("hex").slice(0, 12);
}

const hashPath = path.join(root, "content", "ingest", "lsat", ".ingested-hashes.json");
const ingested = new Set(
  fs.existsSync(hashPath) ? JSON.parse(fs.readFileSync(hashPath, "utf8")) : []
);

const files = fs.readdirSync(dl).map((n) => path.join(dl, n));
const newFiles = [];
const skipped = { ingested: 0, pattern: 0, unsupported: 0 };

for (const f of files) {
  let stat;
  try {
    stat = fs.statSync(f);
  } catch {
    continue;
  }
  if (!stat.isFile()) continue;
  const base = path.basename(f);
  if (SKIP.test(base)) {
    skipped.pattern++;
    continue;
  }
  if (!LSAT.test(base)) {
    skipped.pattern++;
    continue;
  }
  const ext = path.extname(f).toLowerCase();
  if (!SUPPORTED.has(ext)) {
    skipped.unsupported++;
    continue;
  }
  const h = contentHash(f);
  if (ingested.has(h)) {
    skipped.ingested++;
    continue;
  }
  newFiles.push(f);
}

const outDir = path.join(root, "content", "ingest", "_attached");
fs.mkdirSync(outDir, { recursive: true });
const manifest = path.join(outDir, "lsat-batch3-new-only.manifest.txt");
fs.writeFileSync(manifest, newFiles.join("\n") + (newFiles.length ? "\n" : ""));

console.log(JSON.stringify({
  manifest,
  newCount: newFiles.length,
  skipped,
  ingestedTotal: ingested.size,
}, null, 2));
