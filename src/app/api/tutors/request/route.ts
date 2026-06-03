import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { notifyFounder } from "@/lib/founder-notify";
import { buildSessionHandoffSummary } from "@/lib/tutor-handoff";
import { chatCompletion } from "@/lib/llm";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { zSubjectId } from "@/lib/subject-schema";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  subject: zSubjectId,
  topic: z.string().max(120).optional(),
  transcript: z.string().max(12000).optional(),
  sessionSummary: z.string().max(4000).optional(),
  preScore: z.number().int().min(0).max(100).optional(),
  postScore: z.number().int().min(0).max(100).optional(),
  urgency: z.enum(["normal", "before_test"]).default("normal"),
  summarize: z.boolean().optional(),
});

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limited = rateLimit(`tutor-request:${ip}`, {
    limit: 10,
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

  const data = parsed.data;
  let summary =
    data.sessionSummary?.trim() ||
    (data.transcript
      ? buildSessionHandoffSummary(data.transcript, data.topic)
      : "No session context provided.");

  if (data.summarize && data.transcript) {
    const aiSummary = await chatCompletion(
      `Summarize this student AI tutoring session for a human tutor handoff.
Include: topic, where they're stuck, what was tried, recommended focus.
Max 120 words. Plain text.`,
      `Subject: ${data.subject}\nTopic: ${data.topic ?? "unknown"}\n\n${data.transcript.slice(-4000)}`,
      { maxTokens: 200, temperature: 0.3 }
    );
    if (aiSummary) summary = aiSummary;
  }

  const supabase = await createClient();
  const admin = createAdminClient();
  const client = admin ?? supabase;

  let userId: string | null = null;
  let studentEmail = data.email.toLowerCase().trim();

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;
    if (user?.email) studentEmail = user.email;
  }

  if (client) {
    const { error } = await client.from("tutor_requests").insert({
      user_id: userId,
      student_email: studentEmail,
      subject: data.subject,
      topic: data.topic ?? null,
      session_summary: summary,
      pre_score: data.preScore ?? null,
      post_score: data.postScore ?? null,
      urgency: data.urgency,
      status: "open",
    });

    if (error) {
      console.error("Tutor request insert:", error);
      return NextResponse.json(
        { error: "Could not submit request" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      mode: "cloud" as const,
      message: "Request sent. A human tutor will reach out soon.",
    });
  }

  await notifyFounder({
    kind: "tutor_request",
    summary: "New human tutor request",
    fields: {
      email: studentEmail,
      subject: data.subject,
      topic: data.topic ?? null,
      urgency: data.urgency,
      pre_score: data.preScore ?? null,
      post_score: data.postScore ?? null,
    },
  });

  return NextResponse.json({
    ok: true,
    mode: "local" as const,
    message:
      "Request saved on this device. We'll match you when human tutors go live.",
    summary,
  });
}
