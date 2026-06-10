import type { SubjectId } from "./subject-ids";
import { COLLEGE_STUDY_TRACKS } from "./study-tracks-college";
import { EXPANDED_STUDY_TRACKS } from "./study-tracks-expanded";
import { WORLDWIDE_STUDY_TRACKS } from "./study-tracks-worldwide";
import { GLOBAL_STUDY_TRACKS } from "./study-tracks-global";
import {
  EXAM_PREP_EXTRA_TRACKS,
  K12_EARLY_STUDY_TRACKS,
  US_HS_DIPLOMA_TRACKS,
} from "./study-tracks-k12-exams";
import { STATE_ASSESSMENT_TRACKS } from "./study-tracks-state";

export type StudyTrackCategory =
  | "ap"
  | "sat_act"
  | "exam_prep"
  | "college"
  | "k12"
  | "languages"
  | "international"
  | "professional"
  | "custom";

export type StudyTrackId = string;

export type StudyTrack = {
  id: StudyTrackId;
  category: StudyTrackCategory;
  label: string;
  description: string;
  subject: SubjectId;
  topic: string;
  gradeLevel: string;
  tutorContext: string;
};

export const TRACK_CATEGORIES: {
  id: StudyTrackCategory | "all";
  label: string;
}[] = [
  { id: "all", label: "All" },
  { id: "ap", label: "AP" },
  { id: "sat_act", label: "SAT / ACT" },
  { id: "exam_prep", label: "Exam prep" },
  { id: "college", label: "College & university" },
  { id: "k12", label: "K–12" },
  { id: "languages", label: "Languages" },
  { id: "international", label: "International" },
  { id: "professional", label: "Professional" },
  { id: "custom", label: "Custom" },
];

const AP = (t: Omit<StudyTrack, "category">): StudyTrack => ({
  ...t,
  category: "ap",
});

