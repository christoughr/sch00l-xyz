import type { StudyTrack } from "./study-tracks";

/** Kindergarten through middle school (K–8). High school stays in study-tracks.ts. */
const K12 = (t: Omit<StudyTrack, "category">): StudyTrack => ({
  ...t,
  category: "k12",
});

export const K12_EARLY_STUDY_TRACKS: StudyTrack[] = [
  K12({
    id: "k12-k-math",
    label: "Kindergarten Math",
    description: "Counting, shapes, compare numbers",
    subject: "math",
    topic: "Kindergarten math — counting and shapes",
    gradeLevel: "Kindergarten",
    tutorContext:
      "K math: counting to 20+, comparing quantities, basic shapes, patterns. Concrete examples, short sentences, encourage drawing and manipulatives.",
  }),
  K12({
    id: "k12-k-reading",
    label: "Kindergarten Reading",
    description: "Phonics, sight words, read-aloud",
    subject: "english",
    topic: "Kindergarten reading — letters and sounds",
    gradeLevel: "Kindergarten",
    tutorContext:
      "K reading: letter sounds, blending CVC words, sight words, listening comprehension. Never overwhelm — one skill at a time.",
  }),
  K12({
    id: "k12-elem-math",
    label: "Elementary Math (Grades 1–5)",
    description: "Operations, fractions intro, measurement",
    subject: "math",
    topic: "Elementary math — operations and fractions",
    gradeLevel: "Grades 1–5",
    tutorContext:
      "Elementary math: place value, +/-/-/, fractions as parts of a whole, word problems with bar models. Age-appropriate vocabulary.",
  }),
  K12({
    id: "k12-elem-reading",
    label: "Elementary ELA (Grades 1–5)",
    description: "Phonics, fluency, comprehension",
    subject: "english",
    topic: "Elementary reading — fluency and comprehension",
    gradeLevel: "Grades 1–5",
    tutorContext:
      "Elementary ELA: phonics patterns, main idea, vocabulary in context, short writing. Celebrate effort; scaffold before correcting.",
  }),
  K12({
    id: "k12-elem-science",
    label: "Elementary Science (Grades 1–5)",
    description: "Life, earth, and physical science basics",
    subject: "science",
    topic: "Elementary science — plants, weather, forces",
    gradeLevel: "Grades 1–5",
    tutorContext:
      "Elementary science: NGSS-style phenomena, observe-question-explain. Simple experiments and cause/effect language.",
  }),
  K12({
    id: "k12-elem-social-studies",
    label: "Elementary Social Studies",
    description: "Community, geography, civics basics",
    subject: "social_studies",
    topic: "Elementary social studies — community and maps",
    gradeLevel: "Grades 1–5",
    tutorContext:
      "Elementary SS: maps, community helpers, timelines, compare past/present. Connect to student experience.",
  }),
  K12({
    id: "k12-ms-math",
    label: "Middle School Math (Grades 6–8)",
    description: "Ratios, expressions, intro algebra",
    subject: "math",
    topic: "Middle school math — ratios and equations",
    gradeLevel: "Grades 6–8",
    tutorContext:
      "MS math: ratios/proportions, integer operations, linear relationships, intro geometry. Bridge arithmetic to algebra.",
  }),
  K12({
    id: "k12-ms-science",
    label: "Middle School Science",
    description: "Cells, ecosystems, matter, motion",
    subject: "science",
    topic: "Middle school science — cells and ecosystems",
    gradeLevel: "Grades 6–8",
    tutorContext:
      "MS science: cells, energy, chemical reactions intro, Newton's laws. Claim-evidence-reasoning in short answers.",
  }),
  K12({
    id: "k12-ms-ela",
    label: "Middle School ELA",
    description: "Literature analysis, argument writing",
    subject: "english",
    topic: "Middle school ELA — analysis and writing",
    gradeLevel: "Grades 6–8",
    tutorContext:
      "MS ELA: theme, text evidence, paragraph structure, argument claims. Model thesis → evidence → explanation.",
  }),
  K12({
    id: "k12-ms-social-studies",
    label: "Middle School Social Studies",
    description: "World history, civics, geography",
    subject: "social_studies",
    topic: "Middle school social studies — history and civics",
    gradeLevel: "Grades 6–8",
    tutorContext:
      "MS SS: historical thinking, primary sources, government basics, geographic reasoning.",
  }),
];

/** US high school diploma pathway (grades 9–12 core). */
export const US_HS_DIPLOMA_TRACKS: StudyTrack[] = [
  K12({
    id: "us-hs-english",
    label: "US High School English",
    description: "Literature, rhetoric, research writing",
    subject: "english",
    topic: "US HS English — analysis and argument",
    gradeLevel: "Grades 9–12",
    tutorContext:
      "US HS ELA: close reading, thesis-driven essays, MLA citations, rhetorical analysis. Scaffold PEEL/CEER before full papers.",
  }),
  K12({
    id: "us-hs-algebra",
    label: "US High School Algebra",
    description: "Linear, quadratic, exponential functions",
    subject: "math",
    topic: "US HS Algebra — equations and functions",
    gradeLevel: "Grades 9–11",
    tutorContext:
      "HS Algebra: solving equations, graphing lines/quadratics, systems, exponentials. Connect representations — table, graph, equation.",
  }),
  K12({
    id: "us-hs-biology",
    label: "US High School Biology",
    description: "Cells, genetics, evolution, ecology",
    subject: "science",
    topic: "US HS Biology — cells and genetics",
    gradeLevel: "Grades 9–12",
    tutorContext:
      "HS Biology: cell structure, DNA→protein, natural selection, ecosystems. Claim-evidence-reasoning for lab-style questions.",
  }),
  K12({
    id: "us-hs-us-history",
    label: "US History",
    description: "Founding through modern America",
    subject: "history",
    topic: "US History — documents and causation",
    gradeLevel: "Grades 9–12",
    tutorContext:
      "US History: primary sources, causation, continuity/change. DBQ-style thesis with document grouping.",
  }),
];

