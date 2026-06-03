import { latestQuizLiftLocal } from "./quiz-local";
import { loadProgress } from "./progress";
import type { StudentProgress, SubjectId } from "./types";

/** Serializable learning graph sent to tutor/quiz APIs */
export type StudentLearningContext = {
  streakDays: number;
  totalSessions: number;
  latestLift: string | null;
  preScoreToday: number | null;
  weakTopics: { subject: SubjectId; topic: string; confidence: number }[];
  strongTopics: { subject: SubjectId; topic: string; confidence: number }[];
  recentTopics: { subject: SubjectId; topic: string; confidence: number }[];
};

export function buildStudentLearningContext(
  progress: StudentProgress,
  opts?: {
    subject?: SubjectId;
    latestLift?: string | null;
    preScoreToday?: number | null;
  }
): StudentLearningContext {
  const subject = opts?.subject;
  let mastery = progress.mastery;
  if (subject) {
    mastery = mastery.filter((m) => m.subject === subject);
  }

  const sorted = [...mastery].sort((a, b) => a.confidence - b.confidence);
  const weakTopics = sorted
    .filter((m) => m.confidence < 55)
    .slice(0, 5)
    .map((m) => ({
      subject: m.subject,
      topic: m.topic,
      confidence: m.confidence,
    }));

  const strongTopics = [...mastery]
    .sort((a, b) => b.confidence - a.confidence)
    .filter((m) => m.confidence >= 70)
    .slice(0, 3)
    .map((m) => ({
      subject: m.subject,
      topic: m.topic,
      confidence: m.confidence,
    }));

  const recentTopics = [...mastery]
    .sort(
      (a, b) =>
        new Date(b.lastPracticed).getTime() -
        new Date(a.lastPracticed).getTime()
    )
    .slice(0, 5)
    .map((m) => ({
      subject: m.subject,
      topic: m.topic,
      confidence: m.confidence,
    }));

  return {
    streakDays: progress.streakDays,
    totalSessions: progress.totalSessions,
    latestLift: opts?.latestLift ?? null,
    preScoreToday: opts?.preScoreToday ?? null,
    weakTopics,
    strongTopics,
    recentTopics,
  };
}

export function formatStudentContextForPrompt(
  ctx: StudentLearningContext
): string {
  const lines: string[] = [
    "STUDENT LEARNING GRAPH (personalize — reference naturally, do not recite as a list):",
  ];

  if (ctx.totalSessions > 0) {
    lines.push(
      `- Study history: ${ctx.totalSessions} session(s), ${ctx.streakDays}-day streak.`
    );
  }

  if (ctx.latestLift) {
    lines.push(`- Latest measured learning lift: ${ctx.latestLift}.`);
  }

  if (ctx.preScoreToday !== null) {
    lines.push(
      `- Today's pre-quiz on this topic: ${ctx.preScoreToday}%. Calibrate hints — if low, build foundations; if high, go deeper.`
    );
  }

  if (ctx.weakTopics.length) {
    lines.push(
      "- Needs more practice: " +
        ctx.weakTopics
          .map((t) => `${t.topic} (${t.confidence}% confidence)`)
          .join("; ")
    );
  }

  if (ctx.strongTopics.length) {
    lines.push(
      "- Already solid: " +
        ctx.strongTopics
          .map((t) => `${t.topic} (${t.confidence}%)`)
          .join("; ")
    );
  }

  if (ctx.recentTopics.length && ctx.weakTopics.length === 0) {
    lines.push(
      "- Recently studied: " +
        ctx.recentTopics.map((t) => t.topic).join(", ")
    );
  }

  if (lines.length === 1) {
    return "";
  }

  lines.push(
    "Use this to adapt difficulty and connect to prior sessions. Celebrate lift when relevant."
  );
  return lines.join("\n");
}

/** Client-only: build context from localStorage for API calls */
export function getLocalStudentContext(opts?: {
  subject?: SubjectId;
  preScoreToday?: number | null;
}): StudentLearningContext {
  const progress = loadProgress();
  return buildStudentLearningContext(progress, {
    subject: opts?.subject,
    latestLift: latestQuizLiftLocal(),
    preScoreToday: opts?.preScoreToday ?? null,
  });
}

export function hasPersonalizationData(ctx: StudentLearningContext): boolean {
  return (
    ctx.totalSessions > 0 ||
    ctx.latestLift !== null ||
    ctx.preScoreToday != null ||
    ctx.weakTopics.length > 0 ||
    ctx.strongTopics.length > 0
  );
}
