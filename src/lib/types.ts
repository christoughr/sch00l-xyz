export type SubjectId =
  | "math"
  | "science"
  | "english"
  | "history"
  | "cs"
  | "languages"
  | "other";

export interface Subject {
  id: SubjectId;
  label: string;
  emoji: string;
  description: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface StudySession {
  id: string;
  subject: SubjectId;
  startedAt: string;
  endedAt?: string;
  messageCount: number;
  minutesStudied: number;
}

export interface MasteryTopic {
  subject: SubjectId;
  topic: string;
  confidence: number; // 0–100, acquisition-valuable signal
  lastPracticed: string;
}

export interface StudentProgress {
  streakDays: number;
  lastStudyDate: string | null;
  totalMinutes: number;
  totalSessions: number;
  sessions: StudySession[];
  mastery: MasteryTopic[];
}

export interface Flashcard {
  id: string;
  subject: SubjectId;
  front: string;
  back: string;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  nextReviewAt: string;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizResult {
  id: string;
  subject: SubjectId;
  topic?: string;
  phase: "pre" | "post";
  score: number;
  total: number;
  sessionId?: string;
  skipped?: boolean;
  createdAt: string;
}
