import type { PracticeTestMeta } from "./practice-engine";

export type BankItem = {
  id: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
  skillTag: string;
  sectionOrd?: number;
};

export const LOCAL_PRACTICE_TESTS: PracticeTestMeta[] = [
  { id: "sat-digital", label: "SAT Digital", examFamily: "SAT", region: "US", durationMinutes: 134, sectionCount: 2 },
  { id: "act", label: "ACT", examFamily: "ACT", region: "US", durationMinutes: 175, sectionCount: 4 },
  { id: "ap-bio-mcq", label: "AP Biology MCQ", examFamily: "AP", region: "US", durationMinutes: 90, sectionCount: 1 },
  { id: "ib-sl-math", label: "IB Math SL", examFamily: "IB", region: "global", durationMinutes: 90, sectionCount: 1 },
  { id: "igcse-math", label: "IGCSE Mathematics", examFamily: "IGCSE", region: "UK/international", durationMinutes: 120, sectionCount: 2 },
  { id: "a-level-math", label: "A-Level Mathematics", examFamily: "A-Level", region: "UK", durationMinutes: 120, sectionCount: 1 },
  { id: "jee-main", label: "JEE Main", examFamily: "JEE", region: "India", durationMinutes: 180, sectionCount: 3 },
  { id: "neet", label: "NEET", examFamily: "NEET", region: "India", durationMinutes: 200, sectionCount: 1 },
  { id: "gaokao-math", label: "Gaokao Mathematics", examFamily: "Gaokao", region: "China", durationMinutes: 120, sectionCount: 1 },
  { id: "mcat-sample", label: "MCAT Sample", examFamily: "MCAT", region: "US/global", durationMinutes: 95, sectionCount: 1 },
  { id: "lsat-sample", label: "LSAT Sample", examFamily: "LSAT", region: "US", durationMinutes: 35, sectionCount: 1 },
  { id: "gmat-quant", label: "GMAT Quant", examFamily: "GMAT", region: "global", durationMinutes: 62, sectionCount: 1 },
  { id: "gre-verbal", label: "GRE Verbal", examFamily: "GRE", region: "global", durationMinutes: 30, sectionCount: 1 },
  { id: "nclex-rn", label: "NCLEX-RN Sample", examFamily: "NCLEX", region: "US", durationMinutes: 60, sectionCount: 1 },
  { id: "hsc-nsw", label: "HSC NSW", examFamily: "HSC", region: "Australia", durationMinutes: 90, sectionCount: 1 },
];

