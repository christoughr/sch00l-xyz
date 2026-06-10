import type { StudyTrack } from "./study-tracks";

const EXAM = (t: Omit<StudyTrack, "category">): StudyTrack => ({
  ...t,
  category: "exam_prep",
});

/** US state & provincial standardized assessments (FCAT legacy → FAST/FSA, STAAR, Regents, etc.). */
export const STATE_ASSESSMENT_TRACKS: StudyTrack[] = [
  EXAM({
    id: "us-fl-fast",
    label: "Florida FAST",
    description: "Florida Assessment of Student Thinking (replaces FSA/FCAT)",
    subject: "math",
    topic: "Florida FAST — ELA and math benchmarks",
    gradeLevel: "Florida K–12",
    tutorContext:
      "Florida FAST: grade-level ELA and math standards. Former FCAT/FSA skills — reading comp, multi-step math, B.E.S.T. alignment.",
  }),
  EXAM({
    id: "us-fl-fsa-legacy",
    label: "Florida FSA (legacy)",
    description: "Florida Standards Assessments archive prep",
    subject: "english",
    topic: "FSA — reading, writing, math",
    gradeLevel: "Florida grades 3–10",
    tutorContext:
      "FSA legacy format: paired passages, editing, grade-band math. Useful for transfer students and retakes.",
  }),
  EXAM({
    id: "us-tx-staar",
    label: "Texas STAAR",
    description: "State of Texas Assessments of Academic Readiness",
    subject: "math",
    topic: "STAAR — math, reading, science, social studies",
    gradeLevel: "Texas grades 3–12",
    tutorContext:
      "STAAR: TEKS-aligned items, open-ended and multiple choice. Algebra I EOC and grade-level tests.",
  }),
  EXAM({
    id: "us-ny-regents",
    label: "NY Regents Exams",
    description: "New York high school Regents",
    subject: "science",
    topic: "Regents — Algebra, Living Environment, Global History",
    gradeLevel: "New York high school",
    tutorContext:
      "NY Regents: constructed response, key terms, past exam patterns. Algebra I, Geometry, Living Environment common.",
  }),
  EXAM({
    id: "us-ca-caaspp",
    label: "California CAASPP / ELPAC",
    description: "California statewide assessments",
    subject: "english",
    topic: "CAASPP — ELA and math; ELPAC for EL students",
    gradeLevel: "California grades 3–8, 11",
    tutorContext:
      "CAASPP: Smarter Balanced style, claim targets, performance tasks. ELPAC speaking/listening for English learners.",
  }),
  EXAM({
    id: "us-ga-milestones",
    label: "Georgia Milestones",
    description: "Georgia end-of-grade and EOC tests",
    subject: "math",
    topic: "Georgia Milestones — ELA, math, science, social studies",
    gradeLevel: "Georgia K–12",
    tutorContext:
      "Georgia Milestones: Georgia Standards of Excellence. EOC Algebra, US History, Biology.",
  }),
  EXAM({
    id: "us-oh-ost",
    label: "Ohio State Tests (OST)",
    description: "Ohio end-of-course exams",
    subject: "math",
    topic: "Ohio OST — ELA, math, science, social studies",
    gradeLevel: "Ohio grades 3–12",
    tutorContext:
      "Ohio OST: AIR-style items, EOC Algebra I, Geometry, American Government.",
  }),
  EXAM({
    id: "us-pa-keystone",
    label: "Pennsylvania Keystone",
    description: "PA high school graduation exams",
    subject: "math",
    topic: "Keystone — Algebra I, Literature, Biology",
    gradeLevel: "Pennsylvania high school",
    tutorContext:
      "Keystone Exams: module-based, anchor eligible content. Literature paired passages.",
  }),
  EXAM({
    id: "us-il-iar",
    label: "Illinois IAR",
    description: "Illinois Assessment of Readiness",
    subject: "math",
    topic: "IAR — ELA and math",
    gradeLevel: "Illinois grades 3–8",
    tutorContext:
      "Illinois IAR: claims and targets similar to Smarter Balanced. Multi-step problem solving.",
  }),
  EXAM({
    id: "us-nj-njsla",
    label: "New Jersey NJSLA",
    description: "New Jersey Student Learning Assessments",
    subject: "english",
    topic: "NJSLA — ELA, math, science",
    gradeLevel: "New Jersey grades 3–11",
    tutorContext:
      "NJSLA: NJSLS-aligned. Science grade 5, 8, 11. ELA evidence-based writing.",
  }),
  EXAM({
    id: "us-va-sol",
    label: "Virginia SOL",
    description: "Standards of Learning tests",
    subject: "history",
    topic: "Virginia SOL — history, math, science, ELA",
    gradeLevel: "Virginia K–12",
    tutorContext:
      "Virginia SOL: cumulative standards, history from Jamestown to present, Algebra I EOC.",
  }),
  EXAM({
    id: "ca-on-eqao",
    label: "Ontario EQAO",
    description: "Ontario provincial literacy & math tests",
    subject: "math",
    topic: "EQAO — Grade 3, 6, 9 math; Grade 10 OSSLT",
    gradeLevel: "Ontario",
    tutorContext:
      "EQAO: OSSLT reading/writing for graduation, Grade 9 math applied/academic patterns.",
  }),
];