/** English proficiency + grad/professional exams beyond core MCAT/GRE/GMAT. */
export const EXAM_PREP_EXTRA_TRACKS: StudyTrack[] = [
  {
    id: "toefl-ibt",
    category: "exam_prep",
    label: "TOEFL iBT",
    description: "Reading, listening, speaking, writing",
    subject: "languages",
    topic: "TOEFL iBT — integrated skills",
    gradeLevel: "TOEFL",
    tutorContext:
      "TOEFL: academic English, integrated tasks, note-taking, timed speaking/writing templates. Focus on clarity over accent.",
  },
  {
    id: "ielts-academic",
    category: "exam_prep",
    label: "IELTS Academic",
    description: "Listening, reading, writing, speaking",
    subject: "languages",
    topic: "IELTS Academic — band score skills",
    gradeLevel: "IELTS",
    tutorContext:
      "IELTS Academic: Task 1 data description, Task 2 essay types, speaking Parts 1–3. Band descriptors and timing.",
  },
  {
    id: "ielts-general",
    category: "exam_prep",
    label: "IELTS General Training",
    description: "Everyday English for migration/work",
    subject: "languages",
    topic: "IELTS General — letters and practical English",
    gradeLevel: "IELTS General",
    tutorContext:
      "IELTS GT: letter writing, practical reading, everyday listening. Less academic than Academic module.",
  },
  {
    id: "gre-analytical-writing",
    category: "exam_prep",
    label: "GRE Analytical Writing",
    description: "Issue and argument essays",
    subject: "english",
    topic: "GRE AW — issue and argument essays",
    gradeLevel: "GRE",
    tutorContext:
      "GRE AW: analyze issue vs analyze argument. Thesis, counterexample, logical flaws. Timed outlines before full essays.",
  },
  {
    id: "med-mmi",
    category: "exam_prep",
    label: "Medical School MMI",
    description: "Multiple mini interview stations",
    subject: "health",
    topic: "MMI — ethics, communication, scenarios",
    gradeLevel: "Medical school admissions",
    tutorContext:
      "MMI prep: ethical dilemmas, role-play communication, healthcare policy basics. Structured responses — acknowledge stakeholders, propose balanced action, reflect on limitations. No single right answer; show reasoning.",
  },
  {
    id: "dat",
    category: "exam_prep",
    label: "DAT",
    description: "Dental admission test",
    subject: "science",
    topic: "DAT — perceptual ability and sciences",
    gradeLevel: "DAT",
    tutorContext:
      "DAT: biology, gen chem, org chem, perceptual ability, reading. High-yield review and PAT spatial strategies.",
  },
  {
    id: "oat",
    category: "exam_prep",
    label: "OAT",
    description: "Optometry admission test",
    subject: "science",
    topic: "OAT — sciences and quantitative reasoning",
    gradeLevel: "OAT",
    tutorContext:
      "OAT: biology, gen chem, org chem, physics, QR, reading. Pace and passage strategy like MCAT lite.",
  },
  {
    id: "pcat",
    category: "exam_prep",
    label: "PCAT",
    description: "Pharmacy college admission test",
    subject: "science",
    topic: "PCAT — biology, chemistry, math",
    gradeLevel: "PCAT",
    tutorContext:
      "PCAT: biology, gen chem, biochem intro, critical reading, math. Flashcard-heavy facts plus passage reasoning.",
  },
  {
    id: "usmle-step1",
    category: "exam_prep",
    label: "USMLE Step 1",
    description: "Foundational medical sciences",
    subject: "health",
    topic: "Step 1 — pathology and pharmacology",
    gradeLevel: "Medical school",
    tutorContext:
      "USMLE Step 1: mechanisms, pathology links, pharm side effects. First-order diagnosis plus why distractors fail.",
  },
  {
    id: "cpa-far",
    category: "professional",
    label: "CPA FAR",
    description: "Financial accounting & reporting",
    subject: "business",
    topic: "CPA FAR — GAAP and financial statements",
    gradeLevel: "CPA",
    tutorContext:
      "CPA FAR: revenue recognition, leases, consolidations. Journal entries and standard references.",
  },
  {
    id: "cfa-level1",
    category: "professional",
    label: "CFA Level I",
    description: "Ethics, quant, economics, finance",
    subject: "business",
    topic: "CFA L1 — ethics and financial reporting",
    gradeLevel: "CFA",
    tutorContext:
      "CFA L1: ethics framework, time value of money, FSA ratios, macro. Formula recall with conceptual why.",
  },
  {
    id: "pmp",
    category: "professional",
    label: "PMP",
    description: "Project management professional",
    subject: "business",
    topic: "PMP — agile and predictive PM",
    gradeLevel: "PMP",
    tutorContext:
      "PMP: PMBOK processes, agile hybrids, situational judgment. Eliminate two wrong answers using PMI mindset.",
  },
  {
    id: "aws-cloud-practitioner",
    category: "professional",
    label: "AWS Cloud Practitioner",
    description: "Cloud concepts and AWS services",
    subject: "cs",
    topic: "AWS CLF — cloud fundamentals",
    gradeLevel: "Certification",
    tutorContext:
      "AWS CLF: shared responsibility, core services (EC2, S3, IAM), pricing models. Scenario-based elimination.",
  },
];
