#!/usr/bin/env node
/**
 * Classify Downloads files into course tracks. Identifies annas-arch* by content.
 * Usage: node scripts/classify-downloads.mjs [--rename]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
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
  return path.basename(filePath);
}

/** Hand-identified annas-arch files (content sniffed). */
export const ANNAS_ARCH_MANUAL = {
  "annas-arch-92b963a61b8b.pdf": ["sat-math"],
  "annas-arch-d491267c4dae.pdf": ["ap-physics-2"],
  "annas-arch-d9ab746b1238.epub": ["ap-physics-2"],
  "annas-arch-f9722fcbd9fe.pdf": ["act-math"],
  "annas-arch-69a2025c9d90.pdf": ["sat-math"],
  "annas-arch-69a2025c9d90.ocr-text.pdf": ["sat-math"],
  "annas-arch-69a2025c9d90.ocr.epub": ["sat-math"],
};

function classifyOcrOrConverted(n, preview = "") {
  const t = `${n} ${preview}`.toLowerCase();
  if (/정부24|사업자등록|business registration|문서출력/i.test(t)) return [];
  if (/intro stats|introductory statistics|de veaux|velleman|bock.*stat/i.test(t))
    return ["college-stats-intro"];
  if (/discrete mathematics|discrete math/i.test(t)) return ["college-discrete-math"];
  if (/ap stats|ap statistics|q&a statistics|fast track.*ap.*stat/i.test(t))
    return ["ap-stats"];
  if (/chemistry|ap chem/i.test(t)) return ["ap-chem"];
  if (/biology|subject test.*biology/i.test(t)) return ["ap-bio"];
  if (
    /critical reader|sat reading|ies.*reading|testmuse.*reading|vibrant.*reading|prepv?antage|literature and history|reading & writing toolkit/i.test(
      t
    )
  )
    return ["sat-reading"];
  if (/college panda.*act|act math.*workbook/i.test(t) && !/sat/i.test(t)) return ["act-math"];
  if (/college panda.*sat|digital sat math|preppros|sat math|vibrant.*math practice/i.test(t))
    return ["sat-math"];
  if (/princeton review ap statistics|ap statistics prep/i.test(t)) return ["ap-stats"];
  if (/act english|kaplan act premier|english and reading workout|500 act english/i.test(t))
    return ["act-english"];
  return null;
}

