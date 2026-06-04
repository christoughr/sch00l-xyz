import { getStudyTrack, type StudyTrack, type StudyTrackCategory } from "./study-tracks";

export type TrackSection = {
  id: string;
  label: string;
  description: string;
};

function sections(
  trackLabel: string,
  units: { id: string; name: string; desc: string }[]
): TrackSection[] {
  return units.map((u) => ({
    id: u.id,
    label: `${u.name}`,
    description: `${trackLabel}: ${u.desc}`,
  }));
}

const AP_MATH = [
  { id: "limits", name: "Limits & continuity", desc: "One-sided limits, continuity, asymptotes" },
  { id: "derivatives", name: "Derivatives", desc: "Rules, chain/product/quotient, implicit" },
  { id: "apps-deriv", name: "Derivative applications", desc: "Related rates, optimization, motion" },
  { id: "integrals", name: "Integrals & FTC", desc: "Antiderivatives, area, accumulation" },
  { id: "exam-prep", name: "Exam prep", desc: "FRQ strategies, mixed review, calculator skills" },
];

const AP_SCIENCE = [
  { id: "foundations", name: "Core concepts", desc: "Key models, vocabulary, experimental design" },
  { id: "mechanisms", name: "Processes & mechanisms", desc: "Pathways, systems, cause-and-effect" },
  { id: "data-lab", name: "Data & lab skills", desc: "Graphs, error analysis, claim-evidence-reasoning" },
  { id: "applications", name: "Real-world applications", desc: "Case studies, interdisciplinary links" },
  { id: "exam-prep", name: "Exam prep", desc: "MCQ/FRQ practice, timing, rubric alignment" },
];

const AP_HISTORY = [
  { id: "periods", name: "Historical periods", desc: "Chronology, turning points, continuity" },
  { id: "themes", name: "Themes & comparisons", desc: "Causation, comparison, continuity/change" },
  { id: "sources", name: "Primary sources", desc: "Document analysis, sourcing, contextualization" },
  { id: "writing", name: "Historical argument", desc: "Thesis, evidence, complexity" },
  { id: "exam-prep", name: "Exam prep", desc: "DBQ/LEQ/SAQ strategies and rubrics" },
];

const AP_ENGLISH = [
  { id: "rhetoric", name: "Rhetoric & argument", desc: "Claims, evidence, appeals, structure" },
  { id: "analysis", name: "Close reading", desc: "Diction, syntax, figurative language" },
  { id: "composition", name: "Writing craft", desc: "Thesis, organization, style, revision" },
  { id: "genres", name: "Genres & texts", desc: "Poetry, prose, argument, synthesis sources" },
  { id: "exam-prep", name: "Exam prep", desc: "Timed essays, MCQ strategies, scoring" },
];

const AP_CS = [
  { id: "java-basics", name: "Java fundamentals", desc: "Types, control flow, methods, classes" },
  { id: "oop", name: "OOP & design", desc: "Inheritance, polymorphism, encapsulation" },
  { id: "data-structs", name: "Data structures", desc: "Arrays, ArrayList, 2D arrays, recursion" },
  { id: "algorithms", name: "Algorithms", desc: "Searching, sorting, complexity intuition" },
  { id: "exam-prep", name: "Exam prep", desc: "FRQ patterns, tracing, test-day strategy" },
];

const SAT_ACT = [
  { id: "fundamentals", name: "Foundations", desc: "Core skills and common traps" },
  { id: "strategy", name: "Test strategy", desc: "Pacing, elimination, answer checking" },
  { id: "practice-a", name: "Practice set A", desc: "Mixed difficulty timed items" },
  { id: "practice-b", name: "Practice set B", desc: "Harder items and review" },
  { id: "review", name: "Full review", desc: "Error log, weak-skill drill, confidence check" },
];

const EXAM_PREP = [
  { id: "content", name: "Content review", desc: "High-yield facts and frameworks" },
  { id: "passage", name: "Passage & scenarios", desc: "Application to cases and stimuli" },
  { id: "reasoning", name: "Critical reasoning", desc: "Logic, inference, elimination" },
  { id: "timed", name: "Timed blocks", desc: "Section pacing under exam conditions" },
  { id: "mock", name: "Mock & debrief", desc: "Full-length simulation and error analysis" },
];

const COLLEGE = [
  { id: "concepts", name: "Core concepts", desc: "Definitions, models, key theorems" },
  { id: "problem-solving", name: "Problem solving", desc: "Worked examples and heuristics" },
  { id: "applications", name: "Applications", desc: "Real problems and case studies" },
  { id: "midterm", name: "Midterm prep", desc: "Mixed review and common exam formats" },
  { id: "final", name: "Final prep", desc: "Comprehensive review and practice exams" },
];

