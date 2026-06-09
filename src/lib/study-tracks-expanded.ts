import type { StudyTrack } from "./study-tracks";

const K12 = (t: Omit<StudyTrack, "category">): StudyTrack => ({
  ...t,
  category: "k12",
});

const INT = (t: Omit<StudyTrack, "category">): StudyTrack => ({
  ...t,
  category: "international",
});

const AP = (t: Omit<StudyTrack, "category">): StudyTrack => ({
  ...t,
  category: "ap",
});

const EXAM = (t: Omit<StudyTrack, "category">): StudyTrack => ({
  ...t,
  category: "exam_prep",
});

const PRO = (t: Omit<StudyTrack, "category">): StudyTrack => ({
  ...t,
  category: "professional",
});

const COLLEGE = (
  t: Omit<StudyTrack, "category" | "gradeLevel"> & { gradeLevel?: string }
): StudyTrack => ({
  ...t,
  category: "college",
  gradeLevel: t.gradeLevel ?? "College / university",
});

/** Bulk catalog expansion — OSSD, US HS, AP, exams, certs, college depth. */
export const EXPANDED_STUDY_TRACKS: StudyTrack[] = [
  // —— Ontario OSSD (Grade 9–12 course codes) ——
  INT({
    id: "ca-ossd-math-9",
    label: "OSSD Math Grade 9 (MPM1D)",
    description: "Linear relations, analytic geometry intro",
    subject: "math",
    topic: "MPM1D — principles of mathematics 9",
    gradeLevel: "Ontario Grade 9",
    tutorContext:
      "MPM1D: linear relations, slope, equations of lines, intro quadratics. Ontario achievement chart wording.",
  }),
  INT({
    id: "ca-ossd-math-10",
    label: "OSSD Math Grade 10 (MPM2D)",
    description: "Quadratics, trigonometry, systems",
    subject: "math",
    topic: "MPM2D — principles of mathematics 10",
    gradeLevel: "Ontario Grade 10",
    tutorContext:
      "MPM2D: factoring, quadratic formula, trig ratios, systems. Show full algebraic steps.",
  }),
  INT({
    id: "ca-ossd-functions",
    label: "OSSD Functions (MCR3U)",
    description: "Functions, exponentials, sequences",
    subject: "math",
    topic: "MCR3U — functions grade 11",
    gradeLevel: "Ontario Grade 11",
    tutorContext:
      "MCR3U: function types, transformations, exponentials, sequences/series intro.",
  }),
  INT({
    id: "ca-ossd-functions-apps",
    label: "OSSD Functions & Applications (MCF3M)",
    description: "Quadratics, trig, financial math",
    subject: "math",
    topic: "MCF3M — functions and applications",
    gradeLevel: "Ontario Grade 11",
    tutorContext:
      "MCF3M: quadratics, trig, finance math. College/university pathway prep.",
  }),
  INT({
    id: "ca-ossd-data-mgmt",
    label: "OSSD Data Management (MDM4U)",
    description: "Statistics, probability, permutations",
    subject: "statistics",
    topic: "MDM4U — data management",
    gradeLevel: "Ontario Grade 12",
    tutorContext:
      "MDM4U: counting, probability, statistics, regression. Ontario investigation projects.",
  }),
  INT({
    id: "ca-ossd-physics",
    label: "OSSD Physics (SPH4U)",
    description: "Kinematics, energy, fields, modern",
    subject: "science",
    topic: "SPH4U — physics grade 12",
    gradeLevel: "Ontario Grade 12",
    tutorContext:
      "SPH4U: kinematics, forces, energy, fields, modern physics intro. Lab report format.",
  }),
  INT({
    id: "ca-ossd-physics-11",
    label: "OSSD Physics (SPH3U)",
    description: "Motion, forces, energy, waves",
    subject: "science",
    topic: "SPH3U — physics grade 11",
    gradeLevel: "Ontario Grade 11",
    tutorContext:
      "SPH3U: motion graphs, Newton's laws, energy, waves. Connect math to physical meaning.",
  }),
  INT({
    id: "ca-ossd-biology-11",
    label: "OSSD Biology (SBI3U)",
    description: "Diversity, genetics, evolution",
    subject: "science",
    topic: "SBI3U — biology grade 11",
    gradeLevel: "Ontario Grade 11",
    tutorContext:
      "SBI3U: biodiversity, genetics, evolution. Diagrams and Ontario lab skills.",
  }),
  INT({
    id: "ca-ossd-chemistry-11",
    label: "OSSD Chemistry (SCH3U)",
    description: "Matter, reactions, solutions, gases",
    subject: "science",
    topic: "SCH3U — chemistry grade 11",
    gradeLevel: "Ontario Grade 11",
    tutorContext:
      "SCH3U: stoichiometry, bonding, solutions, gases. ICE tables and unit analysis.",
  }),
  INT({
    id: "ca-ossd-science-9",
    label: "OSSD Science Grade 9 (SNC1D)",
    description: "Biology, chemistry, physics, earth",
    subject: "science",
    topic: "SNC1D — integrated science 9",
    gradeLevel: "Ontario Grade 9",
    tutorContext:
      "SNC1D: cells, atoms, electricity, ecology. Inquiry-based Ontario curriculum.",
  }),
  INT({
    id: "ca-ossd-science-10",
    label: "OSSD Science Grade 10 (SNC2D)",
    description: "Chemistry, biology, physics, climate",
    subject: "science",
    topic: "SNC2D — integrated science 10",
    gradeLevel: "Ontario Grade 10",
    tutorContext:
      "SNC2D: chemical reactions, climate, optics, biology systems. Science fair style reasoning.",
  }),
  INT({
    id: "ca-ossd-english-9",
    label: "OSSD English Grade 9 (ENG1D)",
    description: "Reading, writing, oral communication",
    subject: "english",
    topic: "ENG1D — English grade 9",
    gradeLevel: "Ontario Grade 9",
    tutorContext:
      "ENG1D: paragraph structure, literary devices, oral presentations. Ontario media literacy.",
  }),
  INT({
    id: "ca-ossd-english-10",
    label: "OSSD English Grade 10 (ENG2D)",
    description: "Essay writing, novel study, media",
    subject: "english",
    topic: "ENG2D — English grade 10",
    gradeLevel: "Ontario Grade 10",
    tutorContext:
      "ENG2D: thesis paragraphs, novel analysis, persuasive writing. Achievement chart levels.",
  }),
  INT({
    id: "ca-ossd-english-11",
    label: "OSSD English Grade 11 (ENG3U)",
    description: "Critical literacy, essay, presentation",
    subject: "english",
    topic: "ENG3U — English grade 11",
    gradeLevel: "Ontario Grade 11",
    tutorContext:
      "ENG3U: critical analysis, essay organization, oral communication. University prep.",
  }),
  INT({
    id: "ca-ossd-canadian-history",
    label: "OSSD Canadian History (CHC2D)",
    description: "1914–present, identity, citizenship",
    subject: "history",
    topic: "CHC2D — Canadian history since 1914",
    gradeLevel: "Ontario Grade 10",
    tutorContext:
      "CHC2D: WWI–present, Canadian identity, primary sources. Historical thinking concepts.",
  }),
  INT({
    id: "ca-ossd-geography",
    label: "OSSD Canadian Geography (CGC1D)",
    description: "Physical and human geography of Canada",
    subject: "geography",
    topic: "CGC1D — issues in Canadian geography",
    gradeLevel: "Ontario Grade 9",
    tutorContext:
      "CGC1D: regions, resources, sustainability, GIS basics. Map skills and case studies.",
  }),
  INT({
    id: "ca-ossd-civics",
    label: "OSSD Civics (CHV2O)",
    description: "Citizenship, government, rights",
    subject: "social_studies",
    topic: "CHV2O — civics and citizenship",
    gradeLevel: "Ontario Grade 10",
    tutorContext:
      "CHV2O: Canadian government, rights/responsibilities, active citizenship.",
  }),
  INT({
    id: "ca-ossd-law",
    label: "OSSD Law (CLN4U)",
    description: "Canadian legal systems and rights",
    subject: "social_studies",
    topic: "CLN4U — Canadian and international law",
    gradeLevel: "Ontario Grade 12",
    tutorContext:
      "CLN4U: Charter, criminal/civil law, international law. Case analysis and legal reasoning.",
  }),
  INT({
    id: "ca-ossd-world-history",
    label: "OSSD World History (CHY4U)",
    description: "15th century to present",
    subject: "history",
    topic: "CHY4U — world history since the 15th century",
    gradeLevel: "Ontario Grade 12",
    tutorContext:
      "CHY4U: global themes, cause/consequence, historiography. Essay planning for university.",
  }),

  // —— US high school diploma (expanded core) ——
  K12({
    id: "us-hs-geometry",
    label: "US High School Geometry",
    description: "Proofs, similarity, circles, coordinate",
    subject: "math",
    topic: "US HS Geometry — proofs and measurement",
    gradeLevel: "Grades 9–10",
    tutorContext:
      "HS Geometry: two-column proofs, triangle congruence, circles, coordinate geometry. Common Core standards.",
  }),
  K12({
    id: "us-hs-algebra-2",
    label: "US High School Algebra II",
    description: "Polynomials, exponentials, logarithms",
    subject: "math",
    topic: "US HS Algebra II — functions and equations",
    gradeLevel: "Grades 10–11",
    tutorContext:
      "Algebra II: polynomials, rational functions, exponentials/logs, sequences. SAT/ACT overlap.",
  }),
  K12({
    id: "us-hs-precalc",
    label: "US High School Precalculus",
    description: "Trig, vectors, limits intro",
    subject: "math",
    topic: "US HS Precalc — trig and advanced functions",
    gradeLevel: "Grades 11–12",
    tutorContext:
      "Precalc: unit circle, trig identities, conics, limits intro. Bridge to AP Calc.",
  }),
  K12({
    id: "us-hs-chemistry",
    label: "US High School Chemistry",
    description: "Stoichiometry, bonding, reactions",
    subject: "science",
    topic: "US HS Chemistry — atoms and reactions",
    gradeLevel: "Grades 10–12",
    tutorContext:
      "HS Chem: periodic table, bonding, balancing, stoichiometry, acids/bases. Lab-style reasoning.",
  }),
  K12({
    id: "us-hs-physics",
    label: "US High School Physics",
    description: "Mechanics, energy, waves, E&M intro",
    subject: "science",
    topic: "US HS Physics — motion and energy",
    gradeLevel: "Grades 11–12",
    tutorContext:
      "HS Physics: kinematics, forces, energy, waves, circuits intro. Free-body diagrams first.",
  }),
  K12({
    id: "us-hs-world-history",
    label: "US High School World History",
    description: "Global patterns, comparison, causation",
    subject: "history",
    topic: "US HS World History — global themes",
    gradeLevel: "Grades 9–12",
    tutorContext:
      "World History: comparison, causation, continuity/change. Document-based short answers.",
  }),
  K12({
    id: "us-hs-civics",
    label: "US High School Civics / Government",
    description: "Constitution, branches, civil rights",
    subject: "social_studies",
    topic: "US HS Civics — government and citizenship",
    gradeLevel: "Grades 9–12",
    tutorContext:
      "Civics: Constitution, federalism, elections, civil rights. Connect to current events carefully.",
  }),
  K12({
    id: "us-hs-economics",
    label: "US High School Economics",
    description: "Micro, macro, personal finance",
    subject: "economics",
    topic: "US HS Economics — markets and policy",
    gradeLevel: "Grades 11–12",
    tutorContext:
      "HS Econ: supply/demand, GDP, fiscal/monetary policy, personal finance basics.",
  }),
  K12({
    id: "us-hs-environmental-science",
    label: "US High School Environmental Science",
    description: "Ecosystems, climate, sustainability",
    subject: "science",
    topic: "US HS Environmental Science — systems",
    gradeLevel: "Grades 11–12",
    tutorContext:
      "Env Sci: biomes, cycles, pollution, climate change, policy tradeoffs. Data interpretation.",
  }),

  // —— Additional AP courses ——
  AP({
    id: "ap-precalc",
    label: "AP Precalculus",
    description: "Functions, trig, modeling, limits",
    subject: "math",
    topic: "AP Precalc — functions and modeling",
    gradeLevel: "AP Precalculus",
    tutorContext:
      "AP Precalc: function families, trig, polar, limits intro. FRQ with multiple representations.",
  }),
  AP({
    id: "ap-seminar",
    label: "AP Seminar",
    description: "Research, argument, team projects",
    subject: "english",
    topic: "AP Seminar — research and argument",
    gradeLevel: "AP Seminar",
    tutorContext:
      "AP Seminar: IRR, team presentations, source evaluation, line of reasoning.",
  }),
  AP({
    id: "ap-research",
    label: "AP Research",
    description: "Independent research, methodology",
    subject: "english",
    topic: "AP Research — methodology and paper",
    gradeLevel: "AP Research",
    tutorContext:
      "AP Research: research question, methodology, academic paper structure, defense prep.",
  }),
  AP({
    id: "ap-art-history",
    label: "AP Art History",
    description: "250 works, formal analysis, context",
    subject: "art",
    topic: "AP Art History — global works and analysis",
    gradeLevel: "AP Art History",
    tutorContext:
      "AP Art History: 250 works, formal analysis, comparison essays. Visual description before interpretation.",
  }),
  AP({
    id: "ap-music-theory",
    label: "AP Music Theory",
    description: "Harmony, voice leading, aural skills",
    subject: "music",
    topic: "AP Music Theory — harmony and analysis",
    gradeLevel: "AP Music Theory",
    tutorContext:
      "AP Music Theory: part writing, harmonic analysis, dictation. Roman numerals and voice leading rules.",
  }),
  AP({
    id: "ap-comp-gov",
    label: "AP Comparative Government",
    description: "Political systems, institutions",
    subject: "social_studies",
    topic: "AP Comp Gov — comparative political systems",
    gradeLevel: "AP Comparative Government",
    tutorContext:
      "AP Comp Gov: UK, China, Iran, Mexico, Nigeria. Institution comparison and FRQ structure.",
  }),
  AP({
    id: "ap-african-american-studies",
    label: "AP African American Studies",
    description: "History, culture, literature, politics",
    subject: "history",
    topic: "AP AAS — African American experiences",
    gradeLevel: "AP African American Studies",
    tutorContext:
      "AP AAS: primary sources, cultural analysis, historical argument. Respectful, evidence-based discussion.",
  }),
  AP({
    id: "ap-physics-c-mechanics",
    label: "AP Physics C: Mechanics",
    description: "Calculus-based mechanics",
    subject: "science",
    topic: "AP Physics C Mechanics — calculus kinematics",
    gradeLevel: "AP Physics C",
    tutorContext:
      "AP Phys C Mech: calculus kinematics, rotation, energy. Derivations and free-response setup.",
  }),
  AP({
    id: "ap-physics-c-em",
    label: "AP Physics C: E&M",
    description: "Calculus-based electricity & magnetism",
    subject: "science",
    topic: "AP Physics C E&M — fields and circuits",
    gradeLevel: "AP Physics C",
    tutorContext:
      "AP Phys C E&M: Gauss, Ampère, circuits, Maxwell. Integrals with physical meaning.",
  }),

  // —— More standardized tests & admissions ——
  EXAM({
    id: "psat",
    label: "PSAT / NMSQT",
    description: "SAT preview, National Merit prep",
    subject: "math",
    topic: "PSAT — math and reading/writing",
    gradeLevel: "PSAT",
    tutorContext:
      "PSAT: SAT-style questions at slightly easier difficulty. Time management and NMSQT cutoff awareness.",
  }),
  EXAM({
    id: "shsat",
    label: "SHSAT (NYC)",
    description: "Specialized high school admission",
    subject: "math",
    topic: "SHSAT — math and ELA reasoning",
    gradeLevel: "SHSAT",
    tutorContext:
      "SHSAT: scrambled paragraphs, logical reasoning, math without calculator. NYC specialized school format.",
  }),
  EXAM({
    id: "isee-upper",
    label: "ISEE Upper Level",
    description: "Independent school entrance exam",
    subject: "math",
    topic: "ISEE Upper — quantitative and verbal",
    gradeLevel: "ISEE Upper",
    tutorContext:
      "ISEE Upper: synonyms, sentence completion, quantitative reasoning, reading comp.",
  }),
  EXAM({
    id: "hspt",
    label: "HSPT",
    description: "Catholic high school placement test",
    subject: "math",
    topic: "HSPT — math, language, reading",
    gradeLevel: "HSPT",
    tutorContext:
      "HSPT: math, language, reading, verbal skills. Timed sections and Catholic school admissions context.",
  }),
  EXAM({
    id: "nclex-pn",
    label: "NCLEX-PN",
    description: "Practical/vocational nursing licensure",
    subject: "health",
    topic: "NCLEX-PN — nursing fundamentals",
    gradeLevel: "NCLEX-PN",
    tutorContext:
      "NCLEX-PN: safety, prioritization, basic pharmacology. Clinical judgment framework.",
  }),
  EXAM({
    id: "usmle-step2-ck",
    label: "USMLE Step 2 CK",
    description: "Clinical knowledge, diagnosis",
    subject: "health",
    topic: "Step 2 CK — clinical diagnosis",
    gradeLevel: "Medical school",
    tutorContext:
      "Step 2 CK: next best step, diagnosis, management. UWorld-style vignette reasoning.",
  }),
  EXAM({
    id: "comlex-level1",
    label: "COMLEX Level 1",
    description: "Osteopathic medical sciences",
    subject: "health",
    topic: "COMLEX L1 — OMM and basic sciences",
    gradeLevel: "Medical school",
    tutorContext:
      "COMLEX L1: basic sciences plus OMM concepts. Systems integration like Step 1.",
  }),
  EXAM({
    id: "bar-exam-mbe",
    label: "Bar Exam MBE",
    description: "Multistate bar multiple choice",
    subject: "other",
    topic: "Bar MBE — highly tested rules",
    gradeLevel: "Bar Exam",
    tutorContext:
      "MBE: contracts, torts, crim law/procedure, con law, evidence, property. Rule + fact pattern matching.",
  }),
  EXAM({
    id: "praxis-core",
    label: "Praxis Core",
    description: "Teacher certification basics",
    subject: "english",
    topic: "Praxis Core — reading, writing, math",
    gradeLevel: "Praxis",
    tutorContext:
      "Praxis Core: academic skills for teacher candidates. Essay structure and math fundamentals.",
  }),
  EXAM({
    id: "ati-teas",
    label: "ATI TEAS",
    description: "Nursing school admission exam",
    subject: "health",
    topic: "TEAS — reading, math, science, English",
    gradeLevel: "TEAS",
    tutorContext:
      "TEAS: anatomy/physiology basics, chemistry, math, reading comp. Nursing program admission.",
  }),
  EXAM({
    id: "naplex",
    label: "NAPLEX",
    description: "Pharmacy licensure exam",
    subject: "health",
    topic: "NAPLEX — pharmacotherapy",
    gradeLevel: "Pharmacy",
    tutorContext:
      "NAPLEX: drug mechanisms, interactions, calculations, patient safety. Clinical scenario reasoning.",
  }),
  EXAM({
    id: "fe-exam",
    label: "FE Exam (EIT)",
    description: "Fundamentals of engineering",
    subject: "engineering",
    topic: "FE — engineering fundamentals",
    gradeLevel: "FE Exam",
    tutorContext:
      "FE: math, statics, circuits, thermo, ethics. NCEES handbook-style problems.",
  }),
  EXAM({
    id: "series-7",
    label: "Series 7",
    description: "General securities representative",
    subject: "business",
    topic: "Series 7 — securities and regulations",
    gradeLevel: "FINRA",
    tutorContext:
      "Series 7: products, regulations, suitability. Eliminate wrong answers with regulatory logic.",
  }),
  EXAM({
    id: "real-estate-license",
    label: "Real Estate License Exam",
    description: "Principles, practice, law",
    subject: "business",
    topic: "Real estate — principles and law",
    gradeLevel: "Real estate",
    tutorContext:
      "Real estate: contracts, financing, fair housing, agency. State-specific when student provides state.",
  }),

  // —— Professional certifications ——
  PRO({
    id: "aws-solutions-architect",
    label: "AWS Solutions Architect",
    description: "SAA-C03 cloud architecture",
    subject: "cs",
    topic: "AWS SAA — cloud architecture",
    gradeLevel: "AWS Certification",
    tutorContext:
      "AWS SAA: VPC, IAM, S3, EC2, RDS, Lambda, well-architected. Scenario-based elimination.",
  }),
  PRO({
    id: "azure-fundamentals",
    label: "Azure Fundamentals (AZ-900)",
    description: "Cloud concepts and Azure services",
    subject: "cs",
    topic: "AZ-900 — Azure fundamentals",
    gradeLevel: "Microsoft Certification",
    tutorContext:
      "AZ-900: cloud models, Azure services, pricing, governance. Entry-level cert vocabulary.",
  }),
  PRO({
    id: "google-cloud-associate",
    label: "Google Cloud Associate",
    description: "GCP core services and operations",
    subject: "cs",
    topic: "GCP ACE — associate cloud engineer",
    gradeLevel: "Google Certification",
    tutorContext:
      "GCP ACE: Compute Engine, GKE, IAM, networking, billing. Hands-on scenario questions.",
  }),
  PRO({
    id: "comptia-a-plus",
    label: "CompTIA A+",
    description: "Hardware, OS, troubleshooting",
    subject: "cs",
    topic: "A+ — hardware and operating systems",
    gradeLevel: "CompTIA",
    tutorContext:
      "A+: hardware, Windows/Linux/macOS, networking basics, troubleshooting methodology.",
  }),
  PRO({
    id: "comptia-network-plus",
    label: "CompTIA Network+",
    description: "Networking concepts and troubleshooting",
    subject: "cs",
    topic: "Network+ — TCP/IP and infrastructure",
    gradeLevel: "CompTIA",
    tutorContext:
      "Network+: OSI/TCP-IP, subnetting, wireless, security basics, troubleshooting.",
  }),
  PRO({
    id: "comptia-security-plus",
    label: "CompTIA Security+",
    description: "Security concepts and best practices",
    subject: "cs",
    topic: "Security+ — threats and controls",
    gradeLevel: "CompTIA",
    tutorContext:
      "Security+: threats, cryptography, identity, risk, incident response. DoD 8570 baseline cert.",
  }),
  PRO({
    id: "cissp",
    label: "CISSP",
    description: "Security architecture and governance",
    subject: "cs",
    topic: "CISSP — security domains",
    gradeLevel: "ISC2",
    tutorContext:
      "CISSP: 8 domains, manager mindset, governance, risk. Think like a CISO on scenario questions.",
  }),
  PRO({
    id: "cpa-reg",
    label: "CPA REG",
    description: "Taxation and business law",
    subject: "business",
    topic: "CPA REG — tax and business law",
    gradeLevel: "CPA",
    tutorContext:
      "CPA REG: individual/corporate tax, business law, ethics. Process transactions stepwise.",
  }),
  PRO({
    id: "cpa-aud",
    label: "CPA AUD",
    description: "Auditing and attestation",
    subject: "business",
    topic: "CPA AUD — audit procedures",
    gradeLevel: "CPA",
    tutorContext:
      "CPA AUD: audit risk, internal control, evidence, reports. Professional skepticism mindset.",
  }),
  PRO({
    id: "cfa-level2",
    label: "CFA Level II",
    description: "Asset valuation, item sets",
    subject: "business",
    topic: "CFA L2 — valuation item sets",
    gradeLevel: "CFA Level II",
    tutorContext:
      "CFA L2: vignette item sets, equity/fixed income valuation, ethics. LOS depth over L1.",
  }),
  PRO({
    id: "pmp-agile",
    label: "PMI-ACP (Agile)",
    description: "Agile principles and practices",
    subject: "business",
    topic: "PMI-ACP — agile project management",
    gradeLevel: "PMI",
    tutorContext:
      "PMI-ACP: Scrum, Kanban, XP, agile metrics. Situational agile leadership questions.",
  }),
  PRO({
    id: "six-sigma-green-belt",
    label: "Six Sigma Green Belt",
    description: "DMAIC, statistics, process improvement",
    subject: "business",
    topic: "Six Sigma — DMAIC and tools",
    gradeLevel: "Six Sigma",
    tutorContext:
      "Green Belt: DMAIC, control charts, hypothesis tests, root cause. Manufacturing and service contexts.",
  }),

  // —— More international exams ——
  INT({
    id: "kr-suneung",
    label: "CSAT / Suneung (Korea)",
    description: "Korean college entrance exam",
    subject: "math",
    topic: "Suneung — Korean CSAT math",
    gradeLevel: "CSAT",
    tutorContext:
      "Suneung: killer math, time pressure, common traps. Korean exam culture and scoring awareness.",
  }),
  INT({
    id: "jp-eju",
    label: "EJU (Japan)",
    description: "Examination for Japanese university",
    subject: "math",
    topic: "EJU — Japanese university entrance",
    gradeLevel: "EJU",
    tutorContext:
      "EJU: Japanese, math, science, Japan/world. Bilingual scaffolding for international students.",
  }),
  INT({
    id: "ie-leaving-cert",
    label: "Irish Leaving Certificate",
    description: "Higher/Ordinary level subjects",
    subject: "math",
    topic: "Leaving Cert — higher level math",
    gradeLevel: "Leaving Cert",
    tutorContext:
      "Leaving Cert: HL math, English, sciences. CAO points and marking scheme awareness.",
  }),
  INT({
    id: "za-matric",
    label: "South African Matric",
    description: "NSC final exams",
    subject: "math",
    topic: "Matric — NSC mathematics",
    gradeLevel: "Matric",
    tutorContext:
      "Matric NSC: past papers, IEB vs DBE variants, show-all-working culture.",
  }),
  INT({
    id: "pk-fsc",
    label: "Pakistan FSc / Intermediate",
    description: "Pre-medical and pre-engineering",
    subject: "science",
    topic: "FSc — intermediate sciences",
    gradeLevel: "FSc",
    tutorContext:
      "FSc: physics, chemistry, biology/math for intermediate board exams. Punjab/Sindh board patterns.",
  }),
  INT({
    id: "bd-hsc",
    label: "Bangladesh HSC",
    description: "Higher secondary certificate",
    subject: "science",
    topic: "HSC — science group",
    gradeLevel: "HSC",
    tutorContext:
      "HSC: physics, chemistry, biology/math. Board exam style and creative questions.",
  }),
  INT({
    id: "ae-emsat",
    label: "EmSAT (UAE)",
    description: "UAE standardized achievement tests",
    subject: "math",
    topic: "EmSAT — achieve math",
    gradeLevel: "EmSAT",
    tutorContext:
      "EmSAT Achieve: math, English, physics, chemistry for UAE university admission.",
  }),
  INT({
    id: "sa-qiyas",
    label: "Qiyas / GAT (Saudi Arabia)",
    description: "General aptitude test",
    subject: "math",
    topic: "Qiyas GAT — quantitative reasoning",
    gradeLevel: "Qiyas",
    tutorContext:
      "GAT/Qiyas: verbal and quantitative sections for Saudi university admission.",
  }),
  INT({
    id: "il-bagrut",
    label: "Bagrut (Israel)",
    description: "Matriculation exams",
    subject: "math",
    topic: "Bagrut — mathematics units",
    gradeLevel: "Bagrut",
    tutorContext:
      "Bagrut: 3/4/5 unit math, Hebrew terminology support, past moed exams.",
  }),
  INT({
    id: "ph-ucat",
    label: "UPCAT (Philippines)",
    description: "University of the Philippines admission",
    subject: "math",
    topic: "UPCAT — aptitude test prep",
    gradeLevel: "UPCAT",
    tutorContext:
      "UPCAT: language, math, science, abstract reasoning. Highly competitive UP admission.",
  }),

  // —— College depth (upper-level & specialized) ——
  COLLEGE({
    id: "college-abstract-algebra",
    label: "Abstract Algebra",
    description: "Groups, rings, fields",
    subject: "math",
    topic: "Abstract algebra — groups and rings",
    gradeLevel: "Upper-level undergraduate",
    tutorContext:
      "Abstract algebra: group axioms, homomorphisms, rings, fields. Proof writing with examples first.",
  }),
  COLLEGE({
    id: "college-number-theory",
    label: "Number Theory",
    description: "Divisors, congruences, crypto intro",
    subject: "math",
    topic: "Number theory — primes and congruences",
    gradeLevel: "Upper-level undergraduate",
    tutorContext:
      "Number theory: divisibility, modular arithmetic, RSA intro. Proof techniques.",
  }),
  COLLEGE({
    id: "college-machine-learning",
    label: "Machine Learning",
    description: "Supervised, unsupervised, evaluation",
    subject: "cs",
    topic: "ML — models and evaluation",
    tutorContext:
      "ML: regression, classification, bias-variance, cross-validation, neural nets intro.",
  }),
  COLLEGE({
    id: "college-artificial-intelligence",
    label: "Artificial Intelligence",
    description: "Search, logic, planning, ML",
    subject: "cs",
    topic: "AI — search and reasoning",
    tutorContext:
      "AI: search algorithms, game trees, logic, planning, ML overlap. Conceptual + pseudocode.",
  }),
  COLLEGE({
    id: "college-compiler-design",
    label: "Compiler Design",
    description: "Lexing, parsing, codegen",
    subject: "cs",
    topic: "Compilers — parsing and optimization",
    tutorContext:
      "Compilers: lexical analysis, parsing, AST, type checking, code generation.",
  }),
  COLLEGE({
    id: "college-computer-graphics",
    label: "Computer Graphics",
    description: "Rendering, transforms, shaders",
    subject: "cs",
    topic: "Graphics — 3D transforms and rendering",
    tutorContext:
      "Graphics: homogeneous coordinates, rasterization, lighting, shader pipeline basics.",
  }),
  COLLEGE({
    id: "college-bioinformatics",
    label: "Bioinformatics",
    description: "Sequences, alignment, genomics",
    subject: "science",
    topic: "Bioinformatics — sequence analysis",
    tutorContext:
      "Bioinformatics: BLAST, alignment, phylogenetics, genomics pipelines.",
  }),
  COLLEGE({
    id: "college-genetics",
    label: "Genetics",
    description: "Mendelian, molecular, population",
    subject: "science",
    topic: "Genetics — inheritance and molecular",
    tutorContext:
      "Genetics: Punnett squares, linkage, gene regulation, population genetics.",
  }),
  COLLEGE({
    id: "college-ecology",
    label: "Ecology",
    description: "Populations, communities, ecosystems",
    subject: "science",
    topic: "Ecology — populations and ecosystems",
    tutorContext:
      "Ecology: population models, community interactions, biogeochemical cycles.",
  }),
  COLLEGE({
    id: "college-geology",
    label: "Geology / Earth Science",
    description: "Rocks, plate tectonics, resources",
    subject: "science",
    topic: "Geology — Earth systems",
    tutorContext:
      "Geology: minerals, plate tectonics, geologic time, natural hazards.",
  }),
  COLLEGE({
    id: "college-thermodynamics",
    label: "Engineering Thermodynamics",
    description: "Laws, cycles, entropy",
    subject: "engineering",
    topic: "Thermodynamics — laws and cycles",
    tutorContext:
      "Thermo: first/second law, properties, cycles, entropy. System boundaries and sign conventions.",
  }),
  COLLEGE({
    id: "college-fluid-mechanics",
    label: "Fluid Mechanics",
    description: "Statics, dynamics, Bernoulli",
    subject: "engineering",
    topic: "Fluids — statics and dynamics",
    tutorContext:
      "Fluids: pressure, buoyancy, Bernoulli, pipe flow, control volumes.",
  }),
  COLLEGE({
    id: "college-signals-systems",
    label: "Signals & Systems",
    description: "LTI systems, Fourier, Laplace",
    subject: "engineering",
    topic: "Signals — LTI and transforms",
    tutorContext:
      "Signals: convolution, Fourier/Laplace, Bode plots, sampling.",
  }),
  COLLEGE({
    id: "college-control-systems",
    label: "Control Systems",
    description: "Feedback, stability, PID",
    subject: "engineering",
    topic: "Controls — feedback and stability",
    tutorContext:
      "Controls: block diagrams, transfer functions, root locus, Nyquist, PID tuning.",
  }),
  COLLEGE({
    id: "college-international-relations",
    label: "International Relations",
    description: "Theories, security, institutions",
    subject: "social_studies",
    topic: "IR — theories and global politics",
    tutorContext:
      "IR: realism, liberalism, constructivism, security dilemmas, IOs.",
  }),
  COLLEGE({
    id: "college-criminal-justice",
    label: "Criminal Justice",
    description: "Courts, policing, corrections",
    subject: "social_studies",
    topic: "Criminal justice — systems and policy",
    tutorContext:
      "CJ: due process, policing models, sentencing, reform debates with evidence.",
  }),
  COLLEGE({
    id: "college-creative-writing",
    label: "Creative Writing",
    description: "Fiction, poetry, workshop craft",
    subject: "english",
    topic: "Creative writing — craft and revision",
    tutorContext:
      "Creative writing: scene, voice, revision, workshop feedback. Show don't tell with examples.",
  }),
  COLLEGE({
    id: "college-public-speaking",
    label: "Public Speaking",
    description: "Structure, delivery, persuasion",
    subject: "english",
    topic: "Public speaking — rhetoric and delivery",
    tutorContext:
      "Public speaking: outline, hooks, evidence, delivery tips, anxiety management.",
  }),
  COLLEGE({
    id: "college-film-studies",
    label: "Film Studies",
    description: "Mise-en-scène, editing, genre",
    subject: "art",
    topic: "Film — analysis and history",
    tutorContext:
      "Film studies: shot composition, editing, sound, genre, auteur theory.",
  }),
  COLLEGE({
    id: "college-religion",
    label: "World Religions",
    description: "Beliefs, texts, practices",
    subject: "philosophy",
    topic: "Religion — comparative traditions",
    tutorContext:
      "World religions: respectful comparison, primary texts, historical context.",
  }),

  // —— More languages ——
  {
    id: "lang-mandarin",
    category: "languages",
    label: "Mandarin Chinese",
    description: "HSK prep, tones, characters",
    subject: "languages",
    topic: "Mandarin — tones and HSK vocabulary",
    gradeLevel: "HSK",
    tutorContext:
      "Mandarin: pinyin, tones, basic characters, HSK grammar patterns. Romanization with characters.",
  },
  {
    id: "lang-german",
    category: "languages",
    label: "German",
    description: "Grammar, cases, conversation",
    subject: "languages",
    topic: "German — grammar and conversation",
    gradeLevel: "High school / college",
    tutorContext:
      "German: cases, verb position, conversation prompts. Goethe/DSH awareness when relevant.",
  },
  {
    id: "lang-japanese",
    category: "languages",
    label: "Japanese",
    description: "JLPT prep, kanji, grammar",
    subject: "languages",
    topic: "Japanese — JLPT grammar and kanji",
    gradeLevel: "JLPT",
    tutorContext:
      "Japanese: hiragana/katakana, N5–N2 grammar, kanji radicals, polite forms.",
  },
  {
    id: "lang-korean",
    category: "languages",
    label: "Korean",
    description: "Hangul, TOPIK, conversation",
    subject: "languages",
    topic: "Korean — TOPIK and conversation",
    gradeLevel: "TOPIK",
    tutorContext:
      "Korean: hangul, honorifics, TOPIK reading/listening strategies.",
  },
  {
    id: "lang-arabic",
    category: "languages",
    label: "Arabic",
    description: "MSA, script, conversation",
    subject: "languages",
    topic: "Arabic — Modern Standard Arabic",
    gradeLevel: "High school / college",
    tutorContext:
      "Arabic: script, root patterns, MSA grammar, dialect awareness when student specifies region.",
  },
  {
    id: "lang-hindi",
    category: "languages",
    label: "Hindi",
    description: "Devanagari, grammar, conversation",
    subject: "languages",
    topic: "Hindi — grammar and Devanagari",
    gradeLevel: "High school / college",
    tutorContext:
      "Hindi: Devanagari, postpositions, verb conjugation, conversational drills.",
  },
  {
    id: "lang-latin",
    category: "languages",
    label: "Latin",
    description: "Grammar, translation, AP Latin",
    subject: "languages",
    topic: "Latin — grammar and translation",
    gradeLevel: "High school / college",
    tutorContext:
      "Latin: declensions, conjugations, sight translation, AP Caesar/Vergil when relevant.",
  },
  {
    id: "lang-italian",
    category: "languages",
    label: "Italian",
    description: "Grammar, conversation, CILS prep",
    subject: "languages",
    topic: "Italian — grammar and conversation",
    gradeLevel: "High school / college",
    tutorContext:
      "Italian: verb conjugation, conversation, CILS/CELI exam formats.",
  },
  {
    id: "lang-portuguese",
    category: "languages",
    label: "Portuguese",
    description: "Brazilian/European, grammar, conversation",
    subject: "languages",
    topic: "Portuguese — grammar and conversation",
    gradeLevel: "High school / college",
    tutorContext:
      "Portuguese: PT-BR vs PT-PT variants, verb tenses, CAPLE/Celpe-Bras awareness.",
  },
];
