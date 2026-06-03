import { chatCompletion } from "@/lib/llm";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { zSubjectId } from "@/lib/subject-schema";
import { transcriptToMessages } from "@/lib/session-complete";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  subject: zSubjectId,
  topic: z.string().max(200).optional(),
  transcript: z.string().max(16000),
  preScore: z.number().int().min(0).max(100).optional(),
  postScore: z.number().int().min(0).max(100).optional(),
  liftLabel: z.string().max(80).optional(),
});

function ruleBasedSummary(
  topic: string,
  transcript: string,
  liftLabel?: string
): string {
  const msgs = transcriptToMessages(transcript);
  const userLines = msgs
    .filter((m) => m.role === "user")
    .map((m) => m.content.trim())
    .filter((m) => m.length > 8)
    .slice(0, 3);
  const focus = topic || "this topic";
  const struggles =
    userLines.length > 0
      ? `Asked about: ${userLines.map((l) => l.slice(0, 80)).join("; ")}.`
      : "Brief session with limited chat.";
  const lift = liftLabel ? ` Learning lift: ${liftLabel}.` : "";
  return `Studied ${focus}. ${struggles}${lift}`.slice(0, 400);
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limited = rateLimit(`session-summarize:${ip}`, {
    limit: 30,
    windowMs: 60 * 60 * 1000,
  });
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { subject, topic, transcript, preScore, postScore, liftLabel } =
    parsed.data;
  const topicLabel = topic?.trim() || subject;

  const llmRaw = await chatCompletion(
    `Summarize this study session in 2-3 sentences for the student's future tutor. Include: what they struggled with, what improved, concepts named. No bullet lists. Max 350 characters.`,
    `Topic: ${topicLabel}\nPre-quiz: ${preScore ?? "skipped"}%\nPost-quiz: ${postScore ?? "n/a"}%\n${liftLabel ? `Lift: ${liftLabel}\n` : ""}\nTranscript (excerpt):\n${transcript.slice(-6000)}`
  );

  const summary =
    llmRaw?.trim().slice(0, 400) ??
    ruleBasedSummary(topicLabel, transcript, liftLabel);

  return NextResponse.json({ summary });
}
