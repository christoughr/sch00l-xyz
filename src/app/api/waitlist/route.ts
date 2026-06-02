import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  source: z.string().max(40).optional(),
  referral: z.string().max(80).optional(),
  is_edu: z.boolean().optional(),
});

const WAITLIST_LOCAL_KEY = "sch00l_waitlist_pending";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const { email, source, referral, is_edu } = parsed.data;
  const normalized = email.toLowerCase().trim();
  const edu =
    is_edu ?? /\.(edu|ac\.[a-z]{2}|school\.[a-z]{2})$/i.test(normalized);

  const supabase = await createClient();
  if (supabase) {
    const { error } = await supabase.from("waitlist").insert({
      email: normalized,
      source: source ?? "landing",
      referral: referral ?? null,
      is_edu: edu,
    });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({
          ok: true,
          message: "You're already on the list!",
        });
      }
      console.error("Waitlist insert:", error);
      return NextResponse.json(
        { error: "Could not join waitlist. Try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "You're on the waitlist. We'll email you at launch.",
    });
  }

  return NextResponse.json({
    ok: true,
    message:
      "Saved locally — configure Supabase to persist waitlist emails.",
    mode: "local" as const,
    hint: WAITLIST_LOCAL_KEY,
  });
}
