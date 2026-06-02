import { buildSystemPrompt } from "@/lib/tutor-prompt";
import { demoTutorReply } from "@/lib/demo-tutor";
import type { SubjectId } from "@/lib/types";
import { z } from "zod";
import { NextResponse } from "next/server";

const requestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().min(1).max(8000),
    })
  ),
  subject: z.enum([
    "math",
    "science",
    "english",
    "history",
    "cs",
    "languages",
    "other",
  ]),
  gradeLevel: z.string().max(80).optional(),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { messages, subject, gradeLevel } = parsed.data;
  const lastUser = [...messages].reverse().find((m) => m.role === "user");

  if (!lastUser) {
    return NextResponse.json({ error: "No user message" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl =
    process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  if (!apiKey) {
    const content = demoTutorReply(lastUser.content, subject as SubjectId);
    return NextResponse.json({
      message: { role: "assistant" as const, content },
      mode: "demo" as const,
    });
  }

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        max_tokens: 1024,
        messages: [
          {
            role: "system",
            content: buildSystemPrompt(subject as SubjectId, gradeLevel),
          },
          ...messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("LLM error:", res.status, errText);
      return NextResponse.json(
        { error: "Tutor unavailable. Try again shortly." },
        { status: 502 }
      );
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content =
      data.choices?.[0]?.message?.content?.trim() ||
      "I couldn't form a response. Can you rephrase your question?";

    return NextResponse.json({
      message: { role: "assistant" as const, content },
      mode: "live" as const,
    });
  } catch (e) {
    console.error("Tutor fetch failed:", e);
    return NextResponse.json(
      { error: "Tutor unavailable. Try again shortly." },
      { status: 502 }
    );
  }
}
