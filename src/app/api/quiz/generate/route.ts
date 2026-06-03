import { demoQuiz } from "@/lib/demo-generators";
import { chatCompletion, parseJsonArray } from "@/lib/llm";
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
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { subject, topic, phase, transcript } = parsed.data;
  let questions: QuizQuestion[] = [];

  const llmRaw = await chatCompletion(
    `Create exactly 3 multiple-choice quiz questions for a student (${phase}-session).
Topic/subject provided. Output ONLY JSON array with objects:
{ "id": "1", "question": "...", "options": ["A","B","C","D"], "correctIndex": 0-3, "explanation": "..." }
${phase === "post" ? "Questions should reflect what was discussed in the session." : "Questions assess baseline before studying."}`,
    `Subject: ${subject}\nTopic: ${topic ?? "general"}\n${transcript ? `Session:\n${transcript}` : ""}`
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
