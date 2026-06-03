import { demoQuiz } from "@/lib/demo-generators";
import { chatCompletion, parseJsonArray } from "@/lib/llm";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import {
  formatStudentContextForPrompt,
  type StudentLearningContext,
} from "@/lib/student-profile";
import { studentContextSchema } from "@/lib/student-context-schema";
import type { QuizQuestion, SubjectId } from "@/lib/types";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  subject: z.enum([
    "math",
    "science",
    "english",
    "history",
    "cs",
    "languages",
    "other",
  ]),
  topic: z.string().max(200).optional(),
  phase: z.enum(["pre", "post"]),
  transcript: z.string().max(12000).optional(),
  studentContext: studentContextSchema,
});

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limited = rateLimit(`quiz-gen:${ip}`, {
    limit: 40,
    windowMs: 60 * 60 * 1000,
  });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429 }
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { subject, topic, phase, transcript, studentContext } = parsed.data;
  let questions: QuizQuestion[] = [];

  const studentBlock = studentContext
    ? formatStudentContextForPrompt({
        streakDays: studentContext.streakDays,
        totalSessions: studentContext.totalSessions,
        latestLift: studentContext.latestLift ?? null,
        preScoreToday: studentContext.preScoreToday ?? null,
        weakTopics: (studentContext.weakTopics ?? []) as StudentLearningContext["weakTopics"],
        strongTopics: (studentContext.strongTopics ?? []) as StudentLearningContext["strongTopics"],
        recentTopics: (studentContext.recentTopics ?? []) as StudentLearningContext["recentTopics"],
      })
    : "";

  const difficultyHint =
    phase === "pre" && studentContext?.preScoreToday != null
      ? ""
      : phase === "pre" && studentContext?.weakTopics?.length
        ? "Focus slightly more on weak areas from the student graph."
        : phase === "post"
          ? "Questions should reflect what was discussed in the session."
          : "Questions assess baseline before studying.";

  const llmRaw = await chatCompletion(
    `Create exactly 3 multiple-choice quiz questions for a student (${phase}-session).
Topic/subject provided. Output ONLY JSON array with objects:
{ "id": "1", "question": "...", "options": ["A","B","C","D"], "correctIndex": 0-3, "explanation": "..." }
${difficultyHint}`,
    `Subject: ${subject}\nTopic: ${topic ?? "general"}\n${studentBlock ? `${studentBlock}\n` : ""}${transcript ? `Session:\n${transcript}` : ""}`
  );

  if (llmRaw) {
    const parsedQ = parseJsonArray<QuizQuestion>(llmRaw);
    if (parsedQ?.length) {
      questions = parsedQ.slice(0, 5);
    }
  }

  if (questions.length === 0) {
    questions = demoQuiz(subject as SubjectId, topic);
  }

  return NextResponse.json({ questions, phase });
}
