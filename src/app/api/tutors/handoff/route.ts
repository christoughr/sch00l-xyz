import { chatCompletion } from "@/lib/llm";
import { buildSessionHandoffSummary } from "@/lib/tutor-handoff";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  transcript: z.string().max(12000),
  topic: z.string().max(120).optional(),
  subject: z.string().max(40).optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { transcript, topic, subject } = parsed.data;
  const fallback = buildSessionHandoffSummary(transcript, topic);

  const aiSummary = await chatCompletion(
    `Summarize this student AI tutoring session for a human tutor handoff.
Include: topic, where they're stuck, what was tried, recommended focus.
Max 120 words. Plain text, bullet-friendly.`,
    `Subject: ${subject ?? "unknown"}\nTopic: ${topic ?? "unknown"}\n\n${transcript.slice(-4000)}`,
    { maxTokens: 200, temperature: 0.3 }
  );

  return NextResponse.json({
    summary: aiSummary ?? fallback,
    mode: aiSummary ? ("live" as const) : ("local" as const),
  });
}
