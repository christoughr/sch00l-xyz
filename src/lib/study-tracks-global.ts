import type { SubjectId } from "./subject-ids";

/** Mirrors StudyTrack shape; categories scoped to global curricula. */
export type GlobalStudyTrackCategory =
  | "international"
  | "professional"
  | "exam_prep";

export type GlobalStudyTrack = {
  id: string;
  category: GlobalStudyTrackCategory;
  label: string;
  description: string;
  subject: SubjectId;
  topic: string;
  gradeLevel: string;
  tutorContext: string;
};

const INT = (
  t: Omit<GlobalStudyTrack, "category">
): GlobalStudyTrack => ({ ...t, category: "international" });

const PRO = (
  t: Omit<GlobalStudyTrack, "category">
): GlobalStudyTrack => ({ ...t, category: "professional" });

const EXAM = (
  t: Omit<GlobalStudyTrack, "category">
): GlobalStudyTrack => ({ ...t, category: "exam_prep" });

export const GLOBAL_STUDY_TRACKS: GlobalStudyTrack[] = [
  // —— United Kingdom ——
  INT({
    id: "uk-gcse-math",
    label: "GCSE Mathematics",
    description: "Number, algebra, geometry, statistics",
    subject: "math",
    topic: "GCSE Math — algebra and geometry",
    gradeLevel: "GCSE",
    tutorContext:
      "GCSE Math: Edexcel/AQA/OCR specs, show working for method marks. Link topics to grade boundaries and calculator vs non-calculator papers.",
  }),
  INT({
    id: "uk-gcse-english",
    label: "GCSE English Language",
    description: "Reading, writing, SPaG",
    subject: "english",
    topic: "GCSE English — reading and creative writing",
    gradeLevel: "GCSE",
    tutorContext:
      "GCSE English Language: AO1–AO6, analytical paragraphs and creative structure. Model PEEL/PETER before full essays.",
  }),
  INT({
    id: "uk-gcse-science",
    label: "GCSE Combined Science",
    description: "Biology, chemistry, physics foundations",
    subject: "science",
    topic: "GCSE Science — cells, forces, and reactions",
    gradeLevel: "GCSE",
    tutorContext:
      "GCSE Combined/Triple Science: required practicals, equation recall, and 6-mark extended responses. Separate trilogy vs synergy when relevant.",
  }),
  INT({
    id: "uk-alevel-math",
    label: "A-Level Mathematics",
    description: "Pure, mechanics, statistics",
    subject: "math",
    topic: "A-Level Math — pure and applied",
    gradeLevel: "A-Level",
    tutorContext:
      "A-Level Maths: differentiation, integration, trig identities, and applied modules. Exam-board notation (Edexcel, OCR, AQA).",
  }),
  INT({
    id: "uk-alevel-further-math",
    label: "A-Level Further Mathematics",
    description: "Matrices, complex numbers, further pure",
    subject: "math",
    topic: "Further Math — matrices and complex numbers",
    gradeLevel: "A-Level Further",
    tutorContext:
      "Further Maths: matrices, complex numbers, polar, hyperbolic functions. Build intuition before heavy algebra.",
  }),
  INT({
    id: "uk-alevel-physics",
    label: "A-Level Physics",
    description: "Fields, particles, mechanics",
    subject: "science",
    topic: "A-Level Physics — fields and mechanics",
    gradeLevel: "A-Level",
    tutorContext:
      "A-Level Physics: SI units, uncertainties, derivations, and past-paper command words. Free-body diagrams before equations.",
  }),
  INT({
    id: "uk-alevel-chemistry",
    label: "A-Level Chemistry",
    description: "Organic, physical, inorganic",
    subject: "science",
    topic: "A-Level Chemistry — mechanisms and energetics",
    gradeLevel: "A-Level",
    tutorContext:
      "A-Level Chem: mechanisms with curly arrows, Born-Haber cycles, and titration calculations. Show setup before final answer.",
  }),
  INT({
    id: "uk-alevel-biology",
    label: "A-Level Biology",
    description: "Cells, genetics, ecosystems",
    subject: "science",
    topic: "A-Level Biology — genetics and physiology",
    gradeLevel: "A-Level",
    tutorContext:
      "A-Level Bio: data analysis, essay planning, and synoptic links across modules. Use precise biological terminology.",
  }),
  INT({
    id: "uk-alevel-economics",
    label: "A-Level Economics",
    description: "Micro, macro, policy evaluation",
    subject: "economics",
    topic: "A-Level Economics — markets and macro policy",
    gradeLevel: "A-Level",
    tutorContext:
      "A-Level Economics: diagrams, elasticity, and evaluative chains (however, depends on). Link theory to UK and global contexts.",
  }),

  // —— International Baccalaureate ——
  EXAM({
    id: "ib-math-aa-hl",
    label: "IB Math AA HL",
    description: "Analysis & approaches higher level",
    subject: "math",
    topic: "IB Math AA HL — calculus and proofs",
    gradeLevel: "IB HL",
    tutorContext:
      "IB Math AA HL: rigorous proofs, calculus, vectors. Use IB command terms and GDC where appropriate.",
  }),
  EXAM({
    id: "ib-math-aa-sl",
    label: "IB Math AA SL",
    description: "Analysis & approaches standard level",
    subject: "math",
    topic: "IB Math AA SL — functions and calculus",
    gradeLevel: "IB SL",
    tutorContext:
      "IB Math AA SL: functions, introductory calculus, statistics. Balance analytical methods with technology.",
  }),
  EXAM({
    id: "ib-math-ai-hl",
    label: "IB Math AI HL",
    description: "Applications & interpretation HL",
    subject: "math",
    topic: "IB Math AI HL — modelling and statistics",
    gradeLevel: "IB HL",
    tutorContext:
      "IB Math AI HL: modelling, statistics, Voronoi, graph theory. Context-first problem solving.",
  }),
  EXAM({
    id: "ib-math-ai-sl",
    label: "IB Math AI SL",
    description: "Applications & interpretation SL",
    subject: "math",
    topic: "IB Math AI SL — data and finance",
    gradeLevel: "IB SL",
    tutorContext:
      "IB Math AI SL: spreadsheets, regression, finance maths. Interpret results in real-world units.",
  }),
  EXAM({
    id: "ib-physics-hl",
    label: "IB Physics HL",
    description: "Mechanics, fields, quantum intro",
    subject: "science",
    topic: "IB Physics HL — fields and energy",
    gradeLevel: "IB HL",
    tutorContext:
      "IB Physics HL: uncertainties, graph linearization, and option topics. Link IA-style reasoning to exam questions.",
  }),
  EXAM({
    id: "ib-physics-sl",
    label: "IB Physics SL",
    description: "Core mechanics and waves",
    subject: "science",
    topic: "IB Physics SL — mechanics and waves",
    gradeLevel: "IB SL",
    tutorContext:
      "IB Physics SL: conceptual clarity, unit analysis, and data-based questions. Scaffold multi-step problems.",
  }),
  EXAM({
    id: "ib-chemistry-hl",
    label: "IB Chemistry HL",
    description: "Stoichiometry, organic, energetics",
    subject: "science",
    topic: "IB Chemistry HL — equilibrium and organic",
    gradeLevel: "IB HL",
    tutorContext:
      "IB Chem HL: stoichiometry, energetics, organic mechanisms. Show working for Paper 2 extended responses.",
  }),
  EXAM({
    id: "ib-chemistry-sl",
    label: "IB Chemistry SL",
    description: "Core chemical principles",
    subject: "science",
    topic: "IB Chemistry SL — bonding and reactions",
    gradeLevel: "IB SL",
    tutorContext:
      "IB Chem SL: bonding, acids/bases, redox. Connect lab skills to syllabus statements.",
  }),
  EXAM({
    id: "ib-biology-hl",
    label: "IB Biology HL",
    description: "Molecular biology, genetics, ecology",
    subject: "science",
    topic: "IB Biology HL — molecular biology and ecology",
    gradeLevel: "IB HL",
    tutorContext:
      "IB Bio HL: data-based questions, experimental design, and HL extension topics. Use syllabus numbering when helpful.",
  }),
  EXAM({
    id: "ib-biology-sl",
    label: "IB Biology SL",
    description: "Cell biology, genetics, human physiology",
    subject: "science",
    topic: "IB Biology SL — cells and genetics",
    gradeLevel: "IB SL",
    tutorContext:
      "IB Bio SL: diagrams in words, genetics problems, and ecology systems. Emphasize command terms.",
  }),
  EXAM({
    id: "ib-english-a-hl",
    label: "IB English A HL",
    description: "Literary analysis, HL essay",
    subject: "english",
    topic: "IB English A HL — literary analysis",
    gradeLevel: "IB HL",
    tutorContext:
      "IB English A HL: close reading, global issues, HL essay criteria. Thesis and textual evidence first.",
  }),
  EXAM({
    id: "ib-history-hl",
    label: "IB History HL",
    description: "Prescribed subjects, HL paper 3",
    subject: "history",
    topic: "IB History HL — historical argument",
    gradeLevel: "IB HL",
    tutorContext:
      "IB History HL: OPVL, historiography, and essay structure for Papers 2–3. Compare perspectives, not lists.",
  }),
  EXAM({
    id: "ib-economics-hl",
    label: "IB Economics HL",
    description: "Micro, macro, international, development",
    subject: "economics",
    topic: "IB Economics HL — policy evaluation",
    gradeLevel: "IB HL",
    tutorContext:
      "IB Econ HL: diagrams, real-world examples, and IA-style evaluation. Define terms before applying models.",
  }),
  EXAM({
    id: "ib-psychology-hl",
    label: "IB Psychology HL",
    description: "Biological, cognitive, sociocultural",
    subject: "psychology",
    topic: "IB Psychology HL — research methods",
    gradeLevel: "IB HL",
    tutorContext:
      "IB Psych HL: studies, ethics, and ERQ structure. Link approaches to specific behaviors.",
  }),
  EXAM({
    id: "ib-geography-hl",
    label: "IB Geography HL",
    description: "Core, options, fieldwork",
    subject: "geography",
    topic: "IB Geography HL — spatial patterns",
    gradeLevel: "IB HL",
    tutorContext:
      "IB Geography HL: case studies, GIS skills, and essay planning. Use place-specific examples.",
  }),
  EXAM({
    id: "ib-cs-hl",
    label: "IB Computer Science HL",
    description: "OOP, algorithms, case study",
    subject: "cs",
    topic: "IB CS HL — algorithms and OOP",
    gradeLevel: "IB HL",
    tutorContext:
      "IB CS HL: pseudocode, tracing, OOP design, and case study. Debug reasoning over pasted solutions.",
  }),
  EXAM({
    id: "ib-french-b-hl",
    label: "IB French B HL",
    description: "Oral, written, receptive skills",
    subject: "languages",
    topic: "IB French B HL — oral and writing",
    gradeLevel: "IB HL",
    tutorContext:
      "IB French B HL: themes, formats (email, blog), oral criteria. Correct errors with retry prompts.",
  }),

  // —— India ——
  EXAM({
    id: "in-jee-main",
    label: "JEE Main",
    description: "PCM for NITs and qualifying",
    subject: "math",
    topic: "JEE Main — algebra and mechanics",
    gradeLevel: "JEE Main",
    tutorContext:
      "JEE Main: NCERT-first, speed with accuracy, and PYQ patterns. Multi-concept problems need clear sub-steps.",
  }),
  EXAM({
    id: "in-jee-advanced",
    label: "JEE Advanced",
    description: "IIT entrance, deep problem solving",
    subject: "math",
    topic: "JEE Advanced — multi-concept problems",
    gradeLevel: "JEE Advanced",
    tutorContext:
      "JEE Advanced: insight problems, parity, and symmetry tricks. Avoid brute force; teach elimination strategies.",
  }),
  EXAM({
    id: "in-neet",
    label: "NEET UG",
    description: "Medical entrance biology focus",
    subject: "science",
    topic: "NEET — biology and chemistry",
    gradeLevel: "NEET",
    tutorContext:
      "NEET: NCERT line-by-line biology, physics numerics, organic mechanisms. Time management for 180 questions.",
  }),
  INT({
    id: "in-cbse-10-math",
    label: "CBSE Class 10 Mathematics",
    description: "Board exam algebra and geometry",
    subject: "math",
    topic: "CBSE Class 10 Math — board exam prep",
    gradeLevel: "CBSE Class 10",
    tutorContext:
      "CBSE Class 10 Math: step marking, standard algorithms, and previous-year trends. Calculator-free discipline.",
  }),
  INT({
    id: "in-cbse-10-science",
    label: "CBSE Class 10 Science",
    description: "Physics, chemistry, biology units",
    subject: "science",
    topic: "CBSE Class 10 Science — board syllabus",
    gradeLevel: "CBSE Class 10",
    tutorContext:
      "CBSE Class 10 Science: NCERT exemplar, diagram labels, and 3-mark answers. Link concepts across chapters.",
  }),
  INT({
    id: "in-cbse-12-math",
    label: "CBSE Class 12 Mathematics",
    description: "Calculus, probability, relations",
    subject: "math",
    topic: "CBSE Class 12 Math — calculus and probability",
    gradeLevel: "CBSE Class 12",
    tutorContext:
      "CBSE Class 12 Math: integration techniques, 3D geometry, and probability. Show every board-mark step.",
  }),
  INT({
    id: "in-cbse-12-science",
    label: "CBSE Class 12 Science (PCM/PCB)",
    description: "Senior secondary board sciences",
    subject: "science",
    topic: "CBSE Class 12 Science — board exam prep",
    gradeLevel: "CBSE Class 12",
    tutorContext:
      "CBSE Class 12 Science: derivations, numericals, and organic name reactions. Balance PCM vs PCB tracks.",
  }),

  // —— China ——
  EXAM({
    id: "cn-gaokao-math",
    label: "Gaokao Mathematics",
    description: "National college entrance math",
    subject: "math",
    topic: "Gaokao Math — comprehensive problem solving",
    gradeLevel: "Gaokao",
    tutorContext:
      "Gaokao Math: mixed topics, clever substitutions, and strict time limits. Build from textbook to mock exam difficulty.",
  }),
  EXAM({
    id: "cn-gaokao-english",
    label: "Gaokao English",
    description: "Reading, grammar, writing",
    subject: "english",
    topic: "Gaokao English — reading and cloze",
    gradeLevel: "Gaokao",
    tutorContext:
      "Gaokao English: cloze logic, reading inference, and structured writing. Clarify common false cognates.",
  }),

  // —— Europe ——
  INT({
    id: "de-abitur-math",
    label: "Abitur Mathematics",
    description: "German upper secondary math",
    subject: "math",
    topic: "Abitur Math — analysis and stochastics",
    gradeLevel: "Abitur",
    tutorContext:
      "Abitur Math: Leistungskurs depth, proof sketches, and calculator tasks. Follow Bundesland variant when known.",
  }),
  INT({
    id: "fr-bac-math",
    label: "Baccalauréat Mathématiques",
    description: "French terminal math specialty",
    subject: "math",
    topic: "Bac Math — spécialité and terminale",
    gradeLevel: "Baccalauréat",
    tutorContext:
      "Bac Math: spécialité chapters, exercices type, and Grand Oral links. French terminology with clear definitions.",
  }),
  INT({
    id: "fr-bac-philo",
    label: "Baccalauréat Philosophie",
    description: "Dissertation and commentary",
    subject: "philosophy",
    topic: "Bac Philo — dissertation structure",
    gradeLevel: "Baccalauréat",
    tutorContext:
      "Bac Philo: problématique, plan dialectique, and authors. Outline before full dissertation.",
  }),
  INT({
    id: "es-pau-math",
    label: "PAU / EvAU Mathematics",
    description: "Spanish university access math",
    subject: "math",
    topic: "PAU Math — selectividad preparation",
    gradeLevel: "PAU",
    tutorContext:
      "PAU Math: bloques, past EvAU papers, and trap spotting. Step-by-step for 2-point partial credit.",
  }),
  INT({
    id: "es-pau-science",
    label: "PAU Ciencias",
    description: "Physics and chemistry access exam",
    subject: "science",
    topic: "PAU Science — physics and chemistry",
    gradeLevel: "PAU",
    tutorContext:
      "PAU Ciencias: Física y Química numerics, units, and bilingual key terms. Link to Bachillerato syllabus.",
  }),

  // —— Australia & New Zealand ——
  INT({
    id: "au-hsc-math",
    label: "HSC Mathematics",
    description: "NSW Advanced/Extension math",
    subject: "math",
    topic: "HSC Math — Advanced and Extension 1",
    gradeLevel: "HSC",
    tutorContext:
      "HSC Math: NESA outcomes, band 6 proofs, and mixed topic papers. Extension 1 vs Advanced depth.",
  }),
  INT({
    id: "au-hsc-english",
    label: "HSC English Advanced",
    description: "Modules, essays, unseen texts",
    subject: "english",
    topic: "HSC English — module essays",
    gradeLevel: "HSC",
    tutorContext:
      "HSC English: rubric terms, thesis, and textual evidence. Scaffold paragraph before full essay.",
  }),
  INT({
    id: "au-vce-math",
    label: "VCE Mathematical Methods",
    description: "Victorian calculus-based methods",
    subject: "math",
    topic: "VCE Methods — calculus and functions",
    gradeLevel: "VCE",
    tutorContext:
      "VCE Methods: CAS skills, tech-active vs tech-free, and exam 1/2 strategies. VCAA wording matters.",
  }),
  INT({
    id: "nz-ncea-l3-math",
    label: "NCEA Level 3 Mathematics",
    description: "Calculus and statistics standards",
    subject: "math",
    topic: "NCEA L3 Math — calculus and statistics",
    gradeLevel: "NCEA Level 3",
    tutorContext:
      "NCEA L3: achievement vs merit vs excellence, internal vs external. Show merit-level depth in working.",
  }),

  // —— Singapore, Hong Kong, Taiwan, Korea ——
  EXAM({
    id: "sg-o-level-math",
    label: "Singapore O-Level Math",
    description: "E Math and A Math",
    subject: "math",
    topic: "O-Level Math — E Math and A Math",
    gradeLevel: "O-Level",
    tutorContext:
      "Singapore O-Level: E Math fundamentals, A Math additional techniques. SEAB format and common traps.",
  }),
  EXAM({
    id: "sg-a-level-h2-math",
    label: "Singapore A-Level H2 Math",
    description: "H2 Mathematics and further topics",
    subject: "math",
    topic: "A-Level H2 Math — calculus and vectors",
    gradeLevel: "A-Level (SG)",
    tutorContext:
      "H2 Math: MF26, graphing discipline, and Paper 2 time. Link to H3 Further Math when relevant.",
  }),
  EXAM({
    id: "hk-hkdse-math",
    label: "HKDSE Mathematics",
    description: "Compulsory and M1/M2 modules",
    subject: "math",
    topic: "HKDSE Math — compulsory part",
    gradeLevel: "HKDSE",
    tutorContext:
      "HKDSE Math: compulsory part rigor, M1/M2 calculus and algebra. DSE marking: method marks first.",
  }),
  EXAM({
    id: "hk-hkdse-english",
    label: "HKDSE English",
    description: "Reading, writing, listening, speaking",
    subject: "english",
    topic: "HKDSE English — reading and writing",
    gradeLevel: "HKDSE",
    tutorContext:
      "HKDSE English: Paper 1–4 formats, data file tasks, and SBA tips. Bilingual scaffolding when needed.",
  }),
  EXAM({
    id: "tw-gsat-math",
    label: "GSAT /學測 Mathematics",
    description: "Taiwan university entrance math",
    subject: "math",
    topic: "GSAT Math — multi-topic review",
    gradeLevel: "GSAT",
    tutorContext:
      "GSAT Math: 學測 mixed topics, speed, and common 陷阱. Connect to 指考 when student is Grade 12.",
  }),
  EXAM({
    id: "ssat-middle",
    label: "SSAT Middle Level",
    description: "Independent school admission — grades 5–7",
    subject: "math",
    topic: "SSAT Middle — math and verbal reasoning",
    gradeLevel: "SSAT Middle",
    tutorContext:
      "SSAT Middle: quantitative comparison, analogies, reading comp. Build vocabulary and number sense without over-drilling tricks.",
  }),
  EXAM({
    id: "ssat-upper",
    label: "SSAT Upper Level",
    description: "Independent school admission — grades 8–11",
    subject: "math",
    topic: "SSAT Upper — math, reading, and essay prep",
    gradeLevel: "SSAT Upper",
    tutorContext:
      "SSAT Upper: harder quantitative reasoning, synonyms/analogies, timed passages. Essay = clear thesis + examples.",
  }),

  // —— Middle East (IGCSE) ——
  INT({
    id: "me-igcse-math",
    label: "IGCSE Mathematics (International)",
    description: "Cambridge/Edexcel international math",
    subject: "math",
    topic: "IGCSE Math — core and extended",
    gradeLevel: "IGCSE",
    tutorContext:
      "IGCSE Math: core vs extended, past papers, and calculator papers. Middle East school calendars and mocks.",
  }),
  INT({
    id: "me-igcse-science",
    label: "IGCSE Coordinated Sciences",
    description: "Combined science international",
    subject: "science",
    topic: "IGCSE Science — biology, chemistry, physics",
    gradeLevel: "IGCSE",
    tutorContext:
      "IGCSE Science: practical skills, core content, and 6-mark questions. Coordinate with local ministry requirements.",
  }),
  INT({
    id: "me-igcse-english",
    label: "IGCSE English First Language",
    description: "Reading, directed writing, composition",
    subject: "english",
    topic: "IGCSE English — directed writing",
    gradeLevel: "IGCSE",
    tutorContext:
      "IGCSE English: summary, directed writing, and composition genres. Annotate passages before answering.",
  }),

  // —— Latin America ——
  EXAM({
    id: "br-enem-math",
    label: "ENEM Mathematics",
    description: "Brazil national high school exam",
    subject: "math",
    topic: "ENEM Math — contextualized problems",
    gradeLevel: "ENEM",
    tutorContext:
      "ENEM Math: interdisciplinary contexts, INEP style, and tri scoring awareness. Interpret Portuguese prompts clearly.",
  }),
  EXAM({
    id: "br-enem-sciences",
    label: "ENEM Ciências da Natureza",
    description: "Biology, chemistry, physics ENEM",
    subject: "science",
    topic: "ENEM Science — natureza integrada",
    gradeLevel: "ENEM",
    tutorContext:
      "ENEM Ciências: data in passages, ethics, and environment themes. Connect biology, chemistry, and physics.",
  }),
  EXAM({
    id: "mx-unam-prep",
    label: "UNAM / IPN Exam Prep",
    description: "Mexican university entrance prep",
    subject: "math",
    topic: "UNAM prep — algebra and reasoning",
    gradeLevel: "Examen UNAM",
    tutorContext:
      "UNAM/IPN: reactivos tipo, tiempo, and Spanish word problems. Review guías oficiales and simulacros.",
  }),

  // —— Cambridge ——
  INT({
    id: "cam-igcse-math",
    label: "Cambridge IGCSE Mathematics",
    description: "0580/0607 syllabus coverage",
    subject: "math",
    topic: "Cambridge IGCSE Math — 0580",
    gradeLevel: "Cambridge IGCSE",
    tutorContext:
      "Cambridge IGCSE Math: core/extended, formula sheet, and structured questions. Use Cambridge mark schemes.",
  }),
  INT({
    id: "cam-igcse-english",
    label: "Cambridge IGCSE English",
    description: "0500 First Language English",
    subject: "english",
    topic: "Cambridge IGCSE English — 0500",
    gradeLevel: "Cambridge IGCSE",
    tutorContext:
      "Cambridge IGCSE English: directed writing, composition, and reading inserts. AO breakdown from examiner reports.",
  }),
  INT({
    id: "cam-aice-math",
    label: "Cambridge AICE Mathematics",
    description: "Pre-university Cambridge math",
    subject: "math",
    topic: "Cambridge AICE Math — AS level topics",
    gradeLevel: "Cambridge AICE",
    tutorContext:
      "AICE Math: Pure Math 1/2 style, calculator papers, and progression to A Level. Link to ICE diploma goals.",
  }),

  // —— Canada ——
  INT({
    id: "ca-ontario-eqao",
    label: "Ontario EQAO",
    description: "Grade 9/10 provincial assessment",
    subject: "math",
    topic: "EQAO — Ontario math assessment",
    gradeLevel: "Ontario EQAO",
    tutorContext:
      "EQAO: Ontario curriculum expectations, literacy and math open-response. Practice released materials.",
  }),
  INT({
    id: "ca-bc-provincial",
    label: "BC Provincial Exams",
    description: "British Columbia graduation assessments",
    subject: "english",
    topic: "BC Provincial — literacy and numeracy",
    gradeLevel: "BC Graduation",
    tutorContext:
      "BC Provincials: numeracy and literacy graduation assessments. Focus on cross-curricular scenarios.",
  }),

  // —— Africa ——
  INT({
    id: "af-waec-math",
    label: "WAEC Mathematics",
    description: "West African Senior School Certificate",
    subject: "math",
    topic: "WAEC Math — WASSCE preparation",
    gradeLevel: "WAEC",
    tutorContext:
      "WAEC Math: WASSCE objectives, past questions, and show-all-working culture. Regional syllabus variants (Nigeria, Ghana).",
  }),
  INT({
    id: "af-waec-science",
    label: "WAEC Integrated Science",
    description: "Core science for WASSCE",
    subject: "science",
    topic: "WAEC Science — integrated topics",
    gradeLevel: "WAEC",
    tutorContext:
      "WAEC Science: practical alternatives, definitions, and structured theory. Link to local textbook sequences.",
  }),
  INT({
    id: "af-neco-math",
    label: "NECO SSCE Mathematics",
    description: "Nigeria NECO senior secondary",
    subject: "math",
    topic: "NECO Math — SSCE objectives",
    gradeLevel: "NECO",
    tutorContext:
      "NECO Math: objective + theory papers, NECO marking style, and speed drills. Compare with WAEC overlap.",
  }),
  INT({
    id: "af-neco-english",
    label: "NECO SSCE English",
    description: "Nigeria NECO English language",
    subject: "english",
    topic: "NECO English — comprehension and essay",
    gradeLevel: "NECO",
    tutorContext:
      "NECO English: comprehension, summary, and essay formats. Oracy and lexis for Nigerian contexts.",
  }),

  // —— Professional licensure ——
  PRO({
    id: "pro-usmle-step1",
    label: "USMLE Step 1",
    description: "Foundational medical sciences",
    subject: "health",
    topic: "USMLE Step 1 — pathology and physiology",
    gradeLevel: "USMLE Step 1",
    tutorContext:
      "USMLE Step 1: systems integration, UWorld-style explanations, and buzzword discipline. Passage-based reasoning first.",
  }),
  PRO({
    id: "pro-bar-exam",
    label: "Bar Exam (UBE)",
    description: "Multistate bar essay and MBE",
    subject: "other",
    topic: "Bar Exam — MBE and essay strategy",
    gradeLevel: "Bar Exam",
    tutorContext:
      "Bar Exam: IRAC/CRAC essays, highly tested MBE rules, and timing. Issue spot before rule dumping.",
  }),
  PRO({
    id: "pro-cpa-far",
    label: "CPA FAR",
    description: "Financial accounting and reporting",
    subject: "business",
    topic: "CPA FAR — financial statements",
    gradeLevel: "CPA",
    tutorContext:
      "CPA FAR: GAAP vs IFRS touchpoints, journal entries, and SIM task approach. Process transactions stepwise.",
  }),
  PRO({
    id: "pro-cfa-l1",
    label: "CFA Level I",
    description: "Ethics, quant, FRA, economics",
    subject: "business",
    topic: "CFA L1 — ethics and financial reporting",
    gradeLevel: "CFA Level I",
    tutorContext:
      "CFA L1: ethics heavily weighted, FRA ratios, and calculator keystrokes. LOS-by-LOS review with practice items.",
  }),

  // —— Additional AP (global catalog; complements study-tracks.ts) ——
  EXAM({
    id: "global-ap-gov",
    label: "AP US Government",
    description: "Institutions, civil liberties, policy",
    subject: "social_studies",
    topic: "AP Gov — institutions and civil liberties",
    gradeLevel: "AP US Government",
    tutorContext:
      "AP Gov: Constitution, federalism, civil rights/liberties, and SCOTUS cases. Link facts to FRQ rubrics.",
  }),
];
