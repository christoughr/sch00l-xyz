import type { StudyTrack } from "./study-tracks";

const INT = (t: Omit<StudyTrack, "category">): StudyTrack => ({
  ...t,
  category: "international",
});

const EXAM = (t: Omit<StudyTrack, "category">): StudyTrack => ({
  ...t,
  category: "exam_prep",
});

const K12 = (t: Omit<StudyTrack, "category">): StudyTrack => ({
  ...t,
  category: "k12",
});

/** Worldwide curricula & exams — regional depth beyond study-tracks-global.ts */
export const WORLDWIDE_STUDY_TRACKS: StudyTrack[] = [
  // —— United Kingdom (more subjects) ——
  INT({ id: "uk-gcse-english-lit", label: "GCSE English Literature", description: "Shakespeare, poetry, prose", subject: "english", topic: "GCSE English Lit — analysis", gradeLevel: "GCSE", tutorContext: "GCSE Lit: AO1–AO3, context, quotations. Unseen poetry and anthology comparison." }),
  INT({ id: "uk-gcse-history", label: "GCSE History", description: "Period studies, thematic", subject: "history", topic: "GCSE History — source analysis", gradeLevel: "GCSE", tutorContext: "GCSE History: source utility, narrative accounts, 16-mark essays." }),
  INT({ id: "uk-gcse-geography", label: "GCSE Geography", description: "Physical and human geography", subject: "geography", topic: "GCSE Geography — case studies", gradeLevel: "GCSE", tutorContext: "GCSE Geography: case studies, 9-mark answers, fieldwork skills." }),
  INT({ id: "uk-gcse-computer-science", label: "GCSE Computer Science", description: "Algorithms, programming, data", subject: "cs", topic: "GCSE CS — algorithms and Python", gradeLevel: "GCSE", tutorContext: "GCSE CS: pseudocode, trace tables, SQL, ethical issues." }),
  INT({ id: "uk-alevel-english", label: "A-Level English Literature", description: "Comparative coursework, critics", subject: "english", topic: "A-Level English Lit — comparative essays", gradeLevel: "A-Level", tutorContext: "A-Level Lit: AO criteria, critics, comparative structure." }),
  INT({ id: "uk-alevel-history", label: "A-Level History", description: "Breadth and depth studies", subject: "history", topic: "A-Level History — historiography", gradeLevel: "A-Level", tutorContext: "A-Level History: interpretations, primary sources, 25-mark essays." }),
  INT({ id: "uk-alevel-computer-science", label: "A-Level Computer Science", description: "OOP, algorithms, Turing", subject: "cs", topic: "A-Level CS — algorithms and theory", gradeLevel: "A-Level", tutorContext: "A-Level CS: Big-O, Dijkstra, finite state machines, NEA planning." }),
  INT({ id: "uk-alevel-psychology", label: "A-Level Psychology", description: "Approaches, biopsychology, issues", subject: "psychology", topic: "A-Level Psychology — research methods", gradeLevel: "A-Level", tutorContext: "A-Level Psych: studies, stats, 16-mark essays with IDA." }),
  INT({ id: "uk-scottish-highers", label: "Scottish Highers", description: "SQA Highers — core subjects", subject: "math", topic: "Scottish Highers — math and sciences", gradeLevel: "Scottish Highers", tutorContext: "SQA Highers: past papers, unit outcomes, CfE wording." }),
  INT({ id: "uk-scottish-advanced-highers", label: "Scottish Advanced Highers", description: "Pre-university depth", subject: "math", topic: "Advanced Highers — university prep", gradeLevel: "Advanced Highers", tutorContext: "Advanced Highers: rigorous proofs, extended responses." }),

  // —— Canada (more provinces) ——
  INT({ id: "ca-alberta-diploma", label: "Alberta Diploma Exams", description: "Math, sciences, social 30-1", subject: "math", topic: "Alberta Diploma — exam prep", gradeLevel: "Alberta Grade 12", tutorContext: "Alberta Diploma: Math 30-1, Chemistry 30, Social 30-1 style." }),
  INT({ id: "ca-quebec-cegep", label: "Quebec CEGEP", description: "Pre-university science/humanities", subject: "math", topic: "CEGEP — calculus and chemistry", gradeLevel: "Quebec CEGEP", tutorContext: "CEGEP: French terminology optional, science/math depth for university." }),
  INT({ id: "ca-manitoba-grade-12", label: "Manitoba Grade 12", description: "Provincial standards", subject: "math", topic: "Manitoba Grade 12 — pre-calculus", gradeLevel: "Manitoba Grade 12", tutorContext: "Manitoba 40S courses: Pre-Cal, ELA, Chemistry." }),

  // —— Australia (more states & subjects) ——
  INT({ id: "au-hsc-chemistry", label: "HSC Chemistry", description: "NSW Year 12 chemistry", subject: "science", topic: "HSC Chemistry — modules", gradeLevel: "HSC", tutorContext: "HSC Chem: module content, 7–9 mark responses, NESA keywords." }),
  INT({ id: "au-hsc-physics", label: "HSC Physics", description: "NSW Year 12 physics", subject: "science", topic: "HSC Physics — modules", gradeLevel: "HSC", tutorContext: "HSC Physics: calculations, module dot-points, practical skills." }),
  INT({ id: "au-hsc-biology", label: "HSC Biology", description: "NSW Year 12 biology", subject: "science", topic: "HSC Biology — modules", gradeLevel: "HSC", tutorContext: "HSC Bio: depth studies, 9-mark extended responses." }),
  INT({ id: "au-vce-english", label: "VCE English", description: "Victorian Year 12 English", subject: "english", topic: "VCE English — text response", gradeLevel: "VCE", tutorContext: "VCE English: text response, language analysis, comparative." }),
  INT({ id: "au-qce-queensland", label: "Queensland QCE", description: "General senior subjects", subject: "math", topic: "QCE — general mathematics", gradeLevel: "QCE", tutorContext: "QCE: general/specialist math, external exam format." }),
  INT({ id: "au-wace", label: "WACE (Western Australia)", description: "ATAR courses WA", subject: "math", topic: "WACE — mathematics methods", gradeLevel: "WACE", tutorContext: "WACE: ATAR courses, SCSA syllabus, exam techniques." }),
  INT({ id: "au-selective-school", label: "Australian Selective School Test", description: "Reading, math, writing, GA", subject: "math", topic: "Selective school — reasoning", gradeLevel: "Selective entry", tutorContext: "Selective test: reading comp, numerical reasoning, persuasive writing." }),

  // —— New Zealand ——
  INT({ id: "nz-ncea-l3-english", label: "NCEA Level 3 English", description: "Externals and internals", subject: "english", topic: "NCEA L3 English — essays", gradeLevel: "NCEA Level 3", tutorContext: "NCEA English: AS91475–91478, excellence depth." }),
  INT({ id: "nz-ncea-l3-science", label: "NCEA Level 3 Sciences", description: "Biology, chemistry, physics", subject: "science", topic: "NCEA L3 Science — standards", gradeLevel: "NCEA Level 3", tutorContext: "NCEA L3 sciences: internal/external standards, merit/excellence." }),

  // —— India (more boards) ——
  EXAM({ id: "in-cbse-10-english", label: "CBSE Class 10 English", description: "Board exam reading and writing", subject: "english", topic: "CBSE Class 10 English", gradeLevel: "CBSE Class 10", tutorContext: "CBSE English: reading, grammar, letter writing, literature." }),
  EXAM({ id: "in-cbse-12-english", label: "CBSE Class 12 English", description: "Core and elective English", subject: "english", topic: "CBSE Class 12 English", gradeLevel: "CBSE Class 12", tutorContext: "CBSE Class 12: flamingo/vistas, long answers, value points." }),
  EXAM({ id: "in-cbse-12-economics", label: "CBSE Class 12 Economics", description: "Micro and macro", subject: "economics", topic: "CBSE Class 12 Economics", gradeLevel: "CBSE Class 12", tutorContext: "CBSE Econ: diagrams, numericals, 6-mark answers." }),
  EXAM({ id: "in-cbse-12-accountancy", label: "CBSE Class 12 Accountancy", description: "Partnership, companies, analysis", subject: "business", topic: "CBSE Accountancy", gradeLevel: "CBSE Class 12", tutorContext: "CBSE Accounts: journal entries, ratios, cash flow." }),
  EXAM({ id: "in-icse-10", label: "ICSE Class 10", description: "CISCE board exam prep", subject: "math", topic: "ICSE Class 10 — board prep", gradeLevel: "ICSE Class 10", tutorContext: "ICSE: rigorous English and math, specimen papers." }),
  EXAM({ id: "in-state-board-maharashtra", label: "Maharashtra HSC", description: "State board Class 12", subject: "math", topic: "Maharashtra HSC — science/commerce", gradeLevel: "Maharashtra HSC", tutorContext: "Maharashtra HSC: PCM/PCB, state syllabus patterns." }),
  EXAM({ id: "in-state-board-tamil-nadu", label: "Tamil Nadu Class 12", description: "State board sciences", subject: "science", topic: "TN Class 12 — board exam", gradeLevel: "Tamil Nadu Class 12", tutorContext: "TN board: volume-wise prep, Tamil/English medium." }),
  EXAM({ id: "in-cuet", label: "CUET (UG)", description: "Common university entrance test", subject: "english", topic: "CUET — domain and language", gradeLevel: "CUET", tutorContext: "CUET UG: domain subjects, general test, NTA format." }),
  EXAM({ id: "in-clat", label: "CLAT", description: "Common law admission test", subject: "english", topic: "CLAT — legal reasoning", gradeLevel: "CLAT", tutorContext: "CLAT: legal reasoning, logical reasoning, current affairs." }),

  // —— China (more) ——
  EXAM({ id: "cn-gaokao-chinese", label: "Gaokao Chinese", description: "Modern reading and writing", subject: "english", topic: "Gaokao 语文 — reading and essays", gradeLevel: "Gaokao", tutorContext: "Gaokao Chinese: classical/modern texts, essay structure." }),
  EXAM({ id: "cn-gaokao-physics", label: "Gaokao Physics", description: "Mechanics, E&M, modern", subject: "science", topic: "Gaokao Physics — problem solving", gradeLevel: "Gaokao", tutorContext: "Gaokao Physics: multi-step problems, common traps." }),
  EXAM({ id: "cn-zhongkao", label: "Zhongkao (中考)", description: "Junior high entrance exam", subject: "math", topic: "Zhongkao — middle school exit", gradeLevel: "Zhongkao", tutorContext: "Zhongkao: comprehensive review grades 7–9." }),

  // —— Japan ——
  EXAM({ id: "jp-university-entrance", label: "Japanese University Entrance", description: "Common test + secondary exams", subject: "math", topic: "Japan entrance — math and English", gradeLevel: "Japan university", tutorContext: "Japan: 共通テスト, secondary exam depth, bilingual support." }),

  // —— Korea ——
  EXAM({ id: "kr-csat-english", label: "CSAT English (Korea)", description: "Korean SAT English section", subject: "english", topic: "Suneung English — reading", gradeLevel: "CSAT", tutorContext: "CSAT English: killer reading, grammar in context, speed." }),

  // —— Southeast Asia ——
  EXAM({ id: "sg-psle", label: "Singapore PSLE", description: "Primary 6 leaving exam", subject: "math", topic: "PSLE — math and science", gradeLevel: "PSLE", tutorContext: "PSLE: heuristic math, science MCQ, English composition." }),
  EXAM({ id: "sg-a-level-h2-chemistry", label: "Singapore A-Level H2 Chemistry", description: "H2 Chemistry", subject: "science", topic: "H2 Chemistry — organic and physical", gradeLevel: "A-Level (SG)", tutorContext: "H2 Chem: SEAB format, structured questions, organic mechanisms." }),
  EXAM({ id: "my-spm", label: "Malaysia SPM", description: "Sijil Pelajaran Malaysia", subject: "math", topic: "SPM — math and sciences", gradeLevel: "SPM", tutorContext: "SPM: Bahasa Malaysia/English, Add Math, Biology, Chemistry." }),
  EXAM({ id: "id-un", label: "Indonesia Ujian Nasional", description: "National high school exam", subject: "math", topic: "UN — Indonesian national exam", gradeLevel: "Indonesia UN", tutorContext: "UN: UTBK/SNBT awareness, national syllabus." }),
  EXAM({ id: "th-onet", label: "Thailand O-NET", description: "National achievement test", subject: "math", topic: "O-NET — Thai national test", gradeLevel: "O-NET", tutorContext: "O-NET: Math 9, English 9, science basics." }),
  EXAM({ id: "vn-national-high-school", label: "Vietnam National High School Exam", description: "University entrance", subject: "math", topic: "Vietnam THPT — exam prep", gradeLevel: "Vietnam THPT", tutorContext: "Vietnam: multiple choice + essay, high difficulty." }),
  EXAM({ id: "ph-let", label: "Philippines LET", description: "Licensure exam for teachers", subject: "other", topic: "LET — professional education", gradeLevel: "LET", tutorContext: "LET: general education, professional education, majorship." }),

  // —— Middle East & North Africa ——
  EXAM({ id: "ae-gcse-equivalent", label: "UAE GCSE/IGCSE Track", description: "British curriculum UAE schools", subject: "math", topic: "UAE British curriculum", gradeLevel: "UAE IGCSE", tutorContext: "UAE British schools: IGCSE + A-Level pathway." }),
  EXAM({ id: "sa-sat-equivalent", label: "Saudi Qudurat / Tahsili", description: "University aptitude Saudi", subject: "math", topic: "Qudurat — aptitude test", gradeLevel: "Saudi aptitude", tutorContext: "Qudurat/Tahsili: verbal and quantitative sections." }),
  EXAM({ id: "eg-thanawya", label: "Egypt Thanawya Amma", description: "General secondary certificate", subject: "math", topic: "Thanawya — secondary exit", gradeLevel: "Thanawya Amma", tutorContext: "Egypt: science/math/languages streams, high stakes." }),
  EXAM({ id: "tr-yks", label: "Turkey YKS", description: "University entrance YKS/TYT/AYT", subject: "math", topic: "YKS — TYT and AYT", gradeLevel: "YKS", tutorContext: "YKS: TYT basics, AYT depth by track (Say/MEA/SÖZ)." }),
  EXAM({ id: "il-psychometric", label: "Israel Psychometric Exam", description: "University admission psychometric", subject: "math", topic: "Psychometric — quant and verbal", gradeLevel: "Psychometric", tutorContext: "Psychometric: Hebrew/English, quant reasoning, English section." }),

  // —— Europe (more) ——
  INT({ id: "de-abitur-english", label: "Abitur Englisch", description: "German upper secondary English", subject: "english", topic: "Abitur English — analysis", gradeLevel: "Abitur", tutorContext: "Abitur Englisch: text analysis, mediation, discussion." }),
  INT({ id: "de-abitur-biology", label: "Abitur Biologie", description: "German upper secondary biology", subject: "science", topic: "Abitur Biology — genetics and ecology", gradeLevel: "Abitur", tutorContext: "Abitur Bio: Zentralabitur topics, experimental design." }),
  INT({ id: "fr-bac-francais", label: "Baccalauréat Français", description: "Première/Terminale French", subject: "english", topic: "Bac Français — commentaire and dissertation", gradeLevel: "Baccalauréat", tutorContext: "Bac Français: commentaire composé, dissertation, oral." }),
  INT({ id: "fr-bac-sciences", label: "Baccalauréat Sciences", description: "Spécialité sciences", subject: "science", topic: "Bac Sciences — spé maths/physique/SVT", gradeLevel: "Baccalauréat", tutorContext: "Bac spé: maths, physique-chimie, SVT depth." }),
  INT({ id: "es-pau-english", label: "PAU Inglés", description: "Spanish selectividad English", subject: "english", topic: "PAU English — reading and writing", gradeLevel: "PAU", tutorContext: "EvAU Inglés: reading comp, writing tasks." }),
  INT({ id: "it-maturita", label: "Italian Maturità", description: "Esame di Stato", subject: "math", topic: "Maturità — written exams", gradeLevel: "Maturità", tutorContext: "Maturità: matematica, italiano, second language." }),
  INT({ id: "nl-vwo", label: "Netherlands VWO", description: "Pre-university track", subject: "math", topic: "VWO — wiskunde B/C", gradeLevel: "VWO", tutorContext: "VWO: wiskunde B/C, centraal examen format." }),
  INT({ id: "pl-matura", label: "Polish Matura", description: "Matura exam", subject: "math", topic: "Matura — mathematics", gradeLevel: "Matura", tutorContext: "Matura: poziom podstawowy/rozszerzony." }),
  INT({ id: "se-gymnasium", label: "Swedish Gymnasium", description: "Upper secondary Sweden", subject: "math", topic: "Gymnasium — matematik", gradeLevel: "Swedish Gymnasium", tutorContext: "Gymnasium: Matematik 1c–5, national exam style." }),
  INT({ id: "no-videregaende", label: "Norwegian Videregående", description: "Upper secondary Norway", subject: "math", topic: "VGS — mathematics", gradeLevel: "Norwegian VGS", tutorContext: "VGS: R1/R2/S1/S2 mathematics pathways." }),

  // —— Latin America (more) ——
  EXAM({ id: "br-vestibular", label: "Brazil Vestibular", description: "University entrance exams", subject: "math", topic: "Vestibular — competitive entrance", gradeLevel: "Vestibular", tutorContext: "Vestibular: Fuvest/Unicamp style, high difficulty." }),
  EXAM({ id: "ar-cbc", label: "Argentina CBC / ingreso", description: "University entrance prep", subject: "math", topic: "Argentina ingreso — algebra", gradeLevel: "Argentina ingreso", tutorContext: "CBC/ingreso: algebra, analisis, fisica intro." }),
  EXAM({ id: "cl-psu-pdt", label: "Chile PAES/PDT", description: "University admission Chile", subject: "math", topic: "PAES — math and reading", gradeLevel: "PAES", tutorContext: "PAES: competencia lectora, matemática M1/M2." }),
  EXAM({ id: "co-icfes", label: "Colombia ICFES Saber 11", description: "National high school exam", subject: "math", topic: "Saber 11 — ICFES", gradeLevel: "Saber 11", tutorContext: "ICFES: matemáticas, lectura crítica, ciencias." }),

  // —— Africa (more) ——
  INT({ id: "af-kcse", label: "Kenya KCSE", description: "Kenya certificate secondary", subject: "math", topic: "KCSE — mathematics", gradeLevel: "KCSE", tutorContext: "KCSE: 8-4-4 syllabus, past papers, show working." }),
  INT({ id: "af-egcse", label: "Zimbabwe ZIMSEC O-Level", description: "ZIMSEC ordinary level", subject: "math", topic: "ZIMSEC O-Level — math", gradeLevel: "ZIMSEC O-Level", tutorContext: "ZIMSEC: O-Level math, sciences, English." }),
  INT({ id: "af-nigeria-jamb", label: "Nigeria JAMB UTME", description: "Joint admissions matriculation", subject: "math", topic: "JAMB UTME — use of English and subjects", gradeLevel: "JAMB", tutorContext: "JAMB: CBT format, Use of English, subject combos." }),

  // —— Cambridge / IB extras ——
  EXAM({ id: "cam-igcse-biology", label: "Cambridge IGCSE Biology", description: "0610 syllabus", subject: "science", topic: "Cambridge IGCSE Biology", gradeLevel: "Cambridge IGCSE", tutorContext: "IGCSE Bio: 0610, structured questions, practical paper." }),
  EXAM({ id: "cam-igcse-chemistry", label: "Cambridge IGCSE Chemistry", description: "0620 syllabus", subject: "science", topic: "Cambridge IGCSE Chemistry", gradeLevel: "Cambridge IGCSE", tutorContext: "IGCSE Chem: 0620, mole calculations, equations." }),
  EXAM({ id: "cam-igcse-physics", label: "Cambridge IGCSE Physics", description: "0625 syllabus", subject: "science", topic: "Cambridge IGCSE Physics", gradeLevel: "Cambridge IGCSE", tutorContext: "IGCSE Physics: 0625, formulas, graph skills." }),
  EXAM({ id: "cam-a-level-biology", label: "Cambridge A-Level Biology", description: "9700 syllabus", subject: "science", topic: "Cambridge A-Level Biology", gradeLevel: "Cambridge A-Level", tutorContext: "A-Level Bio 9700: essay planning, data analysis." }),
  EXAM({ id: "cam-a-level-chemistry", label: "Cambridge A-Level Chemistry", description: "9701 syllabus", subject: "science", topic: "Cambridge A-Level Chemistry", gradeLevel: "Cambridge A-Level", tutorContext: "A-Level Chem 9701: mechanisms, calculations." }),
  EXAM({ id: "cam-a-level-physics", label: "Cambridge A-Level Physics", description: "9702 syllabus", subject: "science", topic: "Cambridge A-Level Physics", gradeLevel: "Cambridge A-Level", tutorContext: "A-Level Physics 9702: derivations, structured questions." }),
  EXAM({ id: "ib-english-b-sl", label: "IB English B SL", description: "Language acquisition SL", subject: "english", topic: "IB English B SL", gradeLevel: "IB SL", tutorContext: "English B SL: themes, writing formats, listening." }),
  EXAM({ id: "ib-business-hl", label: "IB Business Management HL", description: "Case studies and concepts", subject: "business", topic: "IB Business HL", gradeLevel: "IB HL", tutorContext: "IB Business: CUEGIS, case study analysis, IA support." }),
  EXAM({ id: "ib-environmental-hl", label: "IB Environmental Systems HL", description: "Systems and societies", subject: "science", topic: "IB ESS HL", gradeLevel: "IB HL", tutorContext: "IB ESS: systems thinking, case studies, data." }),

  // —— US alternatives & vocational ——
  EXAM({ id: "hiSET", label: "HiSET", description: "High school equivalency test", subject: "math", topic: "HiSET — math and science", gradeLevel: "HiSET", tutorContext: "HiSET: alternative to GED, similar sections." }),
  EXAM({ id: "tasc", label: "TASC", description: "High school equivalency", subject: "math", topic: "TASC — equivalency prep", gradeLevel: "TASC", tutorContext: "TASC: math, reading, writing, science, social studies." }),
  K12({ id: "us-common-core-ela", label: "US Common Core ELA", description: "K–12 English standards", subject: "english", topic: "Common Core ELA — reading and writing", gradeLevel: "US K–12", tutorContext: "CCSS ELA: anchor standards, text complexity, argument writing." }),
  K12({ id: "us-common-core-math", label: "US Common Core Math", description: "K–12 math standards", subject: "math", topic: "Common Core Math — standards practice", gradeLevel: "US K–12", tutorContext: "CCSS Math: practices, coherence across grades." }),
  K12({ id: "us-ngss-science", label: "US NGSS Science", description: "Next generation science standards", subject: "science", topic: "NGSS — phenomena and inquiry", gradeLevel: "US K–12", tutorContext: "NGSS: three-dimensional learning, phenomena, SEPs." }),
  EXAM({ id: "accuplacer", label: "Accuplacer", description: "College placement test", subject: "math", topic: "Accuplacer — math and reading", gradeLevel: "Accuplacer", tutorContext: "Accuplacer: arithmetic, algebra, reading, writing." }),
  EXAM({ id: "clep-college-algebra", label: "CLEP College Algebra", description: "Credit by examination", subject: "math", topic: "CLEP — college algebra", gradeLevel: "CLEP", tutorContext: "CLEP: functions, equations, systems for college credit." }),

  // —— Adult & literacy ——
  EXAM({ id: "adult-basic-education", label: "Adult Basic Education", description: "Reading, math, life skills", subject: "other", topic: "ABE — foundational skills", gradeLevel: "Adult education", tutorContext: "ABE: foundational literacy and numeracy, respectful pacing." }),
  EXAM({ id: "esol-esl-adults", label: "Adult ESOL/ESL", description: "English for speakers of other languages", subject: "languages", topic: "Adult ESOL — practical English", gradeLevel: "Adult ESOL", tutorContext: "Adult ESOL: workplace English, citizenship prep, conversation." }),

  // —— More professional (global) ——
  EXAM({ id: "ielts-general-training-deep", label: "IELTS GT (Immigration)", description: "Migration-focused IELTS", subject: "languages", topic: "IELTS GT — letters and survival English", gradeLevel: "IELTS GT", tutorContext: "IELTS GT: Task 1 letters, practical reading, speaking." }),
  EXAM({ id: "duolingo-english-test", label: "Duolingo English Test", description: "Adaptive online English test", subject: "languages", topic: "DET — adaptive English", gradeLevel: "DET", tutorContext: "DET: adaptive format, literacy, conversation, production." }),
  EXAM({ id: "cambridge-c1-advanced", label: "Cambridge C1 Advanced (CAE)", description: "Advanced English certificate", subject: "languages", topic: "CAE — advanced English", gradeLevel: "CAE", tutorContext: "CAE: use of English, writing, reading, listening." }),
  EXAM({ id: "cambridge-c2-proficiency", label: "Cambridge C2 Proficiency (CPE)", description: "Highest Cambridge English level", subject: "languages", topic: "CPE — proficiency English", gradeLevel: "CPE", tutorContext: "CPE: near-native tasks, nuanced writing." }),
  EXAM({ id: "dele-spanish", label: "DELE Spanish", description: "Diplomas of Spanish as foreign language", subject: "languages", topic: "DELE — Spanish certification", gradeLevel: "DELE", tutorContext: "DELE: A1–C2 levels, Instituto Cervantes format." }),
  EXAM({ id: "delf-french", label: "DELF/DALF French", description: "French language diplomas", subject: "languages", topic: "DELF — French certification", gradeLevel: "DELF", tutorContext: "DELF/DALF: A1–C2, oral/written production rubrics." }),
  EXAM({ id: "hsk-mandarin", label: "HSK Mandarin", description: "Chinese proficiency test", subject: "languages", topic: "HSK — Mandarin levels 1–6", gradeLevel: "HSK", tutorContext: "HSK: characters, listening, reading by level." }),
  EXAM({ id: "jlpt-japanese", label: "JLPT Japanese", description: "Japanese language proficiency", subject: "languages", topic: "JLPT — N5 through N1", gradeLevel: "JLPT", tutorContext: "JLPT: grammar patterns, kanji, reading speed by level." }),
  EXAM({ id: "topik-korean", label: "TOPIK Korean", description: "Test of proficiency in Korean", subject: "languages", topic: "TOPIK — reading and listening", gradeLevel: "TOPIK", tutorContext: "TOPIK: I/II levels, grammar and vocabulary drills." }),
];
