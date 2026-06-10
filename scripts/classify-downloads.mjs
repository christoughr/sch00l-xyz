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
  if (/^\bssat\b/i.test(t)) return [];

  // Skip Chinese / Spanish localized editions (user provides English only)
  if (
    /\(chinese\)|chinese version|chinese ed|xin dong fang|新东方|official guide.*chinese|verbal revised chinese|quantitative review chinese|español|spanish edition|\bspanish\b.*gmat|\bspanish\b.*gre/i.test(
      t
    )
  )
    return [];

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

  // US high school textbooks — before generic biology → ap-bio
  if (/patterns of interaction|world history.*mcdougal|modern world history.*beck|ancient world history.*beck/i.test(t))
    return ["us-hs-world-history"];
  if (
    /prentice hall literature|language and literacy.*grade|american experience.*literature|british tradition|penguin literature library/i.test(
      t
    )
  )
    return ["us-hs-english"];
  if (/giancoli.*physics|conceptual physics.*hewitt|physics.*principles with applications/i.test(t))
    return ["us-hs-physics"];
  if (
    /pearson chemistry|prentice hall chemistry|wilbraham.*chemistry|florida prentice hall chemistry/i.test(t) &&
    !/queensland|addison-wesley chemistry.*1987/i.test(t)
  )
    return ["us-hs-chemistry"];
  if (
    /miller.*levine.*biology|prentice hall biology|biology.*miller.*levine|ken miller.*joe levine|isbn.*9780133669510|isbn.*9780131259461.*biology/i.test(t)
  )
    return ["us-hs-biology"];
  if (/magruder.*american government|magruder's american government/i.test(t))
    return ["us-hs-civics"];
  if (/united states history.*pearson|the americans.*danzer|the americans.*history/i.test(t))
    return ["us-hs-us-history"];

  if (/biology|ap.?bio/i.test(t) && !/prentice hall biology|miller.*levine|high school biology/i.test(t))
    return ["ap-bio"];

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

  if (
    /general.?organic.?biological|gen.?organic.?bio|essentials of gen.?organic|gorzynski smith|gobc|organic and biological chemistry/i.test(
      t
    )
  )
    return ["college-gen-chem-1"];

  if (/intro to college math|basic arithmetic, geometry, algebra/i.test(t))
    return ["college-calc-1"];

  if (/mcat.*biology|mcat.*biochemistry|berkeley review.*biology|kaplan.*mcat.*biology|mcat.*528/i.test(t))
    return ["mcat-bb"];
  if (/mcat.*chemistry|mcat.*physics|berkeley review.*physics|kaplan.*mcat.*physics|kaplan.*mcat.*math/i.test(t))
    return ["mcat-cp"];
  if (/mcat.*psych|mcat.*sociology|mcat.*behavioral|kaplan.*mcat.*behavioral|examkrackers.*psych/i.test(t))
    return ["mcat-ps"];
  if (/mcat.*cars|critical analysis.*mcat|kaplan.*mcat.*critical|berkeley review.*verbal/i.test(t))
    return ["mcat-cars"];
  if (/berkeley review.*mcat|kaplan.*mcat|examkrackers.*mcat|princeton review.*mcat|mcat prep|mcat complete/i.test(t))
    return ["mcat-bb", "mcat-cp", "mcat-ps", "mcat-cars"];

  if (/multiple mini interview|\bmmi\b|medical school interview|winning strategies from.*mmi|interviews for medical school|isc medical|medical school interview preparation/i.test(t))
    return ["med-mmi"];

  if (/\bgmat\b|graduate management admission|gmac official guide|manhattan prep gmat/i.test(t))
    return ["gmat"];

  if (/\bgre\b|graduate record|manhattan prep gre|5 lb.*gre|gre prep plus|gre quant|gre verbal|gre analytical writing/i.test(t)) {
    if (/analytical writing|essay topics|issue essay|argument essay/i.test(t))
      return ["gre-analytical-writing"];
    if (/verbal|reading comp|text completion|sentence equivalence/i.test(t))
      return ["gre-verbal"];
    if (/quant|math|500 gre math|5 lb.*gre/i.test(t)) return ["gre-quant"];
    return ["gre-quant", "gre-verbal"];
  }

  if (/\btoefl\b|toefl ibt/i.test(t)) return ["toefl-ibt"];

  if (/\bielts\b/i.test(t)) {
    if (/general training|ielts general/i.test(t)) return ["ielts-general"];
    return ["ielts-academic"];
  }

  if (/\bdat\b|dental admission test/i.test(t)) return ["dat"];
  if (/\boat\b|optometry admission/i.test(t)) return ["oat"];
  if (/\bpcat\b|pharmacy college admission/i.test(t)) return ["pcat"];
  if (/\blsat\b|law school admission test|kaplan lsat/i.test(t)) return ["lsat"];
  if (/usmle step 1|first aid.*step 1|pathoma/i.test(t)) return ["usmle-step1"];
  if (/usmle step 2|first aid.*step 2/i.test(t)) return ["usmle-step2-ck"];
  if (/usmle step 3|first aid.*step 3/i.test(t)) return ["usmle-step3"];
  if (/\bcpa\b.*far|financial accounting.*cpa/i.test(t)) return ["cpa-far"];
  if (/\bcfa\b.*level\s*i|cfa level 1/i.test(t)) return ["cfa-level1"];
  if (/\bpmp\b|project management professional/i.test(t)) return ["pmp"];
  if (/aws cloud practitioner|\bclf-c02\b/i.test(t)) return ["aws-cloud-practitioner"];

  if (
    /sight word|jolly phonics|hooked on phonics|phonics workbook|phonics reader|dolch sight|letters.?&.?sight|fast start.*early reader|spectrum.*reading|kindergarten.*reading|reading comprehension.*kindergarten|get ready for kindergarten.*letter|early learner.*reading|read-it! reader|scholastic reader level 1|dk reader|jolly reader|spelling workbook.*kindergarten|spectrum kindergarten spelling|language arts.*kindergarten|kindergarten.*language arts|kindergarten scholar|kindergarten practice|playful reading|investigating kindergarten/i.test(
      t
    )
  )
    return ["k12-k-reading"];

  if (/kindergarten.*math|math.*kindergarten|preschool and kindergarten.*math|math no problem|kindergarten math workbook|beginning math|homeschool.*kindergarten.*math|spectrum math.*grade k|hands on math k|sadlier math kindergarten|kindergarten math with confidence|envision math.*kindergarten|math in focus.*kindergarten/i.test(t))
    return ["k12-k-math"];

  if (/kindergarten|grade k\b|pre-k|prek/i.test(t)) return ["k12-k-reading"];

  if (/go math|gomath|hmh gomath/i.test(t)) {
    if (/kindergarten|\bgrade k\b|chapter 11.*kindergarten/i.test(t)) return ["k12-k-math"];
    if (/grade [6-9]\b|accelerated 7|algebra 1|algebra 2|\bgeometry\b|assessment resource.*grade 6|worktext grade [678]/i.test(t))
      return ["k12-ms-math"];
    if (/grade [1-5]\b|grade 4-2018|student edition volume.*grade [1-5]|go math! 2016, grade [1-5]|teacher edition chapter.*grade [1-5]/i.test(t))
      return ["k12-elem-math"];
    return ["k12-elem-math"];
  }

  if (/student edition volume \d+ grade [1-5]/i.test(t) && !/reading/i.test(t))
    return ["k12-elem-math"];

  if (/saxon math|saxon math homeschool|math 54|math 65/i.test(t)) {
    if (/course [123]\b|intermediate 6|grade 8|math 87|geometry|algebra/i.test(t)) return ["k12-ms-math"];
    if (/math [123]\b|5\/4|6\/5|intermediate [345]|california saxon math [123]\b|grade 1|planning guide.*grade 1/i.test(t))
      return ["k12-elem-math"];
    return ["k12-elem-math"];
  }

  if (/let'?s estimate|estimating and rounding|spectrum math.*grade [1-5]|eureka math.*grade [1-5]/i.test(t))
    return ["k12-elem-math"];

  if (
    /harry potter|dog man|wings of fire|fighting fantasy|cursed child|renaissance thought|breakthroughs in science|summer express.*(grades? [67]|between grades)|diary of a roblox|princess leia|star wars adventures|barney says|teletubbies|scooby doo|dudley the dragon|bunny reads back/i.test(
      t
    )
  )
    return [];

  if (/spectrum/i.test(t)) {
    if (
      /reading|sight words|long vowels|letters and sounds|beginning reading|readiness|phonics and word study/i.test(
        t
      )
    ) {
      if (/kindergarten|\bgrade k\b/i.test(t)) return ["k12-k-reading"];
      if (/grade [1-5]\b/i.test(t)) return ["k12-elem-reading"];
      return ["k12-elem-reading"];
    }
    return [];
  }

  if (/into reading|hmh into reading|journeys|reading street/i.test(t)) {
    if (/grade [6-8]\b/i.test(t)) return ["k12-ms-ela"];
    if (/kindergarten|\bgrade k\b/i.test(t)) return ["k12-k-reading"];
    return ["k12-elem-reading"];
  }

  if (/rigby literacy|literacy by design|rigby literacy by design/i.test(t)) {
    if (/grade k\b|\[grade k\]|student reader grade k|collections.*\bk\b/i.test(t))
      return ["k12-k-reading"];
    if (/grade [6-8]\b|\[grade [678]\]/i.test(t)) return ["k12-ms-ela"];
    return ["k12-elem-reading"];
  }

  if (/scholastic/i.test(t)) {
    if (
      /reader level 1|leveled book|literacy place|success with (grammar|vocabulary|spelling)|morning jumpstarts.*reading|sight word tales|teaching guide.*sight|vocabulary words grade|word family tales|read xl|descriptive writing|follow the directions|implementation guide|literacy place|children's dictionary/i.test(
        t
      )
    )
      return ["k12-elem-reading"];
    if (/grade [1-5]\b/i.test(t) && /grammar|vocabulary|spelling|reading|phonics|writing/i.test(t))
      return ["k12-elem-reading"];
    return [];
  }

  if (
    /hooked on phonics.*(first grade|second grade|grade [12]|learn to read)|master skills reading|word journeys|reading workshop.*grade [1-5]/i.test(
      t
    )
  )
    return ["k12-elem-reading"];

  if (
    /oxford reading tree|songbirds phonics|floppy's phonics|phonics kids|smart phonics|phonics show|speed phonics|week-by-week phonics|phonics mentor|phonics tales|phonics reader|level one phonics|phonics activity book|phonics workbook|disney pixar phonics|reading phonics to vocabulary 1st grade|discovery workbooks.*phonics/i.test(
      t
    )
  ) {
    if (/kindergarten|pre-k|prek|senior infants|pre-k level/i.test(t)) return ["k12-k-reading"];
    return ["k12-elem-reading"];
  }

  if (/jolly phonics/i.test(t)) {
    if (/kindergarten|pupil book [12]\b|workbook [12]\b/i.test(t)) return ["k12-k-reading"];
    return ["k12-elem-reading"];
  }

  if (/foss\b|science fusion|holt science spectrum/i.test(t)) {
    if (/grade [678]\b|grades? 6-8|worktext grade [678]|interactive worktext grade [678]/i.test(t))
      return ["k12-ms-science"];
    if (/grade k\b|\[grade k\]|science stories.*\[grade k\]/i.test(t)) return [];
    return ["k12-elem-science"];
  }

  if (/spectrum science/i.test(t)) {
    if (/grade [678]\b/i.test(t)) return ["k12-ms-science"];
    if (/kindergarten|\bgrade k\b/i.test(t)) return [];
    return ["k12-elem-science"];
  }

  if (/modern chemistry|holt mcdougal modern chemistry|holt chemistry(?!.*queensland)/i.test(t))
    return ["us-hs-chemistry"];
  if (/big ideas math.*algebra 2|big ideas math algebra 2/i.test(t)) return ["us-hs-algebra-2"];
  if (/big ideas math.*geometry|bridge to success geometry/i.test(t)) return ["us-hs-geometry"];
  if (/big ideas math.*algebra 1|big ideas math algebra 1/i.test(t)) return ["us-hs-algebra"];

  // —— Ontario OSSD (Nelson / McGraw) ——
  if (/crossroads|nelson crossroads/i.test(t)) return ["ca-ossd-english-9"];
  if (/solaro.*english 9|eng1d|english 9 academic ontario/i.test(t))
    return ["ca-ossd-english-9"];
  if (/nelson science.*technology.*perspectives.*[78]\b|nelson science & technology [78]/i.test(t))
    return ["ca-ossd-science-9"];
  if (/nelson mathematics 9|0176059996|mathematics 9.*student/i.test(t)) return ["ca-ossd-math-9"];
  if (/principles of mathematics 10|principles of math 10|0070973329|0070973602/i.test(t))
    return ["ca-ossd-math-10"];
  if (/functions 11|0176332037|0176678203/i.test(t) && !/applications/i.test(t))
    return ["ca-ossd-functions"];
  if (/functions.*applications.*11|0176332044|mcf3m/i.test(t)) return ["ca-ossd-functions-apps"];
  if (/advanced functions 12|0176678326|0176678329|mhf4u/i.test(t))
    return ["ca-ossd-advanced-functions"];
  if (/calculus and vectors|0176239824|mcv4u/i.test(t)) return ["ca-ossd-calculus"];
  if (/data management|0070907584|mdm4u/i.test(t)) return ["ca-ossd-data-mgmt"];
  if (/science 10.*nelson|0176075019|solaro.*science 9/i.test(t)) return ["ca-ossd-science-10"];
  if (/nelson biology 11|0176121006|sbi3u/i.test(t)) return ["ca-ossd-biology-11"];
  if (/nelson biology.*12|0176259877|sbi4u/i.test(t)) return ["ca-ossd-biology"];
  if (/chem11|nelson chemistry 11|sch3u/i.test(t)) return ["ca-ossd-chemistry-11"];
  if (/nelson chemistry.*12|0176289709|sch4u/i.test(t)) return ["ca-ossd-chemistry"];
  if (/nelson physics 11|0176334587|sph3u/i.test(t)) return ["ca-ossd-physics-11"];
  if (/nelson physics.*12|0176239778|sph4u/i.test(t)) return ["ca-ossd-physics"];
  if (/geography of canada|cgc1d|canadian geography/i.test(t)) return ["ca-ossd-geography"];
  if (/counterpoints|creating canada|canadian history since|chc2d|chc2l/i.test(t))
    return ["ca-ossd-canadian-history"];

  if (/ossd|ontario secondary|eng4u|mhf4u|mcv4u|sch4u|sph4u|ontario grade 12/i.test(t))
    return ["international"];

  if (/high school diploma|us diploma|common core ela|algebra 1.*high school|us history.*high school/i.test(t))
    return ["k12"];

  if (/elementary|grades? [1-5]|grade [1-5]|primary school/i.test(t))
    return ["k12-elem-math", "k12-elem-reading", "k12-elem-science"];
  if (/middle school|grades? [6-8]|grade [6-8]|junior high/i.test(t))
    return ["k12-ms-math", "k12-ms-science", "k12-ms-ela"];

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