/** Curated MCQ banks — original exam-style items (not licensed official questions). */
const BANKS: Record<string, BankItem[]> = {
  "ap-bio-mcq": [
    { id: "bio-1", prompt: "Which organelle is primarily responsible for ATP synthesis via oxidative phosphorylation?", choices: ["Ribosome", "Mitochondrion", "Golgi apparatus", "Lysosome"], correctIndex: 1, skillTag: "cells" },
    { id: "bio-2", prompt: "A cell placed in a hypertonic solution will most likely:", choices: ["Lyse", "Swell", "Shrink", "Divide immediately"], correctIndex: 2, skillTag: "cells" },
    { id: "bio-3", prompt: "During DNA replication, which enzyme joins Okazaki fragments?", choices: ["Helicase", "Primase", "DNA ligase", "Topoisomerase"], correctIndex: 2, skillTag: "genetics" },
    { id: "bio-4", prompt: "A heterozygous tall pea plant (Tt) is crossed with a homozygous short plant (tt). Expected phenotypic ratio in offspring?", choices: ["All tall", "3 tall : 1 short", "1 tall : 1 short", "All short"], correctIndex: 2, skillTag: "genetics" },
    { id: "bio-5", prompt: "Which process produces gametes with half the chromosome number?", choices: ["Mitosis", "Binary fission", "Meiosis", "Budding"], correctIndex: 2, skillTag: "genetics" },
    { id: "bio-6", prompt: "Natural selection acts directly on:", choices: ["Genotype frequency only", "Phenotype variation", "Mutation rate", "Species number"], correctIndex: 1, skillTag: "evolution" },
    { id: "bio-7", prompt: "Two species occupy similar niches in different regions. This best illustrates:", choices: ["Convergent evolution", "Allopatric speciation context", "Genetic drift only", "Hardy-Weinberg equilibrium"], correctIndex: 1, skillTag: "evolution" },
    { id: "bio-8", prompt: "In a food web, approximately 10% of energy passes to the next trophic level because:", choices: ["Energy is created at each level", "Most energy is lost as heat during metabolism", "Producers store all energy", "Consumers eat 90% of biomass"], correctIndex: 1, skillTag: "ecology" },
    { id: "bio-9", prompt: "Which human activity most directly increases atmospheric CO₂ contributing to climate change?", choices: ["Composting", "Burning fossil fuels", "Planting forests", "Using solar panels"], correctIndex: 1, skillTag: "ecology" },
    { id: "bio-10", prompt: "A enzyme's activity drops sharply above 45°C most likely due to:", choices: ["Increased substrate concentration", "Denaturation of active site", "More ATP production", "DNA replication errors"], correctIndex: 1, skillTag: "cells" },
    { id: "bio-11", prompt: "The central dogma of molecular biology is:", choices: ["Protein → RNA → DNA", "DNA → RNA → Protein", "RNA → DNA → Lipid", "DNA → Protein → RNA"], correctIndex: 1, skillTag: "genetics" },
    { id: "bio-12", prompt: "Hardy-Weinberg equilibrium assumes NO:", choices: ["Large population", "Random mating", "Natural selection", "Equal allele frequencies"], correctIndex: 2, skillTag: "evolution" },
  ],
  "sat-digital": [
    { id: "sat-1", prompt: "If 3x + 7 = 22, what is x?", choices: ["3", "5", "7", "15"], correctIndex: 1, skillTag: "algebra" },
    { id: "sat-2", prompt: "A line has slope 2 and passes through (0, -3). Which is its equation?", choices: ["y = 2x - 3", "y = -3x + 2", "y = x/2 - 3", "y = 2x + 3"], correctIndex: 0, skillTag: "algebra" },
    { id: "sat-3", prompt: "What is 15% of 240?", choices: ["24", "36", "48", "60"], correctIndex: 1, skillTag: "percent" },
    { id: "sat-4", prompt: "If f(x) = x² - 4, what is f(3)?", choices: ["5", "7", "9", "13"], correctIndex: 0, skillTag: "functions" },
    { id: "sat-5", prompt: "A data set has values 2, 4, 4, 7, 9. What is the median?", choices: ["4", "5", "7", "9"], correctIndex: 0, skillTag: "statistics" },
    { id: "sat-6", prompt: "Which sentence uses correct subject-verb agreement?", choices: ["The team are winning.", "The team is winning.", "The team were winning.", "The team have winning."], correctIndex: 1, skillTag: "grammar" },
    { id: "sat-7", prompt: "In context, 'ubiquitous' most nearly means:", choices: ["Rare", "Found everywhere", "Ancient", "Dangerous"], correctIndex: 1, skillTag: "vocabulary" },
    { id: "sat-8", prompt: "A circle has radius 5. Its area is closest to:", choices: ["15.7", "31.4", "78.5", "157"], correctIndex: 2, skillTag: "geometry" },
    { id: "sat-9", prompt: "If |x - 4| = 3, which could be x?", choices: ["1 only", "7 only", "1 or 7", "-1 or 7"], correctIndex: 2, skillTag: "algebra" },
    { id: "sat-10", prompt: "An argument's conclusion is best supported when evidence is:", choices: ["Irrelevant but emotional", "Relevant and sufficient", "Only anecdotal", "Contradictory"], correctIndex: 1, skillTag: "reading" },
  ],
  act: [
    { id: "act-1", prompt: "What is the value of 4² + 3²?", choices: ["7", "12", "25", "49"], correctIndex: 2, skillTag: "pre-algebra" },
    { id: "act-2", prompt: "If a car travels 60 miles in 1.5 hours, its average speed is:", choices: ["30 mph", "40 mph", "45 mph", "90 mph"], correctIndex: 1, skillTag: "rates" },
    { id: "act-3", prompt: "Which fraction is equivalent to 0.375?", choices: ["3/8", "3/4", "5/8", "7/16"], correctIndex: 0, skillTag: "fractions" },
    { id: "act-4", prompt: "In a right triangle, sin(30°) equals:", choices: ["1/2", "√3/2", "1", "√2/2"], correctIndex: 0, skillTag: "trigonometry" },
    { id: "act-5", prompt: "A research study controls variables to:", choices: ["Increase bias", "Isolate cause and effect", "Eliminate the hypothesis", "Guarantee correlation implies causation"], correctIndex: 1, skillTag: "science-reasoning" },
    { id: "act-6", prompt: "Based on a graph showing distance vs time with constant positive slope, the object is:", choices: ["At rest", "Moving at constant speed", "Accelerating", "Decelerating to stop"], correctIndex: 1, skillTag: "science-reasoning" },
    { id: "act-7", prompt: "The main purpose of a control group in an experiment is to:", choices: ["Receive the treatment", "Provide a baseline for comparison", "Increase sample size only", "Eliminate independent variable"], correctIndex: 1, skillTag: "science-reasoning" },
    { id: "act-8", prompt: "If log₁₀(1000) = x, then x =", choices: ["2", "3", "10", "100"], correctIndex: 1, skillTag: "logarithms" },
    { id: "act-9", prompt: "Which transition best shows contrast between two ideas?", choices: ["Furthermore", "However", "Similarly", "Therefore"], correctIndex: 1, skillTag: "english" },
    { id: "act-10", prompt: "The probability of rolling an even number on a fair six-sided die is:", choices: ["1/6", "1/3", "1/2", "2/3"], correctIndex: 2, skillTag: "probability" },
  ],
  "ib-sl-math": [
    { id: "ib-1", prompt: "Solve: 2ˣ = 16", choices: ["2", "3", "4", "8"], correctIndex: 2, skillTag: "exponents" },
    { id: "ib-2", prompt: "The derivative of f(x) = x³ is:", choices: ["3x", "3x²", "x²", "x³/3"], correctIndex: 1, skillTag: "calculus" },
    { id: "ib-3", prompt: "In a geometric sequence with first term 3 and ratio 2, the 4th term is:", choices: ["12", "18", "24", "48"], correctIndex: 2, skillTag: "sequences" },
    { id: "ib-4", prompt: "The discriminant of x² + 4x + 5 = 0 is:", choices: ["-4", "0", "4", "16"], correctIndex: 0, skillTag: "quadratics" },
    { id: "ib-5", prompt: "P(A)=0.4, P(B)=0.5, A and B independent. P(A and B)=", choices: ["0.1", "0.2", "0.45", "0.9"], correctIndex: 1, skillTag: "probability" },
    { id: "ib-6", prompt: "∫2x dx =", choices: ["x² + C", "2x² + C", "x + C", "2 + C"], correctIndex: 0, skillTag: "calculus" },
    { id: "ib-7", prompt: "A triangle has sides 5, 12, 13. It is:", choices: ["Acute", "Right", "Obtuse", "Equilateral"], correctIndex: 1, skillTag: "geometry" },
    { id: "ib-8", prompt: "sin²θ + cos²θ =", choices: ["0", "1", "2", "Depends on θ"], correctIndex: 1, skillTag: "trigonometry" },
  ],
  "igcse-math": [
    { id: "ig-1", prompt: "Expand (x + 3)(x - 2)", choices: ["x² + x - 6", "x² + 5x - 6", "x² - x - 6", "x² + 6"], correctIndex: 0, skillTag: "algebra" },
    { id: "ig-2", prompt: "Write 0.00052 in standard form:", choices: ["5.2 × 10⁻⁴", "52 × 10⁻⁵", "5.2 × 10⁴", "0.52 × 10⁻³"], correctIndex: 0, skillTag: "number" },
    { id: "ig-3", prompt: "Factorise x² - 9", choices: ["(x-3)²", "(x+3)²", "(x-3)(x+3)", "(x-9)(x+1)"], correctIndex: 2, skillTag: "algebra" },
    { id: "ig-4", prompt: "The bearing of B from A is 060°. B is:", choices: ["SW of A", "NE of A", "NW of A", "SE of A"], correctIndex: 1, skillTag: "geometry" },
    { id: "ig-5", prompt: "Mean of 4, 6, 8, 10 is:", choices: ["6", "7", "8", "9"], correctIndex: 1, skillTag: "statistics" },
    { id: "ig-6", prompt: "Solve 5x - 3 = 2x + 9", choices: ["x=2", "x=3", "x=4", "x=6"], correctIndex: 2, skillTag: "algebra" },
    { id: "ig-7", prompt: "Simple interest on $500 at 4% for 3 years is:", choices: ["$20", "$40", "$60", "$620"], correctIndex: 2, skillTag: "finance" },
    { id: "ig-8", prompt: "Volume of a cylinder radius 2, height 5 (use π≈3.14) is closest to:", choices: ["31.4", "62.8", "78.5", "94.2"], correctIndex: 1, skillTag: "mensuration" },
  ],
  "a-level-math": [
    { id: "al-1", prompt: "Differentiate y = ln(x)", choices: ["1/x", "x", "ln(x)", "eˣ"], correctIndex: 0, skillTag: "calculus" },
    { id: "al-2", prompt: "Solve e²ˣ = 5. Take ln both sides: 2x =", choices: ["ln(5)", "5ln(2)", "ln(5)/2", "2ln(5)"], correctIndex: 0, skillTag: "exponentials" },
    { id: "al-3", prompt: "Partial fractions: 1/(x²-1) decomposes to:", choices: ["1/x + 1/(x-1)", "1/2(1/(x-1) - 1/(x+1))", "1/(x-1) - 1/(x+1)", "1/x²"], correctIndex: 1, skillTag: "algebra" },
    { id: "al-4", prompt: "|z|=3 for complex z on a circle centered at origin with radius:", choices: ["√3", "3", "9", "6"], correctIndex: 1, skillTag: "complex" },
    { id: "al-5", prompt: "The Maclaurin series for eˣ starts:", choices: ["1 + x + x²/2! + …", "x - x³/3! + …", "1 - x + x² - …", "x + x² + x³ + …"], correctIndex: 0, skillTag: "series" },
    { id: "al-6", prompt: "∫₁³ (2x) dx =", choices: ["4", "6", "8", "9"], correctIndex: 2, skillTag: "calculus" },
    { id: "al-7", prompt: "If A is 2×3 and B is 3×2, AB is:", choices: ["2×2", "3×3", "2×3", "Undefined"], correctIndex: 0, skillTag: "matrices" },
    { id: "al-8", prompt: "For y = x³ - 3x, stationary points occur when dy/dx =", choices: ["3x² - 3 = 0", "3x - 3 = 0", "x³ = 3", "x = 0 only"], correctIndex: 0, skillTag: "calculus" },
  ],
  "jee-main": [
    { id: "jee-1", prompt: "Dimensional formula of force is:", choices: ["MLT⁻²", "ML²T⁻²", "MLT⁻¹", "M²L²T⁻²"], correctIndex: 0, skillTag: "physics" },
    { id: "jee-2", prompt: "For projectile motion, horizontal velocity component:", choices: ["Increases with time", "Decreases with time", "Remains constant (no air resistance)", "Is always zero"], correctIndex: 2, skillTag: "physics" },
    { id: "jee-3", prompt: "Molality (m) is defined as moles of solute per:", choices: ["Liter of solution", "Kg of solvent", "Kg of solution", "Mole of solvent"], correctIndex: 1, skillTag: "chemistry" },
    { id: "jee-4", prompt: "Integration ∫cos(x) dx =", choices: ["sin(x) + C", "-sin(x) + C", "cos(x) + C", "-cos(x) + C"], correctIndex: 0, skillTag: "math" },
    { id: "jee-5", prompt: "Snell's law relates:", choices: ["Pressure and volume", "Angles of incidence and refraction", "Charge and field", "Work and energy only"], correctIndex: 1, skillTag: "physics" },
    { id: "jee-6", prompt: "Hybridization of carbon in methane (CH₄) is:", choices: ["sp", "sp²", "sp³", "sp³d"], correctIndex: 2, skillTag: "chemistry" },
    { id: "jee-7", prompt: "If det(A)=0 for a square matrix A, A is:", choices: ["Always identity", "Singular (non-invertible)", "Orthogonal", "Diagonal only"], correctIndex: 1, skillTag: "math" },
    { id: "jee-8", prompt: "First law of thermodynamics is conservation of:", choices: ["Momentum", "Energy", "Charge", "Mass number"], correctIndex: 1, skillTag: "physics" },
  ],
  neet: [
    { id: "neet-1", prompt: "Functional unit of kidney is:", choices: ["Neuron", "Nephron", "Alveolus", "Villus"], correctIndex: 1, skillTag: "biology" },
    { id: "neet-2", prompt: "Normal pH of human blood is approximately:", choices: ["6.8", "7.0", "7.4", "8.0"], correctIndex: 2, skillTag: "biology" },
    { id: "neet-3", prompt: "Which vitamin is synthesized in skin with sunlight?", choices: ["A", "C", "D", "K"], correctIndex: 2, skillTag: "biology" },
    { id: "neet-4", prompt: "Avogadro number Nₐ ≈", choices: ["6.02 × 10²³", "3 × 10⁸", "1.6 × 10⁻¹⁹", "9.8"], correctIndex: 0, skillTag: "chemistry" },
    { id: "neet-5", prompt: "Insulin is produced by:", choices: ["Alpha cells", "Beta cells of pancreas", "Adrenal cortex", "Thyroid"], correctIndex: 1, skillTag: "biology" },
    { id: "neet-6", prompt: "Ohm's law: V =", choices: ["IR", "I/R", "R/I", "I²R only always"], correctIndex: 0, skillTag: "physics" },
    { id: "neet-7", prompt: "DNA replication is:", choices: ["Conservative", "Semi-conservative", "Dispersive only", "Random"], correctIndex: 1, skillTag: "biology" },
    { id: "neet-8", prompt: "Strongest intermolecular force among these in water is:", choices: ["London dispersion only", "Hydrogen bonding", "Ionic bond within molecules", "Metallic bonding"], correctIndex: 1, skillTag: "chemistry" },
  ],
  "gaokao-math": [
    { id: "gk-1", prompt: "集合 {1,2,3} 的子集个数是:", choices: ["6", "7", "8", "9"], correctIndex: 2, skillTag: "sets" },
    { id: "gk-2", prompt: "函数 f(x)=x² 在 x=0 处的导数是:", choices: ["0", "1", "2", "不存在"], correctIndex: 0, skillTag: "calculus" },
    { id: "gk-3", prompt: "等差数列首项2，公差3，第5项是:", choices: ["11", "14", "17", "20"], correctIndex: 1, skillTag: "sequences" },
    { id: "gk-4", prompt: "sin(π/2) =", choices: ["0", "1/2", "1", "-1"], correctIndex: 2, skillTag: "trigonometry" },
    { id: "gk-5", prompt: "log₂(8) =", choices: ["2", "3", "4", "8"], correctIndex: 1, skillTag: "logarithms" },
    { id: "gk-6", prompt: "椭圆 x²/4 + y²/1 = 1 的焦点在:", choices: ["x轴", "y轴", "原点", "无焦点"], correctIndex: 0, skillTag: "conics" },
    { id: "gk-7", prompt: "排列 P(5,2) =", choices: ["10", "20", "25", "120"], correctIndex: 1, skillTag: "combinatorics" },
    { id: "gk-8", prompt: "向量 (3,4) 的模长是:", choices: ["5", "7", "12", "25"], correctIndex: 0, skillTag: "vectors" },
  ],
  "mcat-sample": [
    { id: "mc-1", prompt: "Amino acids at physiological pH (~7.4) primarily exist as:", choices: ["Neutral molecules", "Zwitterions", "Only cations", "Only anions"], correctIndex: 1, skillTag: "biochemistry" },
    { id: "mc-2", prompt: "Which enzyme class catalyzes oxidation-reduction reactions?", choices: ["Hydrolases", "Oxidoreductases", "Ligases", "Isomerases"], correctIndex: 1, skillTag: "biochemistry" },
    { id: "mc-3", prompt: "In the lungs, oxygen diffuses from alveoli to blood along:", choices: ["Concentration gradient", "Against gradient actively always", "Only via osmosis", "Only through lymph"], correctIndex: 0, skillTag: "biology" },
    { id: "mc-4", prompt: "Bernoulli's principle relates pressure and:", choices: ["Fluid velocity", "Magnetic field", "Nuclear spin", "Enzyme kinetics only"], correctIndex: 0, skillTag: "physics" },
    { id: "mc-5", prompt: "Operant conditioning was emphasized by:", choices: ["Pavlov", "Skinner", "Freud", "Piaget"], correctIndex: 1, skillTag: "psychology" },
    { id: "mc-6", prompt: "pKa is the pH at which an acid is:", choices: ["Fully protonated", "50% deprotonated", "Always ionized", "Unrelated to Ka"], correctIndex: 1, skillTag: "chemistry" },
    { id: "mc-7", prompt: "The primary function of myelin is to:", choices: ["Increase speed of action potentials", "Produce neurotransmitters", "Digest proteins", "Store glucose"], correctIndex: 0, skillTag: "biology" },
    { id: "mc-8", prompt: "An passage author implies X; the question asks for the assumption. Best approach:", choices: ["Pick the most extreme answer", "Identify unstated premise linking evidence to conclusion", "Ignore the conclusion", "Choose longest option"], correctIndex: 1, skillTag: "cars" },
  ],
  "lsat-sample": [
    { id: "ls-1", prompt: "All managers are analysts. Some analysts are consultants. Which must be true?", choices: ["All consultants are managers", "Some managers may be consultants", "No managers are consultants", "All analysts are managers"], correctIndex: 1, skillTag: "logic" },
    { id: "ls-2", prompt: "If A then B. Not B. Therefore:", choices: ["A", "Not A", "B", "Neither"], correctIndex: 1, skillTag: "logic" },
    { id: "ls-3", prompt: "A flaw of 'appeal to popularity' is:", choices: ["Attacking the person", "Assuming truth because many believe it", "False dichotomy", "Circular reasoning only"], correctIndex: 1, skillTag: "reasoning" },
    { id: "ls-4", prompt: "Strengthen the argument: best choice will:", choices: ["Introduce unrelated facts", "Bridge evidence and conclusion", "Contradict the conclusion", "Attack the author"], correctIndex: 1, skillTag: "reasoning" },
    { id: "ls-5", prompt: "Five people sit in a row. A is left of B. C is right of B. D is not adjacent to A. Which is possible?", choices: ["A-B-C-D-E", "D-A-B-C-E", "A-C-B-D-E", "B-A-D-C-E"], correctIndex: 1, skillTag: "logic-games" },
    { id: "ls-6", prompt: "Necessary assumption questions ask for a statement that:", choices: ["Must be false if argument is true", "Must be true for argument to work", "Is the conclusion", "Summarizes evidence only"], correctIndex: 1, skillTag: "reasoning" },
  ],
  "gmat-quant": [
    { id: "gm-1", prompt: "If x is 20% greater than y, then y is what percent less than x?", choices: ["16.67%", "20%", "25%", "80%"], correctIndex: 0, skillTag: "percent" },
    { id: "gm-2", prompt: "A pipe fills a tank in 6 hours; another in 3 hours. Together, hours to fill:", choices: ["2", "2.5", "3", "4.5"], correctIndex: 0, skillTag: "rates" },
    { id: "gm-3", prompt: "How many ways to arrange the letters AAB?", choices: ["3", "4", "6", "9"], correctIndex: 0, skillTag: "combinatorics" },
    { id: "gm-4", prompt: "If |x-2| < 3, then x is in:", choices: ["(-1, 5)", "(2, 3)", "[-1, 5]", "(0, 6)"], correctIndex: 0, skillTag: "algebra" },
    { id: "gm-5", prompt: "Profit = Revenue - Cost. If R=500, margin 40%, cost is:", choices: ["200", "300", "350", "400"], correctIndex: 1, skillTag: "word-problems" },
    { id: "gm-6", prompt: "Is n odd? (1) n² is odd. (2) n+1 is even.", choices: ["Statement 1 alone sufficient", "Statement 2 alone sufficient", "Both together only", "Each alone sufficient"], correctIndex: 3, skillTag: "data-sufficiency" },
  ],
  "gre-verbal": [
    { id: "gr-1", prompt: "Select two words that produce similar sentences: The critic's review was ___ rather than constructive.", choices: ["laudatory / harsh (pair 1)", "vitriolic / acerbic (pair 2)", "vitriolic / supportive", "neutral / acerbic"], correctIndex: 1, skillTag: "sentence-equivalence" },
    { id: "gr-2", prompt: "Benevolent most nearly means:", choices: ["Cruel", "Kind", "Confused", "Wealthy"], correctIndex: 1, skillTag: "vocabulary" },
    { id: "gr-3", prompt: "The author 'qualifies' a claim by:", choices: ["Rejecting all evidence", "Adding limits or exceptions", "Repeating the thesis", "Changing the topic"], correctIndex: 1, skillTag: "reading" },
    { id: "gr-4", prompt: "Text completion: Despite initial ___, the project eventually succeeded.", choices: ["success", "setbacks", "funding", "praise"], correctIndex: 1, skillTag: "completion" },
    { id: "gr-5", prompt: "Analogy: Surgeon : Scalpel :: Writer :", choices: ["Hospital", "Pen", "Patient", "Surgery"], correctIndex: 1, skillTag: "analogy" },
    { id: "gr-6", prompt: "Primary purpose questions ask for:", choices: ["Author's main goal in the passage", "Every detail listed", "Dictionary definition of one word", "Opposite of the thesis"], correctIndex: 0, skillTag: "reading" },
  ],
  "nclex-rn": [
    { id: "nx-1", prompt: "Priority action for a patient with suspected anaphylaxis:", choices: ["Oral antihistamine only", "Epinephrine per protocol", "Wait for rash to spread", "High-flow oxygen only without meds"], correctIndex: 1, skillTag: "emergency" },
    { id: "nx-2", prompt: "Normal range for adult respiratory rate (breaths/min) is approximately:", choices: ["8-12", "12-20", "24-30", "30-40"], correctIndex: 1, skillTag: "assessment" },
    { id: "nx-3", prompt: "Before administering digoxin, the nurse should assess:", choices: ["Blood glucose", "Apical pulse for 1 minute", "Deep tendon reflexes only", "Visual acuity"], correctIndex: 1, skillTag: "pharmacology" },
    { id: "nx-4", prompt: "Contact precautions are required for:", choices: ["Measles", "MRSA wound infection", "TB", "Chickenpox"], correctIndex: 1, skillTag: "infection-control" },
    { id: "nx-5", prompt: "A patient on warfarin should avoid sudden increases in intake of:", choices: ["Vitamin K-rich foods without monitoring", "Water", "Protein only", "Fiber always"], correctIndex: 0, skillTag: "pharmacology" },
    { id: "nx-6", prompt: "Maslow's hierarchy: after physiological needs, priority is often:", choices: ["Self-actualization", "Safety", "Esteem only", "Aesthetics"], correctIndex: 1, skillTag: "fundamentals" },
  ],
  "hsc-nsw": [
    { id: "hs-1", prompt: "Solve x² - 5x + 6 = 0", choices: ["x=2,3", "x=1,6", "x=-2,-3", "x=0,5"], correctIndex: 0, skillTag: "algebra" },
    { id: "hs-2", prompt: "Derivative of sin(x) is:", choices: ["cos(x)", "-cos(x)", "sin(x)", "-sin(x)"], correctIndex: 0, skillTag: "calculus" },
    { id: "hs-3", prompt: "In a right triangle, tan(θ) =", choices: ["opp/adj", "adj/opp", "hyp/opp", "opp/hyp only"], correctIndex: 0, skillTag: "trigonometry" },
    { id: "hs-4", prompt: "Probability of heads on a fair coin twice in a row:", choices: ["1/4", "1/2", "3/4", "1"], correctIndex: 0, skillTag: "probability" },
    { id: "hs-5", prompt: "The discriminant b²-4ac < 0 means roots are:", choices: ["Real and distinct", "Real and equal", "Complex conjugates", "Always integers"], correctIndex: 2, skillTag: "quadratics" },
    { id: "hs-6", prompt: "∫₀² x dx =", choices: ["1", "2", "4", "8"], correctIndex: 1, skillTag: "calculus" },
  ],
};

export function getBankItems(testId: string, count = 10): BankItem[] {
  const bank = BANKS[testId];
  if (!bank?.length) return [];
  if (bank.length <= count) return bank;
  const shuffled = [...bank].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function hasQuestionBank(testId: string): boolean {
  return (BANKS[testId]?.length ?? 0) >= 5;
}

export function allBankTestIds(): string[] {
  return Object.keys(BANKS);
}