const K12 = [
  { id: "vocabulary", name: "Vocabulary & basics", desc: "Terms, notation, prerequisite skills" },
  { id: "skills", name: "Skill building", desc: "Guided practice and fluency" },
  { id: "application", name: "Application", desc: "Word problems and multi-step tasks" },
  { id: "review", name: "Unit review", desc: "Mixed practice and common mistakes" },
  { id: "assessment", name: "Assessment prep", desc: "Test-style items and confidence check" },
];

const LANGUAGES = [
  { id: "vocab", name: "Vocabulary", desc: "High-frequency words and phrases" },
  { id: "grammar", name: "Grammar", desc: "Structures, conjugation, agreement" },
  { id: "reading", name: "Reading", desc: "Comprehension and inference" },
  { id: "writing", name: "Writing & speaking", desc: "Production, feedback, revision" },
  { id: "exam", name: "Exam prep", desc: "Listening/speaking/writing rubrics" },
];

const INTERNATIONAL = [
  { id: "syllabus", name: "Syllabus topics", desc: "Specification-aligned content blocks" },
  { id: "skills", name: "Exam skills", desc: "Command words, mark schemes, timing" },
  { id: "past-papers", name: "Past-paper style", desc: "Authentic item types and difficulty" },
  { id: "weak-areas", name: "Weak-area drill", desc: "Targeted remediation" },
  { id: "final-review", name: "Final review", desc: "Full syllabus spiral review" },
];

const PROFESSIONAL = [
  { id: "fundamentals", name: "Fundamentals", desc: "Core professional knowledge" },
  { id: "clinical", name: "Clinical / applied", desc: "Cases, scenarios, judgment" },
  { id: "ethics", name: "Ethics & safety", desc: "Standards, scope, best practice" },
  { id: "practice-q", name: "Practice questions", desc: "High-yield MCQ blocks" },
  { id: "mock-exam", name: "Mock exam", desc: "Timed simulation and debrief" },
];

const AP_BIO_SECTIONS = sections("AP Biology", [
  { id: "cells", name: "Cells & organelles", desc: "Structure, membrane transport, energetics" },
  { id: "genetics", name: "Genetics & heredity", desc: "DNA, gene expression, inheritance" },
  { id: "evolution", name: "Evolution", desc: "Natural selection, phylogeny, population genetics" },
  { id: "ecology", name: "Ecology", desc: "Ecosystems, populations, conservation" },
  { id: "exam-prep", name: "AP exam prep", desc: "FRQ strategies and full review" },
]);

const AP_CHEM_SECTIONS = sections("AP Chemistry", [
  { id: "atomic", name: "Atomic structure", desc: "Electron config, periodic trends" },
  { id: "bonding", name: "Bonding & IMF", desc: "Lewis, VSEPR, intermolecular forces" },
  { id: "reactions", name: "Reactions & stoichiometry", desc: "Types, equilibrium, kinetics" },
  { id: "thermo", name: "Thermodynamics", desc: "Enthalpy, entropy, Gibbs" },
  { id: "exam-prep", name: "AP exam prep", desc: "Lab skills, FRQ, MCQ review" },
]);

const AP_PHYSICS_SECTIONS = sections("AP Physics", [
  { id: "kinematics", name: "Kinematics & forces", desc: "Motion, Newton's laws, free-body diagrams" },
  { id: "energy", name: "Energy & momentum", desc: "Work, power, collisions, conservation" },
  { id: "rotation", name: "Rotation & oscillations", desc: "Torque, SHM, waves (where applicable)" },
  { id: "e-m", name: "E&M / modern", desc: "Fields, circuits, quantum (course-dependent)" },
  { id: "exam-prep", name: "AP exam prep", desc: "Lab skills, FRQ, MCQ review" },
]);

