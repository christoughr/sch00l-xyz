import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ cards: [], mode: "local" as const });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("flashcards")
    .select("*")
    .eq("user_id", user.id)
    .order("next_review_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }

  return NextResponse.json({ cards: data ?? [], mode: "cloud" as const });
}

const reviewSchema = z.object({
  id: z.string().uuid(),
  ease_factor: z.number(),
  interval_days: z.number().int(),
  repetitions: z.number().int(),
  next_review_at: z.string(),
});

export async function PATCH(req: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ ok: true, mode: "local" as const });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = reviewSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  const { error } = await supabase
    .from("flashcards")
    .update({
      ease_factor: parsed.data.ease_factor,
      interval_days: parsed.data.interval_days,
      repetitions: parsed.data.repetitions,
      next_review_at: parsed.data.next_review_at,
    })
    .eq("id", parsed.data.id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
