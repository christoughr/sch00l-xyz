import type { QuizQuestion, SubjectId } from "./types";

const SCIENCE: QuizQuestion[] = [
  {
    id: "1",
    question: "Which best describes the role of enzymes in biological reactions?",
    options: [
      "They are consumed in the reaction",
      "They lower activation energy without being consumed",
      "They increase activation energy",
      "They only work at 0°C",
    ],
    correctIndex: 1,
    explanation: "Enzymes are biological catalysts — they speed reactions by lowering activation energy.",
  },
  {
    id: "2",
    question: "A controlled experiment requires:",
    options: [
      "No independent variable",
      "A control group for comparison",
      "Only one trial",
      "No data collection",
    ],
    correctIndex: 1,
    explanation: "Controls isolate the effect of the independent variable.",
  },
  {
    id: "3",
    question: "When interpreting a graph of rate vs temperature, an enzyme denaturing shows:",
    options: [
      "Rate increases forever",
      "Rate peaks then drops sharply at high temperature",
      "Rate is always zero",
      "Rate is unrelated to temperature",
    ],
    correctIndex: 1,
    explanation: "High heat disrupts protein structure, reducing enzyme activity.",
  },
];

const MATH: QuizQuestion[] = [
  {
    id: "1",
    question: "What is the first step when solving a multi-step equation?",
    options: [
      "Guess the answer",
      "Identify what you know and what you need",
      "Skip to the final step",
      "Memorize the answer key",
    ],
    correctIndex: 1,
    explanation: "Problem-solving starts with understanding givens and the goal.",
  },
  {
    id: "2",
    question: "The derivative of x² is:",
    options: ["x", "2x", "x²", "2"],
    correctIndex: 1,
    explanation: "Power rule: d/dx(x^n) = nx^(n-1).",
  },
  {
    id: "3",
    question: "Which value satisfies |x - 3| = 5?",
    options: ["x = 8 only", "x = -2 only", "x = 8 or x = -2", "x = 3"],
    correctIndex: 2,
    explanation: "Absolute value equations often have two solutions.",
  },
];

const ENGLISH: QuizQuestion[] = [
  {
    id: "1",
    question: "A strong thesis statement should be:",
    options: [
      "A vague summary",
      "Specific, arguable, and defensible",
      "A list of quotes only",
      "The last sentence only always",
    ],
    correctIndex: 1,
    explanation: "Thesis = claim you will support with evidence.",
  },
  {
    id: "2",
    question: "Evidence in an essay should:",
    options: [
      "Replace analysis",
      "Support the claim and be explained",
      "Be unrelated to the thesis",
      "Never be cited",
    ],
    correctIndex: 1,
    explanation: "Evidence + reasoning = argument.",
  },
  {
    id: "3",
    question: "Tone refers to:",
    options: [
      "The author's attitude toward the subject",
      "Only grammar errors",
      "Word count",
      "Font choice",
    ],
    correctIndex: 0,
    explanation: "Tone is how the writer feels about the topic (formal, ironic, urgent, etc.).",
  },
];

const HISTORY: QuizQuestion[] = [
  {
    id: "1",
    question: "Sourcing a historical document means:",
    options: [
      "Ignoring who wrote it",
      "Considering author, audience, purpose, and context",
      "Only reading the title",
      "Memorizing dates only",
    ],
    correctIndex: 1,
    explanation: "Historical thinking requires contextualizing sources.",
  },
  {
    id: "2",
    question: "Causation in history asks:",
    options: [
      "What happened after only",
      "What factors led to an event and with what effects",
      "Which date is longest",
      "Who had the most power always",
    ],
    correctIndex: 1,
    explanation: "Causation links events, conditions, and consequences.",
  },
  {
    id: "3",
    question: "A strong historical argument includes:",
    options: [
      "Thesis + specific evidence + analysis",
      "Only a timeline",
      "Opinion without evidence",
      "One source only",
    ],
    correctIndex: 0,
    explanation: "Historical writing requires claim, evidence, and reasoning.",
  },
];

const BY_SUBJECT: Partial<Record<SubjectId, QuizQuestion[]>> = {
  math: MATH,
  science: SCIENCE,
  english: ENGLISH,
  history: HISTORY,
  statistics: MATH,
  cs: MATH,
  economics: HISTORY,
  psychology: SCIENCE,
  geography: HISTORY,
  health: SCIENCE,
  engineering: MATH,
  social_studies: HISTORY,
};

function personalizeQuestion(q: QuizQuestion, topic: string): QuizQuestion {
  return {
    ...q,
    question: q.question.replace("this topic", topic).includes(topic)
      ? q.question
      : `${q.question} (Topic: ${topic.slice(0, 80)})`,
  };
}

export function subjectDemoQuiz(
  subject: SubjectId,
  topic?: string
): QuizQuestion[] {
  const t = topic?.trim() || subject;
  const bank = BY_SUBJECT[subject] ?? SCIENCE;
  return bank.map((q) => personalizeQuestion(q, t));
}