function normalizeTitle(s) {
  return s
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&(?:reg|trade|copy);/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** @returns {string[]} track ids */
export function classifyByNameAndText(filename, preview = "") {
  if (ANNAS_ARCH_MANUAL[filename]) return ANNAS_ARCH_MANUAL[filename];
  const n = normalizeTitle(filename.toLowerCase());
  const t = normalizeTitle(`${filename} ${preview}`.toLowerCase());

  if (/^index(?:eng|kr)?\.pdf$/i.test(n)) return [];
  if (/정부24|사업자등록|business registration|문서출력/i.test(n)) return [];
  if (/^gmat\b|\bssat\b/i.test(t)) return [];

  if (/gazabarron|barron.*ap complete.*collection/i.test(t))
    return ["ap-bio", "ap-chem", "ap-stats", "ap-physics-1", "ap-physics-2", "sat-math", "sat-reading"];

  if (/openstax sciences for college|all \d+ openstax titles/i.test(t))
    return ["college-gen-chem-1", "college-physics-1", "college-stats-intro"];

  if (/\.(ocr\.epub|ocr-text\.pdf|converted\.epub)$/i.test(n)) {
    const ocr = classifyOcrOrConverted(n, preview);
    if (ocr !== null) return ocr;
  }

  if (/college physics for ap|physics for ap.*course/i.test(t) && !/lab manual/i.test(t))
    return ["ap-physics-1", "college-physics-1"];

  if (/college physics|university physics|physics for scientists|openstax.*physics|serway.*physics|giambattista.*physics|young.*college physics/i.test(t) && !/lab manual/i.test(t))
    return ["college-physics-1"];

  if (/college physics.*lab manual|lab manual.*college physics|college physics.*ap.*lab/i.test(t))
    return ["college-physics-1", "ap-physics-1"];

  if (
    /chemistry\s*2e|openstax.*chemistry\s*2e|chem(?:istry)?\s*2e\b/i.test(t) &&
    !/organic|atoms first|biochem|mcat/i.test(t)
  )
    return ["college-gen-chem-2"];

  if (/atoms first|chemistry.*atoms first/i.test(t) && !/organic|biochem|mcat/i.test(t))
    return ["college-gen-chem-1"];

  if (
    /gen(?:eral)?\s*chem(?:istry)?\s*(ii|2|two|second)|chem(?:istry)?\s*(2046|ii\b)|acp gen chem ii|gen chem ii/i.test(
      t
    ) &&
    !/organic chemistry|biochem|mcat/i.test(t)
  )
    return ["college-gen-chem-2"];

  if (
    /general chemistry|gen(?:eral)?\s*chem(?:istry)?\s*i\b|zumdahl|brown.*chemistry|chemistry.*central science|openstax.*chem/i.test(
      t
    ) &&
    !/organic|biochem|gen chem ii|chem\s*ii/i.test(t)
  )
    return ["college-gen-chem-1"];

  if (/college-calc-3|calculus iii|calculus 3[^0-9]|calc iii|multivariable calculus/i.test(t) && !/ap calc|subject test/i.test(t))
    return ["college-calc-3"];

  if (/linear algebra|matrix theory|introductory algebra.*matrix|gilbert strang|introduction to linear algebra|linear algebra done right|hefferon.*linear|engineering mathematics.*vol.*algebra/i.test(t) && !/subject test/i.test(t))
    return ["college-linear-algebra"];

  if (
    /differential equation|diff eq|differential equations|boyce.*elementary|zill.*differential|blanchard.*differential|nagle.*differential|fundamentals of differential|math 225|ode textbook/i.test(
      t
    ) &&
    !/partial differential.*engineer/i.test(t)
  )
    return ["college-differential-equations"];

  if (
    /organic chemistry|org chem|orgo\b|wade.*organic|bruice|organic.*klein|klein.*organic|klein.*ssm|ssm.*klein|microsoft word - klein|mcmurry|carey.*organic|solomons.*organic|smith.*organic chemistry/i.test(
      t
    ) &&
    !/biological chemistry|biochem|general.?organic.?bio|gob chem|introductory general and organic/i.test(
      t
    )
  )
    return ["college-org-chem"];

  if (/organic chemistry laborator|org chem lab|pavia.*laboratory|chem 36 and 130/i.test(t))
    return ["college-org-chem"];

  if (/college physics.*e&m|physics ii[^i]|physics 2[^0-9]|electricity and magnetism|university physics.*vol.*2/i.test(t))
    return ["college-physics-2"];

  if (/college-calc-2|calculus ii[^i]|calculus 2[^0-9]|calc ii[^i]/i.test(t) && !/ap calc|subject test/i.test(t))
    return ["college-calc-2"];

  if (/calculus all-in-one|calculus for dummies/i.test(t) && !/ap calc|subject test/i.test(t))
    return ["college-calc-1", "college-calc-2", "college-calc-3"];

  if (/college-calc|calculus i[^i]|calc i[^i]|calculus 1[^0-9]/i.test(t) && !/ap calc|subject test/i.test(t))
    return ["college-calc-1"];

  if (/all sat subject tests|official study guide for all sat subject/i.test(t))
    return ["sat-math", "sat-reading", "ap-bio", "ap-chem", "ap-physics-1"];

  if (/sat subject test.*biology|official sat subject test.*biology/i.test(t)) return ["ap-bio"];
  if (/sat subject test.*world history/i.test(t)) return ["sat-reading"];
  if (/sat subject test.*math|subject test.*math level|official sat subject test/i.test(t))
    return ["sat-math"];

  if (/official digital sat study guide|official sat study guide|sat prep plus|kaplan sat prep plus/i.test(t))
    return ["sat-math", "sat-reading"];

  if (/sat math in the classroom/i.test(t)) return ["sat-math"];
  if (/act math in the classroom/i.test(t)) return ["act-math"];

  if (
    /discrete mathematics|discrete math|cse 280.*discrete|gallier.*discrete|bender.*discrete|williamson.*discrete|short course in discrete|lecture notes.*discrete mathematics|zybooks.*discrete/i.test(
      t
    ) &&
    !/ap /i.test(t)
  )
    return ["college-discrete-math"];

  if (
    /intro stats|introductory statistics|de veaux|velleman|bock.*stat|stat 200|stats 200|9780136806752|9780321825278|9780134210223|9780321286710/i.test(
      t
    ) &&
    !/ap statistics|ap stats|fast track.*ap/i.test(t)
  )
    return ["college-stats-intro"];

  if (
    /ap\s*statistics|ap\s*stats|practice of statistics|q&a statistics|barron.*statistics|5 steps.*statistics|statistics crash course|fast track.*ap.*stat/i.test(
      t
    )
  )
    return ["ap-stats"];

  if (/college physics.*ap|ap courses.*lab manual|lab manual.*ap/i.test(t)) return ["ap-physics-1", "college-physics-1"];

  if (/top 50 skills.*top score.*sat|top 50 skills for a top score/i.test(t))
    return ["sat-math", "sat-reading"];

  if (/\.converted\.epub$/i.test(n)) {
    if (/statistics|stats|q&a/i.test(n)) return ["ap-stats"];
    if (/biology|ap bio/i.test(n)) return ["ap-bio"];
    if (/act english/i.test(n)) return ["act-english"];
    if (/sat math|math workout|gmat|kaplan.*math/i.test(n)) return ["sat-math"];
  }

  if (/physics\s*c|ap\s*physics\s*c|physics c companion/i.test(t))
    return ["ap-physics-c", "college-physics-2"];
  if (/physics\s*2|ap\s*physics\s*2|sterling.*physics\s*2/i.test(t))
    return ["ap-physics-2", "college-physics-2"];
  if (/physics\s*1|ap\s*physics\s*1|cracking the ap physics 1/i.test(t))
    return ["ap-physics-1", "college-physics-1"];

  if (/^5 steps to a 5 -- greg jacobs/i.test(n)) return ["ap-physics-1"];

  if (/500\s+sat\s+math/i.test(t)) return ["sat-math"];

  if (/princeton review act science|act science prep|for the love of act science|ultimate guide to act science/i.test(t))
    return ["act-science"];

  if (/\bact\s*science\b|500\s+act\s+science/i.test(t)) return ["act-science"];

  if (/top 50 act english.*science/i.test(t)) return ["act-english", "act-science"];

  if (/act prep book.*(20\d\d|practice tests)|mometrix.*act prep|complete act prep/i.test(t))
    return ["act-math", "act-english", "act-science"];

  if (/isbn_9780578160610|isbn_9780692914274|9780578160610|9780692914274/i.test(t))
    return ["act-english"];

  if (
    /\bact\b/.test(t) &&
    /english|reading|writing|vocabulary power plus|conquering act english|500 act english|english and reading workout|act coach|top 50 act english|preparing for the act english|mastering the act|mcgraw.*act english|princeton review act english|kaplan act english|kaplan act premier|act prep book 2017|act & college preparation course|amsco.*act english|isbn_9780578160610|isbn_9780692914274/i.test(
      t
    ) &&
    !/math and science|conquering act math/i.test(t)
  )
    return ["act-english"];

  if (/conquering.*act.*math.*science|act math.*science prep/i.test(t))
    return ["act-math", "act-science"];

  if (
    /\bact\b/.test(t) &&
    (/act math|top 50 act math|college panda.*act.*math|conquering act math|for the love of act math|ultimate guide to the math act|nova.*act math|bob miller.*act/i.test(t) ||
      (/math/.test(t) && !/english|reading|writing/i.test(t)))
  )
    return ["act-math"];

  if (
    /sat reading|critical reader|reading and writing|reading & writing|sat verbal|ies sat reading|world literature.*sat|sat a\+\s*prep.*reading|digital sat reading|preppros digital sat reading|testmuse digital sat reading|golden book of reading|meltzer/i.test(t) ||
    /top 50 sat reading/i.test(t)
  )
    return ["sat-reading"];

  if (/smartyprep.*sat.*act|sat_act.*math|sat\/act.*math/i.test(t)) return ["sat-math", "act-math"];

  if (
    /sat math|top 50 sat math|college panda.*sat.*math|orange book|28 new sat math|new sat.*math practice|perfect 800|digital sat math|mcgraw.*sat math|barron.*sat math|sat math mastery|conquering sat math|preppros.*sat math|for dummies.*sat math|cosmic prep digital sat.*math|math made easy|sat and gmat math/i.test(t) ||
    (/digital sat/i.test(t) && !/reading|writing/i.test(t))
  )
    return ["sat-math"];

  if (/reading and writing prep for the sat & act|reading and writing workout/i.test(t))
    return ["sat-reading"];

  if (/math and science prep for the sat & act|math and science workout/i.test(t))
    return ["act-math", "sat-math"];

  if (/math workout for the sat/i.test(t)) return ["sat-math"];

  if (/digital sat|sat prep book|sat prep 20|sat secrets|princeton review digital sat|mometrix.*sat|vibrant publishers.*digital sat/i.test(t)) {
    if (/reading|writing|english/i.test(t)) return ["sat-reading"];
    if (/math|secrets/i.test(t)) return ["sat-math"];
    return ["sat-math", "sat-reading"];
  }

  if (/biology|ap.?bio/i.test(t)) return ["ap-bio"];

  if (/mcat.*general chemistry|berkeley review.*general chemistry/i.test(t)) {
    if (/part\s*2|volume\s*2|\bii\b/i.test(t))
      return ["exam_prep", "college-gen-chem-2"];
    return ["exam_prep", "college-gen-chem-1"];
  }

  if (
    /general chemistry|gen(?:eral)?\s*chem(?:istry)?\s*i\b|chem\s*101|chem\s*2045|survival guide to general chemistry|essentials of chemistry|principles of general|introductory general.*chemistry|acp general chemistry i|timberlake.*chemistry|chang.*chemistry|9781337|9781259|9781269|9781118459850/i.test(
      t
    ) &&
    !/organic chemistry|biological chemistry|gen.?organic.?bio|gob chem|mcat|berkeley review|gen chem ii|chem\s*ii/i.test(
      t
    )
  )
    return ["college-gen-chem-1"];

  if (/general.?organic.?biological|gen.?organic.?bio|essentials of gen.?organic/i.test(t))
    return ["college-gen-chem-1"];

  if (/chemistry|ap.?chem/i.test(t)) return ["ap-chem", "college-gen-chem-1"];
  if (/ap.?calc|5 steps.*calculus ab|cracking the ap calculus/i.test(t)) return ["ap-calc-ab"];

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

const isMain =
  process.argv[1] &&
  path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1]);

if (isMain) {
  const files = fs.readdirSync(DOWNLOADS).filter((f) => /\.(pdf|epub|fb2|azw3|zip|djvu|txt)$/i.test(f));
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
}
