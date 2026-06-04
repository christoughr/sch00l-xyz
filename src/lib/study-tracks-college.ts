import type { StudyTrack } from "./study-tracks";

/** University & college semester courses (tutor + unit outline; content via ingest later). */
const COLLEGE = (t: Omit<StudyTrack, "category" | "gradeLevel"> & { gradeLevel?: string }): StudyTrack => ({
  ...t,
  category: "college",
  gradeLevel: t.gradeLevel ?? "College / university",
});

export const COLLEGE_STUDY_TRACKS: StudyTrack[] = [
  // Mathematics
  COLLEGE({
    id: "college-calc-1",
    label: "Calculus I",
    description: "Limits, derivatives, intro integrals",
    subject: "math",
    topic: "Calculus I — limits and derivatives",
    tutorContext:
      "University Calc I: limits, continuity, derivative rules, applications, intro integration. Rigor with intuition.",
  }),
  COLLEGE({
    id: "college-calc-2",
    label: "Calculus II",
    description: "Integration techniques, series",
    subject: "math",
    topic: "Calculus II — integration techniques and series",
    tutorContext:
      "Calc II: integration techniques, applications, sequences/series. Step-by-step justification.",
  }),
  COLLEGE({
    id: "college-calc-3",
    label: "Calculus III (Multivariable)",
    description: "Partial derivatives, multiple integrals, vectors",
    subject: "math",
    topic: "Multivariable calculus — partial derivatives and integrals",
    tutorContext:
      "Calc III: vectors, partial derivatives, multiple integrals, Green/Stokes intuition.",
  }),
  COLLEGE({
    id: "college-linear-algebra",
    label: "Linear Algebra",
    description: "Matrices, vector spaces, eigenvalues",
    subject: "math",
    topic: "Linear algebra — matrices and vector spaces",
    tutorContext:
      "Linear algebra: row reduction, determinants, eigenvalues, linear transformations.",
  }),
  COLLEGE({
    id: "college-differential-equations",
    label: "Differential Equations",
    description: "ODEs, Laplace, systems",
    subject: "math",
    topic: "Differential equations — ODEs and modeling",
    tutorContext:
      "ODEs: separable, linear, systems, Laplace transforms, modeling with units.",
  }),
  COLLEGE({
    id: "college-discrete-math",
    label: "Discrete Mathematics",
    description: "Logic, combinatorics, graphs",
    subject: "math",
    topic: "Discrete math — proofs, counting, graphs",
    tutorContext:
      "Discrete: logic, sets, induction, combinatorics, graph theory, recurrence.",
  }),
  COLLEGE({
    id: "college-probability",
    label: "Probability",
    description: "Random variables, distributions",
    subject: "statistics",
    topic: "Probability — random variables and distributions",
    tutorContext:
      "Probability: sample spaces, conditional probability, RVs, common distributions.",
  }),
  COLLEGE({
    id: "college-stats-intro",
    label: "Introductory Statistics",
    description: "Inference, regression, design",
    subject: "statistics",
    topic: "Statistics — inference and data analysis",
    tutorContext:
      "Intro stats: descriptive stats, inference, regression, experimental design.",
  }),
  COLLEGE({
    id: "college-real-analysis",
    label: "Real Analysis",
    description: "Epsilon-delta, sequences, continuity",
    subject: "math",
    topic: "Real analysis — rigorous limits and continuity",
    gradeLevel: "Upper-level undergraduate",
    tutorContext:
      "Real analysis: epsilon-delta proofs, completeness, uniform continuity, series.",
  }),

  // Chemistry & life sciences
  COLLEGE({
    id: "college-gen-chem-1",
    label: "General Chemistry I",
    description: "Stoichiometry, bonding, thermochemistry",
    subject: "science",
    topic: "General chemistry I — atoms, bonding, reactions",
    tutorContext:
      "Gen chem I: stoichiometry, periodic trends, Lewis structures, thermochemistry.",
  }),
  COLLEGE({
    id: "college-gen-chem-2",
    label: "General Chemistry II",
    description: "Equilibrium, kinetics, acids/bases",
    subject: "science",
    topic: "General chemistry II — equilibrium and kinetics",
    tutorContext:
      "Gen chem II: equilibrium, acids/bases, kinetics, electrochemistry intro.",
  }),
  COLLEGE({
    id: "college-org-chem",
    label: "Organic Chemistry",
    description: "Mechanisms, synthesis, spectroscopy",
    subject: "science",
    topic: "Organic chemistry — reaction mechanisms",
    tutorContext:
      "Orgo: curved-arrow mechanisms, functional groups, synthesis planning.",
  }),
  COLLEGE({
    id: "college-biochemistry",
    label: "Biochemistry",
    description: "Proteins, metabolism, enzymes",
    subject: "science",
    topic: "Biochemistry — proteins and metabolism",
    tutorContext:
      "Biochem: amino acids, enzymes, central metabolism, regulation pathways.",
  }),
  COLLEGE({
    id: "college-biology-majors",
    label: "Biology for Majors",
    description: "Cell bio, molecular genetics",
    subject: "science",
    topic: "Majors biology — cells and molecular genetics",
    tutorContext:
      "Majors bio: cell structure, metabolism, gene expression, experimental design.",
  }),
  COLLEGE({
    id: "college-anatomy-physiology",
    label: "Anatomy & Physiology",
    description: "Body systems, homeostasis",
    subject: "health",
    topic: "A&P — body systems and homeostasis",
    tutorContext:
      "A&P: structure-function, major organ systems, clinical correlations.",
  }),
  COLLEGE({
    id: "college-microbiology",
    label: "Microbiology",
    description: "Bacteria, viruses, immunity",
    subject: "science",
    topic: "Microbiology — microbes and immunity",
    tutorContext:
      "Micro: prokaryote/eukaryote microbes, growth, immunity, lab methods.",
  }),

  // Physics
  COLLEGE({
    id: "college-physics-1",
    label: "Physics I (Mechanics)",
    description: "Kinematics, forces, energy",
    subject: "science",
    topic: "Physics I — classical mechanics",
    tutorContext:
      "Physics I: kinematics, Newton's laws, energy, momentum, rotation intro.",
  }),
  COLLEGE({
    id: "college-physics-2",
    label: "Physics II (E&M)",
    description: "Electricity, magnetism, circuits",
    subject: "science",
    topic: "Physics II — electricity and magnetism",
    tutorContext:
      "Physics II: Coulomb, fields, potential, circuits, magnetism, induction.",
  }),
  COLLEGE({
    id: "college-physics-modern",
    label: "Modern Physics",
    description: "Relativity, quantum intro",
    subject: "science",
    topic: "Modern physics — relativity and quantum",
    gradeLevel: "Upper-level undergraduate",
    tutorContext:
      "Modern physics: special relativity, quantum models, atomic structure.",
  }),

  // Computer science & engineering
  COLLEGE({
    id: "college-cs-intro",
    label: "Intro to Computer Science",
    description: "Programming, abstraction, data",
    subject: "cs",
    topic: "Intro CS — programming and problem decomposition",
    tutorContext:
      "Intro CS: variables, control flow, functions, basic data structures, debugging.",
  }),
  COLLEGE({
    id: "college-data-structures",
    label: "Data Structures",
    description: "Lists, trees, graphs, hashing",
    subject: "cs",
    topic: "Data structures — ADTs and complexity",
    tutorContext:
      "DS: arrays, linked structures, trees, heaps, graphs, hash tables, Big-O.",
  }),
  COLLEGE({
    id: "college-algorithms",
    label: "Algorithms",
    description: "Sorting, DP, greedy, graphs",
    subject: "cs",
    topic: "Algorithms — design and analysis",
    tutorContext:
      "Algorithms: divide-and-conquer, DP, greedy, graph algorithms, correctness.",
  }),
  COLLEGE({
    id: "college-database-systems",
    label: "Database Systems",
    description: "SQL, normalization, transactions",
    subject: "cs",
    topic: "Databases — relational design and SQL",
    tutorContext:
      "DB: ER modeling, normalization, SQL queries, indexes, transactions.",
  }),
  COLLEGE({
    id: "college-operating-systems",
    label: "Operating Systems",
    description: "Processes, memory, files",
    subject: "cs",
    topic: "Operating systems — processes and memory",
    tutorContext:
      "OS: processes/threads, scheduling, virtual memory, file systems, sync.",
  }),
  COLLEGE({
    id: "college-computer-networks",
    label: "Computer Networks",
    description: "TCP/IP, routing, application layer",
    subject: "cs",
    topic: "Networks — protocols and the Internet",
    tutorContext:
      "Networks: layering, IP, TCP/UDP, HTTP, routing, basic security.",
  }),
  COLLEGE({
    id: "college-software-engineering",
    label: "Software Engineering",
    description: "Requirements, design, testing",
    subject: "cs",
    topic: "Software engineering — design and quality",
    tutorContext:
      "SE: requirements, architecture, testing, Agile, code review habits.",
  }),
  COLLEGE({
    id: "college-circuits",
    label: "Circuits & Electronics",
    description: "Ohm's law, AC, op-amps",
    subject: "engineering",
    topic: "Circuits — analysis and electronics",
    tutorContext:
      "Circuits: KVL/KCL, Thevenin, AC phasors, filters, op-amp basics.",
  }),
  COLLEGE({
    id: "college-engineering-statics",
    label: "Engineering Statics",
    description: "Equilibrium, trusses, friction",
    subject: "engineering",
    topic: "Statics — force equilibrium",
    tutorContext:
      "Statics: free-body diagrams, moments, trusses, friction, centroids.",
  }),

  // Social sciences, business, humanities
  COLLEGE({
    id: "college-psych",
    label: "Intro Psychology",
    description: "Research methods, brain, learning",
    subject: "psychology",
    topic: "Intro psychology — research methods and cognition",
    tutorContext:
      "Intro psych: experiments, brain/behavior, learning, memory.",
  }),
  COLLEGE({
    id: "college-microecon",
    label: "Microeconomics",
    description: "Supply, demand, welfare",
    subject: "economics",
    topic: "Microeconomics — markets and welfare",
    tutorContext:
      "Micro: optimization, equilibrium, welfare, market failure.",
  }),
  COLLEGE({
    id: "college-macroecon",
    label: "Macroeconomics",
    description: "GDP, inflation, policy",
    subject: "economics",
    topic: "Macroeconomics — growth and policy",
    tutorContext:
      "Macro: GDP, unemployment, inflation, fiscal/monetary policy models.",
  }),
  COLLEGE({
    id: "college-accounting",
    label: "Financial Accounting",
    description: "Statements, debits/credits",
    subject: "business",
    topic: "Accounting — financial statements",
    tutorContext:
      "Accounting: journal entries, financial statements, ratios, ethics.",
  }),
  COLLEGE({
    id: "college-finance",
    label: "Corporate Finance",
    description: "Time value, risk, valuation",
    subject: "business",
    topic: "Finance — valuation and capital budgeting",
    tutorContext:
      "Finance: TVM, risk/return, DCF, WACC, capital budgeting.",
  }),
  COLLEGE({
    id: "college-marketing",
    label: "Marketing Principles",
    description: "Segmentation, 4Ps, branding",
    subject: "business",
    topic: "Marketing — strategy and customer value",
    tutorContext:
      "Marketing: STP, 4Ps, branding, metrics, case analysis.",
  }),
  COLLEGE({
    id: "college-management",
    label: "Principles of Management",
    description: "Planning, org behavior, leadership",
    subject: "business",
    topic: "Management — organizations and leadership",
    tutorContext:
      "Management: planning, motivation, teams, leadership, change.",
  }),
  COLLEGE({
    id: "college-sociology",
    label: "Introduction to Sociology",
    description: "Institutions, inequality, research",
    subject: "social_studies",
    topic: "Sociology — society and inequality",
    tutorContext:
      "Sociology: theory, institutions, stratification, research methods.",
  }),
  COLLEGE({
    id: "college-political-science",
    label: "Political Science",
    description: "Institutions, ideology, IR intro",
    subject: "social_studies",
    topic: "Political science — government and policy",
    tutorContext:
      "Poli sci: institutions, elections, policy, comparative/IR basics.",
  }),
  COLLEGE({
    id: "college-us-history",
    label: "U.S. History (Survey)",
    description: "Colonial era to present",
    subject: "history",
    topic: "U.S. history — survey themes",
    tutorContext:
      "US history survey: chronology, causation, primary sources, historiography.",
  }),
  COLLEGE({
    id: "college-world-history",
    label: "World History (Survey)",
    description: "Global patterns, comparison",
    subject: "history",
    topic: "World history — global themes",
    tutorContext:
      "World history: cross-cultural comparison, trade, revolutions, modernity.",
  }),
  COLLEGE({
    id: "college-philosophy",
    label: "Introduction to Philosophy",
    description: "Ethics, epistemology, logic intro",
    subject: "philosophy",
    topic: "Philosophy — ethics and knowledge",
    tutorContext:
      "Philosophy: argument analysis, ethics theories, free will, knowledge.",
  }),
  COLLEGE({
    id: "college-english-comp",
    label: "English Composition",
    description: "Thesis, rhetoric, revision",
    subject: "english",
    topic: "Composition — academic writing",
    tutorContext:
      "Comp: thesis, evidence, organization, citation, revision strategies.",
  }),
  COLLEGE({
    id: "college-literature",
    label: "Introduction to Literature",
    description: "Analysis, genre, context",
    subject: "english",
    topic: "Literature — close reading and analysis",
    tutorContext:
      "Lit: close reading, theme, form, historical/cultural context.",
  }),

  // Health professions
  COLLEGE({
    id: "college-pathophysiology",
    label: "Pathophysiology",
    description: "Disease mechanisms by system",
    subject: "health",
    topic: "Pathophysiology — disease processes",
    tutorContext:
      "Pathophys: system-based disease mechanisms, clinical correlations.",
  }),
  COLLEGE({
    id: "college-pharmacology",
    label: "Pharmacology",
    description: "Drug classes, ADME, safety",
    subject: "health",
    topic: "Pharmacology — drugs and mechanisms",
    tutorContext:
      "Pharm: mechanisms, indications, adverse effects, nursing/med implications.",
  }),
  COLLEGE({
    id: "college-nursing-fundamentals",
    label: "Nursing Fundamentals",
    description: "Assessment, safety, care plans",
    subject: "health",
    topic: "Nursing fundamentals — patient-centered care",
    tutorContext:
      "Nursing: assessment, safety, communication, care planning, ethics.",
  }),

  // Additional STEM / interdisciplinary
  COLLEGE({
    id: "college-environmental-science",
    label: "Environmental Science",
    description: "Ecosystems, climate, policy",
    subject: "science",
    topic: "Environmental science — systems and sustainability",
    tutorContext:
      "Env sci: cycles, biodiversity, pollution, climate, policy tradeoffs.",
  }),
  COLLEGE({
    id: "college-astronomy",
    label: "Astronomy",
    description: "Solar system, stars, cosmology intro",
    subject: "science",
    topic: "Astronomy — the universe",
    tutorContext:
      "Astronomy: scales, orbits, stellar evolution, cosmology basics.",
  }),
  COLLEGE({
    id: "college-anthropology",
    label: "Cultural Anthropology",
    description: "Culture, kinship, fieldwork",
    subject: "social_studies",
    topic: "Anthropology — culture and society",
    tutorContext:
      "Anthropology: ethnography, kinship, religion, globalization, ethics.",
  }),
  COLLEGE({
    id: "college-communications",
    label: "Communications / Media Studies",
    description: "Rhetoric, media literacy",
    subject: "english",
    topic: "Communications — media and persuasion",
    tutorContext:
      "Comm: rhetoric, audience, media literacy, ethics, presentation skills.",
  }),
];