export const STUDY_TRACKS: StudyTrack[] = [
  AP({
    id: "ap-calc-ab",
    label: "AP Calculus AB",
    description: "Limits, derivatives, integrals, FTC",
    subject: "math",
    topic: "AP Calculus AB — derivatives and integrals",
    gradeLevel: "AP Calculus AB",
    tutorContext:
      "AP Calc AB: limits, continuity, derivative rules, applications, integrals, FTC. AP notation. No full FRQ solutions on first ask.",
  }),
  AP({
    id: "ap-calc-bc",
    label: "AP Calculus BC",
    description: "Series, parametric, polar, advanced integration",
    subject: "math",
    topic: "AP Calculus BC — series and advanced integration",
    gradeLevel: "AP Calculus BC",
    tutorContext:
      "AP Calc BC: series, Taylor, parametric/polar, integration techniques. Compare AB vs BC depth.",
  }),
  AP({
    id: "ap-stats",
    label: "AP Statistics",
    description: "Data, inference, probability models",
    subject: "statistics",
    topic: "AP Statistics — inference and probability",
    gradeLevel: "AP Statistics",
    tutorContext:
      "AP Stats: distributions, sampling, confidence intervals, tests, bivariate data. Interpret context.",
  }),
  AP({
    id: "ap-physics-1",
    label: "AP Physics 1",
    description: "Algebra-based mechanics, waves",
    subject: "science",
    topic: "AP Physics 1 — kinematics and forces",
    gradeLevel: "AP Physics 1",
    tutorContext:
      "AP Physics 1: algebra-based mechanics, energy, momentum, rotation intro, waves. Units and free-body diagrams.",
  }),
  AP({
    id: "ap-physics-2",
    label: "AP Physics 2",
    description: "Fluids, E&M, optics, modern physics",
    subject: "science",
    topic: "AP Physics 2 — fluids, circuits, and optics",
    gradeLevel: "AP Physics 2",
    tutorContext:
      "AP Physics 2: fluids, thermodynamics, electrostatics, circuits, magnetism, optics, quantum and nuclear. Algebra-based.",
  }),
  AP({
    id: "ap-physics-c",
    label: "AP Physics C: Mechanics",
    description: "Calculus-based mechanics",
    subject: "science",
    topic: "AP Physics C — calculus-based mechanics",
    gradeLevel: "AP Physics C",
    tutorContext:
      "AP Physics C Mechanics: calculus-based kinematics, Newton's laws, work-energy, rotation.",
  }),
  AP({
    id: "ap-chem",
    label: "AP Chemistry",
    description: "Stoichiometry, equilibrium, kinetics",
    subject: "science",
    topic: "AP Chemistry — stoichiometry and equilibrium",
    gradeLevel: "AP Chemistry",
    tutorContext:
      "AP Chem: stoichiometry, bonding, thermo, equilibrium, kinetics, acids/bases. Show setups before answers.",
  }),
  AP({
    id: "ap-bio",
    label: "AP Biology",
    description: "Cells, genetics, evolution, ecology",
    subject: "science",
    topic: "AP Biology — cell division and genetics",
    gradeLevel: "AP Biology",
    tutorContext:
      "AP Bio: claim-evidence-reasoning, College Board science practices, diagrams in words.",
  }),
  AP({
    id: "ap-env-sci",
    label: "AP Environmental Science",
    description: "Ecosystems, human impact, sustainability",
    subject: "science",
    topic: "AP Environmental Science — ecosystems and human impact",
    gradeLevel: "AP Environmental Science",
    tutorContext:
      "APES: systems thinking, human populations, pollution, energy, sustainability tradeoffs.",
  }),
  AP({
    id: "ap-psych",
    label: "AP Psychology",
    description: "Cognition, development, clinical basics",
    subject: "psychology",
    topic: "AP Psychology — memory and cognition",
    gradeLevel: "AP Psychology",
    tutorContext:
      "AP Psych: research methods, brain/behavior, learning, memory, development, clinical. Use key term precision.",
  }),
  AP({
    id: "ap-us-history",
    label: "AP US History",
    description: "Colonial era through modern America",
    subject: "history",
    topic: "AP US History — periodization and historical argument",
    gradeLevel: "AP US History",
    tutorContext:
      "APUSH: thesis, contextualization, evidence, analysis. Primary sources over memorized lists.",
  }),
  AP({
    id: "ap-world",
    label: "AP World History",
    description: "Global patterns, comparison, causation",
    subject: "history",
    topic: "AP World History — comparison and causation",
    gradeLevel: "AP World History",
    tutorContext:
      "AP World: CCOT, comparison, causation. Themes across regions and time.",
  }),
  AP({
    id: "ap-euro",
    label: "AP European History",
    description: "Renaissance to modern Europe",
    subject: "history",
    topic: "AP European History — historical argument",
    gradeLevel: "AP European History",
    tutorContext:
      "AP Euro: thesis-driven essays, causation, continuity/change in European history.",
  }),
  AP({
    id: "ap-lang",
    label: "AP English Language",
    description: "Rhetoric, argument, synthesis",
    subject: "english",
    topic: "AP Lang — rhetorical analysis and argument",
    gradeLevel: "AP English Language",
    tutorContext:
      "AP Lang: rhetoric (ethos/pathos/logos), argument, synthesis. Outline before prose.",
  }),
  AP({
    id: "ap-lit",
    label: "AP English Literature",
    description: "Poetry, prose, literary analysis",
    subject: "english",
    topic: "AP Lit — literary analysis and poetry",
    gradeLevel: "AP English Literature",
    tutorContext:
      "AP Lit: close reading, theme, structure, figurative language. Evidence from the text.",
  }),
  AP({
    id: "ap-macro",
    label: "AP Macroeconomics",
    description: "GDP, fiscal/monetary policy, trade",
    subject: "economics",
    topic: "AP Macro — GDP and policy",
    gradeLevel: "AP Macroeconomics",
    tutorContext:
      "AP Macro: AD-AS, fiscal/monetary policy, inflation, unemployment, trade. Graph intuition.",
  }),
  AP({
    id: "ap-micro",
    label: "AP Microeconomics",
    description: "Supply, demand, market structures",
    subject: "economics",
    topic: "AP Micro — supply, demand, and elasticity",
    gradeLevel: "AP Microeconomics",
    tutorContext:
      "AP Micro: supply/demand, elasticity, consumer/producer surplus, market structures.",
  }),
  AP({
    id: "ap-human-geo",
    label: "AP Human Geography",
    description: "Population, culture, urban patterns",
    subject: "geography",
    topic: "AP Human Geography — population and migration",
    gradeLevel: "AP Human Geography",
    tutorContext:
      "AP HuG: models, spatial patterns, culture, political geography, development.",
  }),
  AP({
    id: "ap-cs-a",
    label: "AP Computer Science A",
    description: "Java, OOP, algorithms",
    subject: "cs",
    topic: "AP CSA — Java methods and classes",
    gradeLevel: "AP Computer Science A",
    tutorContext:
      "AP CSA: Java syntax, OOP, arrays, ArrayList, basic algorithms. Debug reasoning, not full code dumps.",
  }),
  {
    id: "ssat-middle",
    category: "sat_act",
    label: "SSAT Middle Level",
    description: "Grades 5–7 independent school exam",
    subject: "math",
    topic: "SSAT Middle — quantitative and verbal reasoning",
    gradeLevel: "SSAT Middle",
    tutorContext:
      "SSAT Middle: analogies, quantitative comparison, reading comp. Age-appropriate pacing and vocabulary.",
  },
  {
    id: "ssat-upper",
    category: "sat_act",
    label: "SSAT Upper Level",
    description: "Grades 8–11 independent school exam",
    subject: "math",
    topic: "SSAT Upper — math, reading, writing sample",
    gradeLevel: "SSAT Upper",
    tutorContext:
      "SSAT Upper: harder QC, synonyms, timed passages, and writing sample structure.",
  },
  {
    id: "sat-math",
    category: "sat_act",
    label: "SAT Math",
    description: "Algebra, problem-solving, data",
    subject: "math",
    topic: "SAT Math — algebra and problem solving",
    gradeLevel: "SAT / high school",
    tutorContext:
      "SAT Math: linear equations, systems, quadratics, ratios, data. Strategy and efficient methods.",
  },
  {
    id: "sat-reading",
    category: "sat_act",
    label: "SAT Reading & Writing",
    description: "Evidence, grammar, rhetoric",
    subject: "english",
    topic: "SAT Reading & Writing — evidence and rhetoric",
    gradeLevel: "SAT",
    tutorContext:
      "Digital SAT RW: evidence-based answers, concision, grammar rules with reasoning.",
  },
  {
    id: "act-math",
    category: "sat_act",
    label: "ACT Math",
    description: "Pre-algebra through precalculus",
    subject: "math",
    topic: "ACT Math — pre-algebra through trig",
    gradeLevel: "ACT",
    tutorContext:
      "ACT Math: pacing, pre-algebra, geometry, trig. Calculator strategy when allowed.",
  },
  {
    id: "act-science",
    category: "sat_act",
    label: "ACT Science",
    description: "Data interpretation, experiments",
    subject: "science",
    topic: "ACT Science — data interpretation",
    gradeLevel: "ACT",
    tutorContext:
      "ACT Science: graphs, experiments, conflicting viewpoints. Reading speed + pattern recognition.",
  },
  {
    id: "act-english",
    category: "sat_act",
    label: "ACT English & Reading",
    description: "Grammar, rhetoric, and passage skills",
    subject: "english",
    topic: "ACT English — usage, rhetoric, and reading",
    gradeLevel: "ACT",
    tutorContext:
      "ACT English: usage/mechanics, rhetorical skills, passage comprehension. Underlined portions and NO CHANGE.",
  },
  {
    id: "mcat-bb",
    category: "exam_prep",
    label: "MCAT — Bio/Biochem",
    description: "Amino acids, metabolism, systems",
    subject: "science",
    topic: "MCAT Bio/Biochem — metabolism and systems",
    gradeLevel: "MCAT",
    tutorContext:
      "MCAT B/B: biochemistry pathways, physiology, experimental passages. Passage-first reasoning.",
  },
  {
    id: "mcat-cp",
    category: "exam_prep",
    label: "MCAT — Chem/Phys",
    description: "Gen chem, physics, lab reasoning",
    subject: "science",
    topic: "MCAT Chem/Phys — stoichiometry and forces",
    gradeLevel: "MCAT",
    tutorContext:
      "MCAT C/P: gen chem, physics equations, lab design. Units and dimensional analysis.",
  },
  {
    id: "mcat-ps",
    category: "exam_prep",
    label: "MCAT — Psych/Soc",
    description: "Behavior, cognition, society",
    subject: "psychology",
    topic: "MCAT Psych/Soc — behavior and society",
    gradeLevel: "MCAT",
    tutorContext:
      "MCAT P/S: theories, research design, social structures. Link terms to passage claims.",
  },
  {
    id: "mcat-cars",
    category: "exam_prep",
    label: "MCAT — CARS",
    description: "Critical analysis and reasoning",
    subject: "english",
    topic: "MCAT CARS — argument analysis",
    gradeLevel: "MCAT",
    tutorContext:
      "MCAT CARS: main idea, author's tone, inference without outside knowledge. Socratic reading.",
  },
  {
    id: "lsat",
    category: "exam_prep",
    label: "LSAT",
    description: "Logical reasoning, arguments",
    subject: "philosophy",
    topic: "LSAT — logical reasoning and arguments",
    gradeLevel: "LSAT",
    tutorContext:
      "LSAT LR: premises, conclusions, flaws, strengthen/weaken. Formalize arguments stepwise.",
  },
  {
    id: "nclex-rn",
    category: "exam_prep",
    label: "NCLEX-RN",
    description: "Clinical judgment, safety",
    subject: "health",
    topic: "NCLEX-RN — clinical judgment and prioritization",
    gradeLevel: "NCLEX",
    tutorContext:
      "NCLEX: ABCs, prioritization, pharmacology basics, patient safety. Process of elimination with rationale.",
  },
  {
    id: "gre-quant",
    category: "exam_prep",
    label: "GRE Quant",
    description: "Arithmetic, algebra, data",
    subject: "math",
    topic: "GRE Quantitative — algebra and data analysis",
    gradeLevel: "GRE",
    tutorContext:
      "GRE Quant: QC comparisons, word problems, stats. Efficient strategies; explain traps.",
  },
  {
    id: "gre-verbal",
    category: "exam_prep",
    label: "GRE Verbal",
    description: "Text completion, reading comp",
    subject: "english",
    topic: "GRE Verbal — reading and vocabulary in context",
    gradeLevel: "GRE",
    tutorContext:
      "GRE Verbal: sentence equivalence, TC, RC. Context clues over memorized definitions.",
  },
  {
    id: "gmat",
    category: "exam_prep",
    label: "GMAT Focus",
    description: "Quant, verbal, data insights",
    subject: "business",
    topic: "GMAT — data insights and problem solving",
    gradeLevel: "GMAT",
    tutorContext:
      "GMAT: DS, IR tables, critical reasoning for business cases. Time-aware reasoning.",
  },
  ...EXAM_PREP_EXTRA_TRACKS.filter((t) => t.id !== "gmat"),
  {
    id: "ib-math-aa",
    category: "exam_prep",
    label: "IB Math AA",
    description: "Analysis & approaches HL/SL",
    subject: "math",
    topic: "IB Math AA — calculus and proofs",
    gradeLevel: "IB",
    tutorContext:
      "IB Math AA: proofs, calculus, vectors. IB command terms and show-work expectations.",
  },
  {
    id: "ib-biology",
    category: "exam_prep",
    label: "IB Biology",
    description: "Cell bio, genetics, ecology",
    subject: "science",
    topic: "IB Biology — molecular biology and ecology",
    gradeLevel: "IB",
    tutorContext:
      "IB Bio: data-based questions, IA-style reasoning, syllabus connections across topics.",
  },
  ...COLLEGE_STUDY_TRACKS,
  ...K12_EARLY_STUDY_TRACKS,
  ...US_HS_DIPLOMA_TRACKS,
  {
    id: "k12-algebra-2",
    category: "k12",
    label: "Algebra II",
    description: "Functions, quadratics, exponentials",
    subject: "math",
    topic: "Algebra II — functions and quadratics",
    gradeLevel: "High school",
    tutorContext:
      "Algebra II: functions, quadratics, exponentials, logs. Connect representations.",
  },
  {
    id: "k12-geometry",
    category: "k12",
    label: "Geometry",
    description: "Proofs, similarity, coordinate geo",
    subject: "math",
    topic: "Geometry — proofs and similarity",
    gradeLevel: "High school",
    tutorContext:
      "Geometry: two-column proofs, triangles, circles, coordinate geometry.",
  },
  {
    id: "k12-biology",
    category: "k12",
    label: "High School Biology",
    description: "Cells, genetics, body systems",
    subject: "science",
    topic: "Biology — cells and genetics",
    gradeLevel: "High school",
    tutorContext:
      "HS Biology: cell structure, genetics, evolution basics, body systems.",
  },
  {
    id: "k12-chemistry",
    category: "k12",
    label: "High School Chemistry",
    description: "Atoms, bonding, reactions",
    subject: "science",
    topic: "Chemistry — atoms and chemical reactions",
    gradeLevel: "High school",
    tutorContext:
      "HS Chem: periodic trends, bonding, balancing equations, stoichiometry intro.",
  },
  {
    id: "k12-physics",
    category: "k12",
    label: "High School Physics",
    description: "Motion, forces, energy",
    subject: "science",
    topic: "Physics — motion and forces",
    gradeLevel: "High school",
    tutorContext:
      "HS Physics: kinematics, forces, energy, waves. Units and diagrams first.",
  },
  {
    id: "k12-us-history",
    category: "k12",
    label: "US History (HS)",
    description: "Themes across American history",
    subject: "history",
    topic: "US History — causes and consequences",
    gradeLevel: "High school",
    tutorContext:
      "HS US History: cause/effect, primary sources, essay outlines.",
  },
  {
    id: "lang-spanish",
    category: "languages",
    label: "Spanish",
    description: "Grammar, conversation, writing",
    subject: "languages",
    topic: "Spanish — grammar and conversation practice",
    gradeLevel: "High school / college",
    tutorContext:
      "Spanish: grammar in context, conversation prompts, error correction with retry. Mix English explanations when needed.",
  },
  {
    id: "lang-french",
    category: "languages",
    label: "French",
    description: "Grammar, reading, speaking",
    subject: "languages",
    topic: "French — grammar and reading",
    gradeLevel: "High school / college",
    tutorContext:
      "French: grammar, reading comprehension, spoken practice prompts.",
  },
  {
    id: "lang-english-learner",
    category: "languages",
    label: "English (ESL/ELL)",
    description: "Academic writing, vocabulary",
    subject: "languages",
    topic: "Academic English — writing and vocabulary",
    gradeLevel: "ELL",
    tutorContext:
      "ELL: clear academic English, vocabulary in context, essay structure, gentle correction.",
  },
  {
    id: "cs-python",
    category: "k12",
    label: "Python Programming",
    description: "Basics, loops, functions, data",
    subject: "cs",
    topic: "Python — loops, functions, and debugging",
    gradeLevel: "High school / college",
    tutorContext:
      "Python: syntax, loops, functions, lists, debugging. Pseudocode before code.",
  },
  {
    id: "cs-ap-csp",
    category: "ap",
    label: "AP CS Principles",
    description: "Big ideas, data, internet",
    subject: "cs",
    topic: "AP CSP — data and the internet",
    gradeLevel: "AP CSP",
    tutorContext:
      "AP CSP: abstractions, data, internet, impact. Conceptual over heavy coding.",
  },
  {
    id: "health-anatomy",
    category: "college",
    label: "Anatomy & Physiology",
    description: "Body systems, terminology",
    subject: "health",
    topic: "Anatomy — muscular and skeletal systems",
    gradeLevel: "College / nursing",
    tutorContext:
      "A&P: terminology, systems, clinical connections. Memory with spatial reasoning.",
  },
  {
    id: "business-accounting",
    category: "college",
    label: "Accounting I",
    description: "Debits, credits, financial statements",
    subject: "business",
    topic: "Accounting — journal entries and statements",
    gradeLevel: "College",
    tutorContext:
      "Accounting: T-accounts, journal entries, financial statements. Process before answers.",
  },
  {
    id: "engineering-statics",
    category: "college",
    label: "Engineering Statics",
    description: "Equilibrium, free-body diagrams",
    subject: "engineering",
    topic: "Statics — free-body diagrams and equilibrium",
    gradeLevel: "Engineering",
    tutorContext:
      "Statics: FBDs, moments, equilibrium equations. Diagram discipline.",
  },
  {
    id: "philosophy-logic",
    category: "college",
    label: "Logic & Critical Thinking",
    description: "Arguments, validity, fallacies",
    subject: "philosophy",
    topic: "Logic — arguments and validity",
    gradeLevel: "College",
    tutorContext:
      "Logic: premises/conclusions, validity, common fallacies. Symbolic logic gently.",
  },
  {
    id: "art-history",
    category: "college",
    label: "Art History",
    description: "Movements, analysis, context",
    subject: "art",
    topic: "Art history — formal analysis",
    gradeLevel: "College",
    tutorContext:
      "Art history: formal analysis, context, comparison. Visual description before interpretation.",
  },
  {
    id: "music-theory",
    category: "k12",
    label: "Music Theory",
    description: "Scales, harmony, rhythm",
    subject: "music",
    topic: "Music theory — harmony and rhythm",
    gradeLevel: "High school / college",
    tutorContext:
      "Music theory: notation, scales, chords, rhythm. Ear training suggestions when relevant.",
  },
  ...GLOBAL_STUDY_TRACKS.filter((t) => t.id !== "ssat-middle" && t.id !== "ssat-upper"),
  ...EXPANDED_STUDY_TRACKS,
  ...STATE_ASSESSMENT_TRACKS,
  ...WORLDWIDE_STUDY_TRACKS,
  {
    id: "custom",
    category: "custom",
    label: "Custom topic",
    description: "Pick your own subject and topic",
    subject: "other",
    topic: "",
    gradeLevel: "",
    tutorContext: "",
  },
];

export function getStudyTrack(id: StudyTrackId): StudyTrack {
  return (
    STUDY_TRACKS.find((t) => t.id === id) ??
    STUDY_TRACKS[STUDY_TRACKS.length - 1]
  );
}

export function tracksInCategory(
  category: StudyTrackCategory | "all"
): StudyTrack[] {
  if (category === "all") {
    return STUDY_TRACKS.filter((t) => t.id !== "custom");
  }
  return STUDY_TRACKS.filter((t) => t.category === category);
}
