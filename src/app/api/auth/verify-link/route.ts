import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { EmailOtpType } from "@supabase/supabase-js";

const schema = z.object({
  token_hash: z.string().min(10),
  type: z.enum([
    "magiclink",
    "email",
    "signup",
    "invite",
    "recovery",
    "email_change",
  ]),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Auth not configured" }, { status: 503 });
  }

  const { token_hash, type } = parsed.data;
  const { error } = await supabase.auth.verifyOtp({
    token_hash,
    type: type as EmailOtpType,
  });

  if (error) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code ?? "verify_failed",
      },
      { status: 401 }
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let redirect = "/study";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_complete")
      .eq("id", user.id)
      .single();
    if (!profile?.onboarding_complete) {
      redirect = "/onboarding";
    }
  }

  return NextResponse.json({ ok: true, redirect });
}
