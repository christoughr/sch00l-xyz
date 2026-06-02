import { createClient } from "@/lib/supabase/server";
import { demoFlashcardsFromChat } from "@/lib/demo-generators";
import { chatCompletion, parseJsonArray } from "@/lib/llm";
import type { SubjectId } from "@/lib/types";
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
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { subject, messages } = parsed.data;
  const transcript = messages
    .slice(-12)
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");
  const userLines = messages.filter((m) => m.role === "user").map((m) => m.content);

  let cards: { front: string; back: string }[] = [];

  const llmRaw = await chatCompletion(
    `You create study flashcards for students. Output ONLY a JSON array of 4-6 objects with "front" and "back" strings.
Front = question/prompt. Back = concise answer (1-3 sentences). Based on the study session, focus on concepts they discussed — not trivia.`,
    `Subject: ${subject}\n\nSession:\n${transcript}`
  );

  if (llmRaw) {
    const parsedCards = parseJsonArray<{ front: string; back: string }>(llmRaw);
    if (parsedCards?.length) {
      cards = parsedCards.filter((c) => c.front && c.back).slice(0, 8);
    }
  }

  if (cards.length === 0) {
    cards = demoFlashcardsFromChat(subject as SubjectId, userLines);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (supabase && user) {
    const rows = cards.map((c) => ({
      user_id: user.id,
      subject,
      front: c.front,
      back: c.back,
      next_review_at: new Date().toISOString(),
    }));
    const { data, error } = await supabase.from("flashcards").insert(rows).select();
    if (error) {
      console.error("Flashcard insert:", error);
    } else {
      return NextResponse.json({ cards: data, mode: "cloud" as const });
    }
  }

  return NextResponse.json({ cards, mode: "local" as const });
}
