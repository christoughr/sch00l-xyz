import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  subject: z.string(),
  topic: z.string().optional(),
  phase: z.enum(["pre", "post"]),
  score: z.number().int().min(0),
  total: z.number().int().min(1),
  answers: z.record(z.string(), z.number()).optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ ok: true, mode: "local" as const });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("quiz_results").insert({
    user_id: user?.id ?? null,
    subject: parsed.data.subject,
    topic: parsed.data.topic ?? null,
    phase: parsed.data.phase,
    score: parsed.data.score,
    total: parsed.data.total,
    answers: parsed.data.answers ?? null,
  });

  if (error) {
    console.error("Quiz submit:", error);
    return NextResponse.json({ error: "Could not save result" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, mode: "cloud" as const });
}