const BY_TRACK: Record<string, TrackSection[]> = {
  "ap-bio": AP_BIO_SECTIONS,
  "ap-chem": AP_CHEM_SECTIONS,
  "ap-env-sci": sections("AP Environmental Science", [
    { id: "ecosystems", name: "Ecosystems", desc: "Energy flow, biomes, biodiversity" },
    { id: "populations", name: "Populations", desc: "Growth models, carrying capacity" },
    { id: "earth-systems", name: "Earth systems", desc: "Atmosphere, hydrosphere, geologic cycles" },
    { id: "pollution", name: "Pollution & resources", desc: "Human impact, sustainability, policy" },
    { id: "exam-prep", name: "AP exam prep", desc: "FRQ, data analysis, exam strategies" },
  ]),
  "ap-physics-1": AP_PHYSICS_SECTIONS,
  "ap-physics-c": AP_PHYSICS_SECTIONS,
  "ap-calc-ab": sections("AP Calculus AB", AP_MATH),
  "ap-calc-bc": sections("AP Calculus BC", [
    ...AP_MATH.slice(0, 4),
    { id: "series", name: "Series & sequences", desc: "Convergence, Taylor, error bounds" },
    { id: "parametric", name: "Parametric & polar", desc: "Curves, derivatives, area" },
    { id: "exam-prep", name: "AP exam prep", desc: "FRQ strategies and mixed review" },
  ]),
  "ap-stats": sections("AP Statistics", [
    { id: "data", name: "Exploring data", desc: "Distributions, graphs, summary stats" },
    { id: "sampling", name: "Sampling & experiments", desc: "Bias, design, simulation" },
    { id: "probability", name: "Probability", desc: "Random variables, normal model" },
    { id: "inference", name: "Inference", desc: "CI and tests for proportions/means" },
    { id: "regression", name: "Regression & chi-square", desc: "Bivariate data, goodness of fit" },
  ]),
  "ap-us-history": sections("AP US History", AP_HISTORY),
  "ap-world": sections("AP World History", AP_HISTORY),
  "ap-euro": sections("AP European History", AP_HISTORY),
  "ap-lang": sections("AP English Language", AP_ENGLISH),
  "ap-lit": sections("AP English Literature", AP_ENGLISH),
  "ap-cs-a": sections("AP Computer Science A", AP_CS),
  "sat-math": sections("SAT Math", SAT_ACT),
  "sat-reading": sections("SAT Reading & Writing", SAT_ACT),
  "act-math": sections("ACT Math", SAT_ACT),
  "act-science": sections("ACT Science", SAT_ACT),
  "mcat-bb": sections("MCAT Bio/Biochem", EXAM_PREP),
  "mcat-cp": sections("MCAT Chem/Phys", EXAM_PREP),
  "mcat-ps": sections("MCAT Psych/Soc", EXAM_PREP),
  "mcat-cars": sections("MCAT CARS", EXAM_PREP),
  lsat: sections("LSAT", EXAM_PREP),
  "nclex-rn": sections("NCLEX-RN", PROFESSIONAL),
  "gre-quant": sections("GRE Quant", EXAM_PREP),
  "gre-verbal": sections("GRE Verbal", EXAM_PREP),
  gmat: sections("GMAT", EXAM_PREP),
  "jee-main": sections("JEE Main", INTERNATIONAL),
  neet: sections("NEET", INTERNATIONAL),
  "igcse-math": sections("IGCSE Math", INTERNATIONAL),
  "a-level-math": sections("A-Level Math", INTERNATIONAL),
  "ib-math-sl": sections("IB Math SL", INTERNATIONAL),
  "gaokao-math": sections("Gaokao Math", INTERNATIONAL),
  "hsc-math-adv": sections("HSC Mathematics", INTERNATIONAL),
};

const BY_CATEGORY: Record<StudyTrackCategory, TrackSection[]> = {
  ap: sections("AP course", AP_SCIENCE),
  sat_act: sections("SAT/ACT", SAT_ACT),
  exam_prep: sections("Exam prep", EXAM_PREP),
  college: sections("College course", COLLEGE),
  k12: sections("High school", K12),
  languages: sections("Language", LANGUAGES),
  international: sections("International exam", INTERNATIONAL),
  professional: sections("Professional exam", PROFESSIONAL),
  custom: [
    { id: "intro", label: "Introduction", description: "Scope the topic and prerequisites" },
    { id: "core", label: "Core concepts", description: "Definitions and worked examples" },
    { id: "practice", label: "Guided practice", description: "Step-by-step problem solving" },
    { id: "review", label: "Review", description: "Mixed problems and self-check" },
    { id: "assessment", label: "Assessment prep", description: "Test-style items and reflection" },
  ],
};

function forTrack(track: StudyTrack): TrackSection[] {
  if (BY_TRACK[track.id]) return BY_TRACK[track.id];
  if (track.category === "custom") return BY_CATEGORY.custom;

  const template =
    track.category === "ap"
      ? AP_SCIENCE
      : track.category === "sat_act"
        ? SAT_ACT
        : track.category === "exam_prep"
          ? EXAM_PREP
          : track.category === "college"
            ? COLLEGE
            : track.category === "k12"
              ? K12
              : track.category === "languages"
                ? LANGUAGES
                : track.category === "international"
                  ? INTERNATIONAL
                  : track.category === "professional"
                    ? PROFESSIONAL
                    : K12;

  return sections(track.label, template);
}

export function getTrackSections(trackId: string): TrackSection[] {
  const track = getStudyTrack(trackId);
  return forTrack(track);
}

export function getSectionLabel(trackId: string, sectionId: string | null): string {
  if (!sectionId) return "";
  const s = getTrackSections(trackId).find((x) => x.id === sectionId);
  return s?.label ?? sectionId;
}

export function buildSectionTopic(trackId: string, sectionId: string | null): string {
  const track = getStudyTrack(trackId);
  const base = track.topic || track.label || "Study topic";
  const section = getTrackSections(trackId).find((s) => s.id === sectionId);
  if (!section) return base;
  return `${base} — ${section.label}: ${section.description}`;
}

export function hasRealSections(trackId: string): boolean {
  return getTrackSections(trackId).length > 0 && trackId !== "custom";
}
