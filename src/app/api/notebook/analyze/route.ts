import { chatCompletion } from "@/lib/llm";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  title: z.string().max(120).optional(),
  content: z.string().min(80).max(48000),
  mode: z.enum(["summary", "qa", "quiz", "outline"]).default("summary"),
  question: z.string().max(500).optional(),
});

const MODE_PROMPTS: Record<string, string> = {
  summary: `You are sch00l Study Notebook. Summarize the student's source material in clear study notes.
Use markdown with: ## Key ideas, ## Important terms, ## How to remember, ## Practice prompts.
Paraphrase — do not copy long passages verbatim. Keep it scannable for a high school or college student.`,
  outline: `Create a structured study outline from the source. Use numbered sections and bullet points.
Highlight definitions, formulas, and cause/effect. Paraphrase in original words.`,
  qa: `Answer the student's question using ONLY the provided source material.
If the source does not contain enough information, say so briefly and suggest what to add.
Be concise, accurate, and cite which section of the notes supports your answer.`,
  quiz: `Create 5 multiple-choice study questions from the source material.
Return ONLY a JSON array of objects: { "prompt", "choices" (4 strings), "correctIndex" (0-3), "explanation" }.
Questions must test understanding, not verbatim recall of odd phrases.`,
};

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limited = rateLimit(`notebook-analyze:${ip}`, {
    limit: 20,
    windowMs: 60 * 60 * 1000,
  });
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { title, content, mode, question } = parsed.data;
  const excerpt = content.slice(0, 12000);

  const userPrompt =
    mode === "qa"
      ? `Title: ${title ?? "Study notes"}\nQuestion: ${question ?? "Explain the main ideas."}\n\nSource:\n"""\n${excerpt}\n"""`
      : `Title: ${title ?? "Study notes"}\n\nSource:\n"""\n${excerpt}\n"""`;

  const raw = await chatCompletion(MODE_PROMPTS[mode], userPrompt, {
    maxTokens: mode === "quiz" ? 1800 : 1400,
    temperature: 0.4,
  });

  if (!raw?.trim()) {
    return NextResponse.json(
      { error: "Could not analyze notes. Try a shorter excerpt." },
      { status: 503 }
    );
  }

  return NextResponse.json({ mode, result: raw.trim() });
}
